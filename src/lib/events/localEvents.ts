import type { SceneEvent, SubmitEventInput } from '@/lib/events/types'

const KEY = 'ios_scene_events'
const RSVP_KEY = 'ios_scene_event_rsvps'

function read(): SceneEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as SceneEvent[]
  } catch {
    return []
  }
}

function write(items: SceneEvent[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

function readRsvps(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(RSVP_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, string[]>
  } catch {
    return {}
  }
}

function writeRsvps(map: Record<string, string[]>) {
  localStorage.setItem(RSVP_KEY, JSON.stringify(map))
}

export function localListEventsForScene(
  cityLabel: string,
  genreSlug: string,
  userId?: string,
  limit = 12
): SceneEvent[] {
  return localListUpcomingEvents({ city: cityLabel, genreSlug }, userId, limit)
}

export function localListUpcomingEvents(
  filters: { city?: string; genreSlug?: string },
  userId?: string,
  limit = 40
): SceneEvent[] {
  const now = Date.now()
  const rsvps = readRsvps()

  return read()
    .filter((e) => new Date(e.startsAt).getTime() >= now)
    .filter((e) => !filters.city || e.sceneCity.toLowerCase() === filters.city.toLowerCase())
    .filter((e) => !filters.genreSlug || e.sceneGenreSlug === filters.genreSlug)
    .map((e) => {
      const ids = rsvps[e.id] ?? []
      return {
        ...e,
        rsvpCount: ids.length,
        viewerRsvped: Boolean(userId && ids.includes(userId)),
      }
    })
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, limit)
}

export function localSubmitEvent(_userId: string, input: SubmitEventInput): string {
  const id = crypto.randomUUID()
  const event: SceneEvent = {
    id,
    title: input.title.trim(),
    description: input.description?.trim(),
    eventKind: input.eventKind,
    sceneCity: input.sceneCity,
    sceneGenreSlug: input.sceneGenreSlug,
    venueName: input.venueName.trim(),
    startsAt: new Date(input.startsAt).toISOString(),
    externalUrl: input.externalUrl.trim(),
    rsvpCount: 0,
    viewerRsvped: false,
  }
  write([event, ...read()])
  return id
}

export function localToggleRsvp(eventId: string, userId: string): boolean {
  const map = readRsvps()
  const list = map[eventId] ?? []
  const has = list.includes(userId)
  map[eventId] = has ? list.filter((id) => id !== userId) : [...list, userId]
  writeRsvps(map)
  return !has
}
