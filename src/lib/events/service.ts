import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import {
  v1GetPendingEvents,
  v1GetUpcomingEvents,
  v1ModerateEvent,
  v1SubmitSceneEvent,
  v1ToggleEventRsvp,
} from '@/api/v1Phase4Client'
import { v1GetEventsByScene } from '@/api/v1Phase5Client'
import {
  localListEventsForScene,
  localListUpcomingEvents,
  localSubmitEvent,
  localToggleRsvp,
} from '@/lib/events/localEvents'
import { findCityBySlug } from '@/lib/discovery/sceneRegistry'
import type {
  EventFilters,
  PendingSceneEvent,
  SceneEvent,
  SubmitEventInput,
} from '@/lib/events/types'

function mapEventRow(row: Record<string, unknown>): SceneEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    eventKind: String(row.event_kind),
    sceneCity: String(row.scene_city),
    sceneGenreSlug: row.scene_genre_slug ? String(row.scene_genre_slug) : undefined,
    venueName: String(row.venue_name),
    startsAt: String(row.starts_at),
    externalUrl: String(row.external_url),
    rsvpCount: Number(row.rsvp_count ?? 0),
    viewerRsvped: Boolean(row.viewer_rsvped),
  }
}

function mapPendingRow(row: Record<string, unknown>): PendingSceneEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    eventKind: String(row.event_kind),
    sceneCity: String(row.scene_city),
    sceneGenreSlug: row.scene_genre_slug ? String(row.scene_genre_slug) : undefined,
    venueName: String(row.venue_name),
    startsAt: String(row.starts_at),
    externalUrl: String(row.external_url),
    submittedAt: String(row.submitted_at),
    submitterName: String(row.submitter_name),
    submitterHandle: String(row.submitter_handle),
  }
}

export async function fetchUpcomingEvents(
  filters: EventFilters = {},
  limit = 40,
  userId?: string
): Promise<SceneEvent[]> {
  if (!isSupabaseConfigured()) {
    return localListUpcomingEvents(filters, userId, limit)
  }

  return viaV1Api(
    async () => {
      const { events } = await v1GetUpcomingEvents({
        city: filters.city,
        genreSlug: filters.genreSlug,
        limit,
      })
      return events
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('events_upcoming', {
        p_city: filters.city ?? null,
        p_genre_slug: filters.genreSlug ?? null,
        p_days_ahead: 45,
        lim: limit,
      })

      if (error) {
        console.warn('[events] upcoming', error.message)
        return []
      }

      return (data ?? []).map((row: Record<string, unknown>) => mapEventRow(row))
    },
  )
}

export async function fetchEventsByScene(
  citySlug: string,
  genreSlug: string,
  limit = 12
): Promise<SceneEvent[]> {
  if (!isSupabaseConfigured()) {
    const cityLabel = findCityBySlug(citySlug)?.label ?? citySlug
    return localListEventsForScene(cityLabel, genreSlug, undefined, limit)
  }

  return viaV1Api(
    async () => {
      const { events } = await v1GetEventsByScene(citySlug, genreSlug, limit)
      return events
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('events_by_scene', {
        p_city_slug: citySlug,
        p_genre_slug: genreSlug,
        lim: limit,
      })

      if (error) {
        console.warn('[events] scene', error.message)
        return []
      }

      return (data ?? []).map((row: Record<string, unknown>) => mapEventRow(row))
    },
  )
}

export async function submitSceneEvent(input: SubmitEventInput, userId: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    return localSubmitEvent(userId, input)
  }

  return viaV1Api(
    async () => {
      const { id } = await v1SubmitSceneEvent(input)
      return id
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('events_submit', {
        p_title: input.title,
        p_description: input.description ?? null,
        p_event_kind: input.eventKind,
        p_scene_city: input.sceneCity,
        p_scene_genre_slug: input.sceneGenreSlug ?? null,
        p_venue_name: input.venueName,
        p_starts_at: new Date(input.startsAt).toISOString(),
        p_external_url: input.externalUrl,
      })

      if (error) throw new Error(error.message)
      return String(data)
    },
  )
}

export async function toggleEventRsvp(eventId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return localToggleRsvp(eventId, userId)
  }

  return viaV1Api(
    async () => {
      const { rsvped } = await v1ToggleEventRsvp(eventId)
      return rsvped
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('events_rsvp_toggle', { p_event_id: eventId })
      if (error) throw new Error(error.message)
      return Boolean(data)
    },
  )
}

export async function fetchPendingEvents(limit = 30): Promise<PendingSceneEvent[]> {
  if (!isSupabaseConfigured()) return []

  return viaV1Api(
    async () => {
      const { events } = await v1GetPendingEvents(limit)
      return events
    },
    async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.rpc('events_pending', { lim: limit })

      if (error) {
        console.warn('[events] pending', error.message)
        return []
      }

      return (data ?? []).map((row: Record<string, unknown>) => mapPendingRow(row))
    },
  )
}

export async function moderateEvent(
  eventId: string,
  action: 'publish' | 'reject',
  rejectionNote?: string
): Promise<void> {
  if (!isSupabaseConfigured()) return

  await viaV1Api(
    () => v1ModerateEvent({ eventId, action, note: rejectionNote }),
    async () => {
      const supabase = getSupabase()
      const { error } = await supabase.rpc('events_moderate', {
        p_event_id: eventId,
        p_action: action,
        p_rejection_note: rejectionNote ?? null,
      })
      if (error) throw new Error(error.message)
    },
  )
}
