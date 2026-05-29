import { eventKindLabel } from '@/lib/events/constants'
import { fetchUpcomingEvents } from '@/lib/events/service'
import type { SceneEvent } from '@/lib/events/types'

const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&h=720&q=85`

const POSTERS = [
  IMG('photo-1558618666-fcd25c85cd64'),
  IMG('photo-1514525253161-7a46d19cd819'),
  IMG('photo-1614613535308-eb5fbd3d2c17'),
  IMG('photo-1470225620780-dba8ba36b745'),
  IMG('photo-1493225457124-a3eb161ffa5f'),
]

export interface DiscoverEventCard extends SceneEvent {
  subtitle: string
  tagPrimary: string
  tagSecondary: string
  imageUrl: string
}

function tagsForEvent(event: SceneEvent): { primary: string; secondary: string } {
  const primary = event.eventKind === 'dj-night' ? 'DJ SET' : 'LIVE SET'
  const genre = event.sceneGenreSlug?.replace(/-/g, ' ') ?? 'underground'
  const secondary = genre.includes('techno')
    ? 'TECHNO'
    : genre.includes('metal')
      ? 'METAL'
      : genre.includes('electronic')
        ? 'ELECTRONIC'
        : genre.toUpperCase().slice(0, 12)
  return { primary, secondary }
}

function enrich(event: SceneEvent, index: number): DiscoverEventCard {
  const tags = tagsForEvent(event)
  return {
    ...event,
    subtitle: event.description ?? `${eventKindLabel(event.eventKind)} on the wire`,
    tagPrimary: tags.primary,
    tagSecondary: tags.secondary,
    imageUrl: POSTERS[index % POSTERS.length]!,
  }
}

/** Curated discover row — used when the wire has few published gigs */
const SHOWCASE: DiscoverEventCard[] = [
  {
    id: 'discover-evt-1',
    title: 'Void Echo',
    subtitle: 'Transmission ritual',
    description: 'Transmission ritual',
    eventKind: 'dj-night',
    sceneCity: 'Mumbai',
    sceneGenreSlug: 'electronic',
    venueName: 'antiSOCIAL',
    startsAt: '2026-06-14T14:30:00.000Z',
    externalUrl: 'https://instituteofsound.in/events',
    rsvpCount: 128,
    viewerRsvped: false,
    tagPrimary: 'LIVE SET',
    tagSecondary: 'TECHNO',
    imageUrl: POSTERS[0]!,
  },
  {
    id: 'discover-evt-2',
    title: 'Rust Circuit',
    subtitle: 'Warehouse frequency',
    eventKind: 'warehouse',
    sceneCity: 'Delhi',
    sceneGenreSlug: 'metal',
    venueName: 'Summer House',
    startsAt: '2026-06-21T13:00:00.000Z',
    externalUrl: 'https://instituteofsound.in/events',
    rsvpCount: 86,
    viewerRsvped: false,
    tagPrimary: 'LIVE SET',
    tagSecondary: 'INDUSTRIAL',
    imageUrl: POSTERS[1]!,
  },
  {
    id: 'discover-evt-3',
    title: 'Neon Archive',
    subtitle: 'Night assembly',
    eventKind: 'gig',
    sceneCity: 'Bangalore',
    sceneGenreSlug: 'electronic',
    venueName: 'The Humming Tree',
    startsAt: '2026-06-28T15:30:00.000Z',
    externalUrl: 'https://instituteofsound.in/events',
    rsvpCount: 204,
    viewerRsvped: false,
    tagPrimary: 'LIVE SET',
    tagSecondary: 'ELECTRONIC',
    imageUrl: POSTERS[2]!,
  },
  {
    id: 'discover-evt-4',
    title: 'Static Saints',
    subtitle: 'Industrial communion',
    eventKind: 'listening',
    sceneCity: 'Kolkata',
    sceneGenreSlug: 'experimental',
    venueName: 'Someplace Else',
    startsAt: '2026-07-05T14:00:00.000Z',
    externalUrl: 'https://instituteofsound.in/events',
    rsvpCount: 57,
    viewerRsvped: false,
    tagPrimary: 'LISTENING',
    tagSecondary: 'AVANT',
    imageUrl: POSTERS[3]!,
  },
  {
    id: 'discover-evt-5',
    title: 'Pulse Drift',
    subtitle: 'Afterhours protocol',
    eventKind: 'dj-night',
    sceneCity: 'Goa',
    sceneGenreSlug: 'electronic',
    venueName: 'Club M',
    startsAt: '2026-07-12T16:00:00.000Z',
    externalUrl: 'https://instituteofsound.in/events',
    rsvpCount: 312,
    viewerRsvped: false,
    tagPrimary: 'DJ SET',
    tagSecondary: 'HOUSE',
    imageUrl: POSTERS[4]!,
  },
]

export async function listDiscoverEvents(limit = 5): Promise<DiscoverEventCard[]> {
  const api = await fetchUpcomingEvents({}, limit)
  if (api.length >= limit) {
    return api.slice(0, limit).map(enrich)
  }
  if (api.length > 0) {
    const merged = api.map(enrich)
    while (merged.length < limit) {
      const next = SHOWCASE[merged.length]
      if (!next) break
      merged.push(next)
    }
    return merged.slice(0, limit)
  }
  return SHOWCASE.slice(0, limit)
}

export function formatDiscoverEventDate(iso: string) {
  const d = new Date(iso)
  const day = d.getDate()
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
  return { day: String(day), month, line, time }
}
