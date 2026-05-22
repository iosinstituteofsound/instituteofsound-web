import type { ArtistAnalyticsEventType } from './artistTypes'

const EVENTS_KEY = 'ios_artist_analytics_events'

export interface StoredAnalyticsEvent {
  id: string
  profileId: string
  trackId?: string
  eventType: ArtistAnalyticsEventType
  createdAt: string
}

function read(): StoredAnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    return raw ? (JSON.parse(raw) as StoredAnalyticsEvent[]) : []
  } catch {
    return []
  }
}

function write(events: StoredAnalyticsEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

export function localAppendAnalyticsEvent(
  profileId: string,
  eventType: ArtistAnalyticsEventType,
  trackId?: string
) {
  const events = read()
  events.push({
    id: crypto.randomUUID(),
    profileId,
    trackId,
    eventType,
    createdAt: new Date().toISOString(),
  })
  write(events)
}

export function localGetAnalyticsEvents(profileId: string): StoredAnalyticsEvent[] {
  return read().filter((e) => e.profileId === profileId)
}
