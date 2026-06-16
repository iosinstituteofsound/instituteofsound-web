import type { ReleaseDto, ReleaseFilter, ReleaseType } from '@/modules/explore/types/explore.types'

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
