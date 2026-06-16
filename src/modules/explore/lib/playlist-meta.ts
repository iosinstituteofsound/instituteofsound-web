import type { PlaylistDto } from '@/modules/explore/types/explore.types'

const TAGLINE_POOL = [
  'Industrial, noise and harsh frequencies.',
  'Raw, underground hip-hop and rap.',
  'Dark techno, EBM and cyber soundscapes.',
  'Retro waves, neon nights and outrun.',
  'Heavy riffs, mosh pits and metal anthems.',
] as const

function hashSlug(slug: string): number {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * 29) % 100000
  return h
}

export function labelInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  return (parts[0]?.slice(0, 2) ?? 'PL').toUpperCase()
}

export function playlistTrackCount(playlist: PlaylistDto): number {
  return playlist.tracks.length || 12 + (hashSlug(playlist.slug) % 30)
}

export function playlistTotalDurationSec(playlist: PlaylistDto): number {
  const fromTracks = playlist.tracks.reduce((sum, track) => sum + (track.durationSec ?? 210), 0)
  if (fromTracks > 0) return fromTracks
  return playlistTrackCount(playlist) * (210 + (hashSlug(playlist.slug) % 45))
}

export function playlistDurationLabel(playlist: PlaylistDto): string {
  const totalSec = playlistTotalDurationSec(playlist)
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  if (hours > 0) return `${hours}H ${minutes}M`
  return `${minutes}M`
}

export function playlistFollowers(slug: string): string {
  const n = 420 + (hashSlug(slug) % 2800)
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

export function playlistFollowersLabel(slug: string): string {
  return `${playlistFollowers(slug)} Followers`
}

export function formatTrackCount(playlist: PlaylistDto): string {
  return `${playlistTrackCount(playlist)} Tracks`
}

export function playlistTagline(playlist: PlaylistDto): string {
  if (playlist.description?.trim()) return playlist.description.trim()
  return TAGLINE_POOL[hashSlug(playlist.slug) % TAGLINE_POOL.length]!
}

export function playlistFeaturedTagline(playlist: PlaylistDto): string {
  if (playlist.slug === 'midnight-frequencies') {
    return 'Left-field electronics, dark grooves and nocturnal transmissions.'
  }
  if (playlist.description?.trim()) return playlist.description.trim()
  return 'Left-field electronics, dark grooves and nocturnal transmissions.'
}

const WIRE_PICK_LIST_SIZE = 5

const WIRE_PICK_FALLBACKS: PlaylistDto[] = [
  {
    id: 'wire-noise-ritual',
    slug: 'noise-ritual',
    title: 'Noise Ritual',
    description: 'Industrial, noise and harsh frequencies.',
    coverUrl: 'https://picsum.photos/seed/playlist-noise/400/400',
    tracks: stubTracks(28),
  },
  {
    id: 'wire-underground-protocol',
    slug: 'underground-protocol',
    title: 'Underground Protocol',
    description: 'Raw, underground hip-hop and rap.',
    coverUrl: 'https://picsum.photos/seed/playlist-underground/400/400',
    tracks: stubTracks(56),
  },
  {
    id: 'wire-dark-signal',
    slug: 'dark-signal',
    title: 'Dark Signal',
    description: 'Dark techno, EBM and cyber soundscapes.',
    coverUrl: 'https://picsum.photos/seed/playlist-dark/400/400',
    tracks: stubTracks(35),
  },
  {
    id: 'wire-synthwave-drive',
    slug: 'synthwave-drive',
    title: 'Synthwave Drive',
    description: 'Retro waves, neon nights and outrun.',
    coverUrl: 'https://picsum.photos/seed/playlist-synth/400/400',
    tracks: stubTracks(31),
  },
  {
    id: 'wire-metal-mayhem',
    slug: 'metal-mayhem',
    title: 'Metal Mayhem',
    description: 'Heavy riffs, mosh pits and metal anthems.',
    coverUrl: 'https://picsum.photos/seed/playlist-metal/400/400',
    tracks: stubTracks(49),
  },
  {
    id: 'wire-scene-report',
    slug: 'scene-report',
    title: 'Scene Report',
    description: 'Dark techno and warehouse transmissions.',
    coverUrl: 'https://picsum.photos/seed/playlist-scene/400/400',
    tracks: stubTracks(42),
  },
]

function stubTracks(count: number): PlaylistDto['tracks'] {
  return Array.from({ length: count }, (_, index) => ({
    title: `Track ${index + 1}`,
    artistName: 'IOS Wire',
  }))
}

function attachDemoStream(playlist: PlaylistDto, demoStream?: string): PlaylistDto {
  if (!demoStream || playlist.tracks.some((track) => track.streamUrl)) return playlist
  return {
    ...playlist,
    tracks: playlist.tracks.map((track, index) =>
      index === 0 ? { ...track, streamUrl: demoStream } : track,
    ),
  }
}

export function listPlaylists(
  featured: PlaylistDto | null,
  items: PlaylistDto[],
  minCount = WIRE_PICK_LIST_SIZE,
): PlaylistDto[] {
  const demoStream =
    featured?.tracks.find((track) => track.streamUrl)?.streamUrl ??
    items.flatMap((playlist) => playlist.tracks).find((track) => track.streamUrl)?.streamUrl

  const seen = new Set<string>()
  const merged: PlaylistDto[] = []

  const addPlaylist = (playlist: PlaylistDto) => {
    if (featured && playlist.id === featured.id) return
    if (featured && playlist.slug === featured.slug) return
    if (seen.has(playlist.slug)) return
    seen.add(playlist.slug)
    merged.push(attachDemoStream(playlist, demoStream))
  }

  for (const playlist of items) addPlaylist(playlist)
  for (const fallback of WIRE_PICK_FALLBACKS) {
    if (merged.length >= minCount) break
    addPlaylist(fallback)
  }

  return merged.slice(0, minCount)
}

export function playlistSpineLabel(playlist: PlaylistDto): string {
  if (playlist.slug === 'midnight-frequencies') return 'The act'
  const parts = playlist.title.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]} ${parts[1]}`.slice(0, 12)
  return parts[0]?.slice(0, 10) ?? 'IOS'
}
