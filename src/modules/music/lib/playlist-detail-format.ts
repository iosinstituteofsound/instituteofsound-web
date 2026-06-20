import type { PlaylistDetailDto, PlaylistTrackRefDto } from '@/modules/music/types/music.types'

export function formatTrackDuration(durationSec?: number): string {
  if (!durationSec || durationSec <= 0) return '—'
  const minutes = Math.floor(durationSec / 60)
  const seconds = Math.floor(durationSec % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function playlistTotalDurationSec(tracks: PlaylistTrackRefDto[]): number {
  return tracks.reduce((sum, track) => sum + (track.durationSec ?? 0), 0)
}

export function formatPlaylistTotalDuration(tracks: PlaylistTrackRefDto[]): string {
  const totalSec = playlistTotalDurationSec(tracks)
  if (totalSec <= 0) return '—'
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  if (hours > 0) {
    return minutes > 0 ? `about ${hours} hr ${minutes} min` : `about ${hours} hr`
  }
  return `about ${minutes} min`
}

export function formatDateAdded(iso?: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function playlistVisibilityLabel(playlist: PlaylistDetailDto): string {
  if (playlist.visibility === 'private') return 'Private playlist'
  if (playlist.ownerType === 'editorial') return 'Editorial playlist'
  return 'Public playlist'
}

export function playlistCuratorLabel(playlist: PlaylistDetailDto): string {
  if (playlist.curatorName?.trim()) return playlist.curatorName.trim()
  if (playlist.ownerType === 'editorial') return 'Institute of Sound'
  if (playlist.ownerType === 'artist') return 'Artist playlist'
  return 'Institute of Sound'
}

export function playlistSavesLabel(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i += 1) hash = (hash + slug.charCodeAt(i) * 29) % 100000
  const n = 420 + (hash % 2800)
  const label = n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n)
  return `${label} saves`
}

export function playlistTrackReleaseHref(track: PlaylistTrackRefDto): string | null {
  const id = track.releaseSlug ?? track.releaseId
  return id ? `/releases/${id}` : null
}
