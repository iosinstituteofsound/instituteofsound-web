import { isSupabaseConfigured } from '@/lib/supabase/client'
import { getSupabase } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1GetArtistAnalyticsEvents, v1PostArtistAnalyticsEvent } from '@/api/v1Phase5Client'
import type { ArtistProfileAnalytics, ArtistTrackClickStat } from './artistTypes'
import {
  localAppendAnalyticsEvent,
  localGetAnalyticsEvents,
  type StoredAnalyticsEvent,
} from './artistAnalyticsStorage'

const SESSION_VIEW_PREFIX = 'ios_profile_view_'

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function shouldSkipOwnerView(viewerUserId?: string, ownerUserId?: string) {
  return !!viewerUserId && !!ownerUserId && viewerUserId === ownerUserId
}

function hasSessionProfileView(profileId: string) {
  try {
    return sessionStorage.getItem(`${SESSION_VIEW_PREFIX}${profileId}`) === '1'
  } catch {
    return false
  }
}

function markSessionProfileView(profileId: string) {
  try {
    sessionStorage.setItem(`${SESSION_VIEW_PREFIX}${profileId}`, '1')
  } catch {
    /* private mode */
  }
}

async function supabaseInsertEvent(
  profileId: string,
  eventType: 'profile_view' | 'track_click',
  trackId?: string
) {
  await viaV1Api(
    () =>
      v1PostArtistAnalyticsEvent({
        profileId,
        eventType,
        trackId,
      }),
    async () => {
      const supabase = getSupabase()
      const { error } = await supabase.from('artist_analytics_events').insert({
        profile_id: profileId,
        track_id: trackId ?? null,
        event_type: eventType,
      })
      if (error) throw new Error(error.message)
    },
  )
}

/** One profile view per browser session; skips owner viewing own page. */
export async function recordProfileView(
  profileId: string,
  opts?: { viewerUserId?: string; ownerUserId?: string; published?: boolean }
) {
  if (!profileId) return
  if (shouldSkipOwnerView(opts?.viewerUserId, opts?.ownerUserId)) return
  if (opts?.published === false) return
  if (hasSessionProfileView(profileId)) return

  markSessionProfileView(profileId)

  try {
    if (isSupabaseConfigured()) {
      await supabaseInsertEvent(profileId, 'profile_view')
    } else {
      localAppendAnalyticsEvent(profileId, 'profile_view')
    }
  } catch {
    /* analytics must not break the page */
  }
}

/** Counts when visitor opens in-page player or external stream link. */
export async function recordTrackClick(
  profileId: string,
  trackId: string,
  opts?: { viewerUserId?: string; ownerUserId?: string; published?: boolean }
) {
  if (!profileId || !trackId) return
  if (shouldSkipOwnerView(opts?.viewerUserId, opts?.ownerUserId)) return
  if (opts?.published === false) return

  try {
    if (isSupabaseConfigured()) {
      await supabaseInsertEvent(profileId, 'track_click', trackId)
    } else {
      localAppendAnalyticsEvent(profileId, 'track_click', trackId)
    }
  } catch {
    /* non-blocking */
  }
}

function aggregateEvents(
  events: StoredAnalyticsEvent[],
  trackTitles: Map<string, string>
): ArtistProfileAnalytics {
  const now = Date.now()
  const ms7 = 7 * 24 * 60 * 60 * 1000
  const ms30 = 30 * 24 * 60 * 60 * 1000

  let profileViews = 0
  let profileViews7d = 0
  let profileViews30d = 0
  let trackClicks = 0
  let trackClicks7d = 0
  const clickTotals = new Map<string, { clicks: number; clicks7d: number }>()

  for (const e of events) {
    const age = now - new Date(e.createdAt).getTime()
    if (e.eventType === 'profile_view') {
      profileViews++
      if (age <= ms7) profileViews7d++
      if (age <= ms30) profileViews30d++
    } else if (e.eventType === 'track_click' && e.trackId) {
      trackClicks++
      if (age <= ms7) trackClicks7d++
      const cur = clickTotals.get(e.trackId) ?? { clicks: 0, clicks7d: 0 }
      cur.clicks++
      if (age <= ms7) cur.clicks7d++
      clickTotals.set(e.trackId, cur)
    }
  }

  const topTracks: ArtistTrackClickStat[] = [...clickTotals.entries()]
    .map(([trackId, counts]) => ({
      trackId,
      title: trackTitles.get(trackId) ?? 'Track',
      clicks: counts.clicks,
      clicks7d: counts.clicks7d,
    }))
    .sort((a, b) => b.clicks - a.clicks || b.clicks7d - a.clicks7d)
    .slice(0, 5)

  return {
    profileViews,
    profileViews7d,
    profileViews30d,
    trackClicks,
    trackClicks7d,
    topTracks,
  }
}

async function supabaseFetchEvents(profileId: string): Promise<StoredAnalyticsEvent[]> {
  return viaV1Api(
    async () => {
      const { events } = await v1GetArtistAnalyticsEvents(profileId)
      return events
    },
    async () => {
      const supabase = getSupabase()
      const since = daysAgo(90)
      const { data, error } = await supabase
        .from('artist_analytics_events')
        .select('id, profile_id, track_id, event_type, created_at')
        .eq('profile_id', profileId)
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5000)

      if (error) throw new Error(error.message)
      return (data ?? []).map((r) => ({
        id: r.id,
        profileId: r.profile_id,
        trackId: r.track_id ?? undefined,
        eventType: r.event_type as StoredAnalyticsEvent['eventType'],
        createdAt: r.created_at,
      }))
    },
  )
}

export async function getArtistProfileAnalytics(
  profileId: string,
  tracks: { id: string; title: string }[]
): Promise<ArtistProfileAnalytics> {
  const trackTitles = new Map(tracks.map((t) => [t.id, t.title]))
  const empty: ArtistProfileAnalytics = {
    profileViews: 0,
    profileViews7d: 0,
    profileViews30d: 0,
    trackClicks: 0,
    trackClicks7d: 0,
    topTracks: [],
  }

  try {
    const events = isSupabaseConfigured()
      ? await supabaseFetchEvents(profileId)
      : localGetAnalyticsEvents(profileId)
    return aggregateEvents(events, trackTitles)
  } catch {
    return empty
  }
}
