import type { EventDto } from '@/modules/explore/types/explore.types'

const EVENT_POSTERS = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&h=720&q=85',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&h=720&q=85',
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=600&h=720&q=85',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&h=720&q=85',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&h=720&q=85',
]

const EVENT_FALLBACKS: EventDto[] = [
  {
    id: 'evt-fallback-void-echo',
    slug: 'void-echo',
    title: 'VOID ECHO',
    description: 'Transmission ritual',
    startsAt: '2026-06-14T14:30:00.000Z',
    venue: 'antiSOCIAL',
    hubCity: 'MUMBAI',
    coverUrl: EVENT_POSTERS[0],
  },
  {
    id: 'evt-fallback-rust-circuit',
    slug: 'rust-circuit',
    title: 'RUST CIRCUIT',
    description: 'Warehouse frequency',
    startsAt: '2026-06-21T13:00:00.000Z',
    venue: 'Summer House',
    hubCity: 'DELHI',
    coverUrl: EVENT_POSTERS[1],
  },
  {
    id: 'evt-fallback-neon-archive',
    slug: 'neon-archive',
    title: 'NEON ARCHIVE',
    description: 'Night assembly',
    startsAt: '2026-06-28T15:30:00.000Z',
    venue: 'The Humming Tree',
    hubCity: 'BANGALORE',
    coverUrl: EVENT_POSTERS[2],
  },
  {
    id: 'evt-fallback-static-saints',
    slug: 'static-saints',
    title: 'STATIC SAINTS',
    description: 'Industrial communion',
    startsAt: '2026-07-05T14:00:00.000Z',
    venue: 'Someplace Else',
    hubCity: 'KOLKATA',
    coverUrl: EVENT_POSTERS[3],
  },
  {
    id: 'evt-fallback-pulse-drift',
    slug: 'pulse-drift',
    title: 'PULSE DRIFT',
    description: 'Afterhours protocol',
    startsAt: '2026-07-12T16:00:00.000Z',
    venue: 'Club M',
    hubCity: 'GOA',
    coverUrl: EVENT_POSTERS[4],
  },
]

const TAG_RULES: Array<{ match: RegExp; primary: string; secondary: string }> = [
  { match: /listening|analog|archive|saint/i, primary: 'LISTENING', secondary: 'AVANT' },
  { match: /dj|pulse|drift|midnight|freq|electronic|neon|void|convo/i, primary: 'LIVE SET', secondary: 'ELECTRONIC' },
  { match: /rust|metal|dust|industrial|circuit/i, primary: 'LIVE SET', secondary: 'INDUSTRIAL' },
  { match: /showcase|signal|scene|meetup/i, primary: 'DJ SET', secondary: 'HOUSE' },
]

export function listExploreEvents(events: EventDto[], limit = 5): EventDto[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )
  const seen = new Set(sorted.map((event) => event.slug))
  const merged = [...sorted]

  for (const fallback of EVENT_FALLBACKS) {
    if (merged.length >= limit) break
    if (seen.has(fallback.slug)) continue
    merged.push(fallback)
    seen.add(fallback.slug)
  }

  return merged.slice(0, limit)
}

export function eventCover(event: EventDto, index: number) {
  if (event.coverUrl) return event.coverUrl
  return EVENT_POSTERS[index % EVENT_POSTERS.length]!
}

export function eventSubtitle(event: EventDto) {
  return event.description?.trim() || 'Transmission on the wire'
}

export function eventTags(event: EventDto) {
  const haystack = `${event.slug} ${event.title} ${event.description ?? ''}`
  for (const rule of TAG_RULES) {
    if (rule.match.test(haystack)) {
      return { primary: rule.primary, secondary: rule.secondary }
    }
  }
  return { primary: 'LIVE SET', secondary: 'TECHNO' }
}

export function formatExploreEventDate(iso: string) {
  const d = new Date(iso)
  const day = String(d.getDate())
  const month = d.toLocaleString('en-IN', { month: 'short' }).toUpperCase()
  const line = d
    .toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase()
  const hours = d.getHours()
  const mins = d.getMinutes()
  const h12 = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const time =
    mins === 0
      ? `${h12}:00 ${ampm} ONWARDS`
      : `${h12}:${String(mins).padStart(2, '0')} ${ampm} ONWARDS`
  return { day, month, line, time }
}

export function eventLocationLine(event: EventDto) {
  const city = event.hubCity?.toUpperCase() ?? 'INDIA'
  return `${event.venue.toUpperCase()}, ${city}`
}

export function isFallbackEvent(event: EventDto) {
  return event.id.startsWith('evt-fallback-')
}
