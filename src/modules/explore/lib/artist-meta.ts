import type { ArtistProfileDto, ExploreFilter } from '@/modules/explore/types/explore.types'

export function artistFollowers(slug: string): string {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * 17) % 100000
  const n = 800 + (h % 12000)
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

export function artistGenreLabel(artist: ArtistProfileDto): string {
  if (artist.genres.length >= 2) {
    return `${artist.genres[0]} / ${artist.genres[1]}`.toUpperCase()
  }
  if (artist.genres.length === 1) return artist.genres[0]!.toUpperCase()
  if (artist.labelName) return artist.labelName.toUpperCase()
  return 'INDEPENDENT / OPEN'
}

export function avatarStackSeeds(slug: string): [string, string, string] {
  return [`${slug}-fan-a`, `${slug}-fan-b`, `${slug}-fan-c`]
}

export function artistInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  return (parts[0]?.slice(0, 2) ?? 'AR').toUpperCase()
}

export function filterArtists(artists: ArtistProfileDto[], filter: ExploreFilter) {
  if (filter === 'top' || filter === 'vibe') {
    return artists.filter((a) => a.genres.length > 0).slice(0, 12)
  }
  if (filter === 'new') return [...artists].reverse()
  return artists
}
