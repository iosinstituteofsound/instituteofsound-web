import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import type { ReleaseDetailDto } from '@/modules/music/types/music.types'

export function toReleaseDto(release: ReleaseDetailDto): ReleaseDto {
  return {
    id: release.id,
    slug: release.slug,
    artistProfileId: release.artistProfileId,
    title: release.title,
    coverUrl: release.coverUrl,
    artistName: release.artistName,
    type: release.type,
    genre: release.genre,
    playCount: release.playCount,
    releaseDate: release.releaseDate,
    streamUrl: release.streamUrl,
    trackCount: release.tracks.length,
    isFeatured: release.isFeatured,
  }
}

export function isReleaseLive(release: Pick<ReleaseDetailDto, 'status' | 'releaseDate' | 'isLive'>): boolean {
  if (typeof release.isLive === 'boolean') return release.isLive
  if (release.status !== 'published') return false
  if (!release.releaseDate) return true
  return new Date(release.releaseDate).getTime() <= Date.now()
}

export function isReleaseScheduled(release: Pick<ReleaseDetailDto, 'status' | 'releaseDate' | 'isLive'>): boolean {
  if (release.status !== 'published') return false
  if (isReleaseLive(release)) return false
  if (!release.releaseDate) return false
  return new Date(release.releaseDate).getTime() > Date.now()
}
