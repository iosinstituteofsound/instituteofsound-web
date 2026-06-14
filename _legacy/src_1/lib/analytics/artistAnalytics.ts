import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1GetArtistAnalyticsEvents, v1PostArtistAnalyticsEvent } from '@/api/v1Phase5Client'
import type { ArtistProfileAnalytics, ArtistTrackClickStat } from './artistTypes'
import {
  localAppendAnalyticsEvent,
  localGetAnalyticsEvents,
  type StoredAnalyticsEvent,
} from './artistAnalyticsStorage'

const SESSION_VIEW_PREFIX = 'ios_profile_view_'

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
      await v1PostArtistAnalyticsEvent({
        profileId,
        eventType: 'profile_view',
      })
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
      await v1PostArtistAnalyticsEvent({
        profileId,
        eventType: 'track_click',
        trackId,
      })
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
      ? (await v1GetArtistAnalyticsEvents(profileId)).events
      : localGetAnalyticsEvents(profileId)
    return aggregateEvents(events, trackTitles)
  } catch {
    return empty
  }
}
