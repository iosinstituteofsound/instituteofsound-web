import { isSupabaseConfigured } from '@/lib/api/liveMode'
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

export async function fetchUpcomingEvents(
  filters: EventFilters = {},
  limit = 40,
  userId?: string
): Promise<SceneEvent[]> {
  if (!isSupabaseConfigured()) {
    return localListUpcomingEvents(filters, userId, limit)
  }

  const { events } = await v1GetUpcomingEvents({
    city: filters.city,
    genreSlug: filters.genreSlug,
    limit,
  })
  return events
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

  const { events } = await v1GetEventsByScene(citySlug, genreSlug, limit)
  return events
}

export async function submitSceneEvent(input: SubmitEventInput, userId: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    return localSubmitEvent(userId, input)
  }

  const { id } = await v1SubmitSceneEvent(input)
  return id
}

export async function toggleEventRsvp(eventId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return localToggleRsvp(eventId, userId)
  }

  const { rsvped } = await v1ToggleEventRsvp(eventId)
  return rsvped
}

export async function fetchPendingEvents(limit = 30): Promise<PendingSceneEvent[]> {
  if (!isSupabaseConfigured()) return []

  const { events } = await v1GetPendingEvents(limit)
  return events
}

export async function moderateEvent(
  eventId: string,
  action: 'publish' | 'reject',
  rejectionNote?: string
): Promise<void> {
  if (!isSupabaseConfigured()) return

  await v1ModerateEvent({ eventId, action, note: rejectionNote })
}
