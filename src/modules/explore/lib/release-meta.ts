import type {
  ArtistProfileDto,
  ReleaseDto,
  ReleaseFilter,
  ReleaseType,
} from '@/modules/explore/types/explore.types'
import { artistFollowers } from '@/modules/explore/lib/artist-meta'

const TYPE_LABELS: Record<ReleaseType, string> = {
  album: 'Album',
  ep: 'EP',
  single: 'Single',
}

const GENRE_POOL = [
  'DRONE / NOISE',
  'INDUSTRIAL / RITUAL',
  'TECHNO / ARCHIVE',
  'AMBIENT / VOID',
  'GLITCH / IDM',
] as const

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i) * 31) % 100000
  return h
}

export function releaseTypeLabel(type?: ReleaseType): string {
  if (type && TYPE_LABELS[type]) return TYPE_LABELS[type]!.toUpperCase()
  return 'RELEASE'
}

export function releaseGenreLabel(release: ReleaseDto): string {
  if (release.labelName) return release.labelName.toUpperCase()
  return GENRE_POOL[hashId(release.id) % GENRE_POOL.length]!
}

export function releaseDateLabel(release: ReleaseDto): string {
  if (release.releaseDate) {
    return new Date(release.releaseDate)
      .toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      .toUpperCase()
  }
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const day = String(1 + (release.id.length % 28)).padStart(2, '0')
  return `${months[hashId(release.id) % months.length]!} ${day}, 2026`
}

export function releaseTrackCount(release: ReleaseDto): number {
  const base = release.type === 'album' ? 9 : release.type === 'ep' ? 5 : 1
  return base + (hashId(release.id) % 4)
}

export function releasePlays(release: ReleaseDto): string {
  const n = 180 + (hashId(release.id) % 980)
  return String(n)
}

export function isNewRelease(release: ReleaseDto): boolean {
  if (!release.releaseDate) return hashId(release.id) % 3 === 0
  const days = (Date.now() - new Date(release.releaseDate).getTime()) / 86400000
  return days >= 0 && days < 45
}

export function isHotRelease(release: ReleaseDto): boolean {
  return release.isFeatured === true || hashId(release.id) % 5 === 0
}

export function releaseInitials(title: string): string {
  const parts = title.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
  return (parts[0]?.slice(0, 2) ?? 'RL').toUpperCase()
}

export function releaseYear(release: ReleaseDto): string {
  if (release.releaseDate) return String(new Date(release.releaseDate).getFullYear())
  return '2026'
}

export function releaseCatalogRef(release: ReleaseDto): string {
  const prefix = (release.artistName ?? 'IOS').slice(0, 3).toUpperCase()
  const title = release.title.slice(0, 14).toUpperCase()
  return `${prefix} · ${title}`
}

export function releaseBio(release: ReleaseDto): string {
  const genre = releaseGenreLabel(release)
  return `Architect of decayed soundscapes. Frequencies from abandoned cities — ${genre.toLowerCase()}.`
}

export function releaseStreamPlatform(streamUrl?: string): string {
  if (!streamUrl) return 'IOS Wire'
  const url = streamUrl.toLowerCase()
  if (url.includes('spotify')) return 'Spotify'
  if (url.includes('soundcloud')) return 'SoundCloud'
  if (url.includes('bandcamp')) return 'Bandcamp'
  if (url.includes('youtube') || url.includes('youtu.be')) return 'YouTube'
  if (url.includes('apple')) return 'Apple Music'
  return 'IOS Wire'
}

export function releaseDurationLabel(release: ReleaseDto): string {
  const totalSec = releaseDurationSec(release)
  if (totalSec >= 3600) {
    const hours = Math.floor(totalSec / 3600)
    const mins = Math.floor((totalSec % 3600) / 60)
    return `${hours}:${String(mins).padStart(2, '0')}`
  }
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  if (mins >= 1 && secs === 0) return `${mins} min`
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export function releaseDurationSec(release: ReleaseDto): number {
  const tracks = releaseTrackCount(release)
  const minsPerTrack = release.type === 'single' ? 228 : release.type === 'ep' ? 252 : 288
  return tracks * minsPerTrack + (hashId(release.id) % 6) * 17
}

export function releasePlaysFormatted(release: ReleaseDto): string {
  const n = Number(releasePlays(release))
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

export function findArtistForRelease(
  release: ReleaseDto,
  artists: ArtistProfileDto[],
): ArtistProfileDto | undefined {
  if (release.artistProfileId) {
    const byId = artists.find((a) => a.id === release.artistProfileId)
    if (byId) return byId
  }
  if (release.artistName) {
    const normalized = release.artistName.trim().toLowerCase()
    return artists.find((a) => a.displayName.trim().toLowerCase() === normalized)
  }
  return undefined
}

export function artistReleaseStats(artist: ArtistProfileDto, releases: ReleaseDto[]) {
  const mine = releases.filter(
    (r) =>
      r.artistProfileId === artist.id ||
      r.artistName?.trim().toLowerCase() === artist.displayName.trim().toLowerCase(),
  )
  const trackCount = mine.reduce((sum, r) => sum + releaseTrackCount(r), 0)
  const totalPlays = mine.reduce((sum, r) => sum + Number(releasePlays(r)), 0)
  return {
    releaseCount: mine.length,
    trackCount,
    totalPlays: totalPlays >= 1000 ? `${(totalPlays / 1000).toFixed(1)}K` : String(totalPlays),
    listeners: artistFollowers(artist.slug),
  }
}

export function filterReleases(releases: ReleaseDto[], filter: ReleaseFilter): ReleaseDto[] {
  switch (filter) {
    case 'album':
      return releases.filter((r) => r.type === 'album')
    case 'ep':
      return releases.filter((r) => r.type === 'ep')
    case 'single':
      return releases.filter((r) => r.type === 'single')
    case 'archive':
      return releases.filter((r) => !r.isFeatured)
    default:
      return releases
  }
}
