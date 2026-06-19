import type { DiscographyDto, ReleaseDto, MusicVideoDto } from '@/modules/explore/types/explore.types'
import type { UserDto } from '@/shared/types/auth.types'
import { releaseDateLabel, releaseTypeLabel } from '@/modules/explore/lib/release-meta'

function previewEnabled(preview?: boolean): boolean {
  return preview ?? import.meta.env.DEV
}

export function isDiscographyPreviewId(id: string): boolean {
  return id.startsWith('__preview_')
}

export function formatDiscographyPlays(playCount?: number): string {
  if (playCount == null || playCount <= 0) return '—'
  return playCount.toLocaleString('en-US')
}

export function discographyReleaseDate(release: ReleaseDto): string {
  return releaseDateLabel(release)
}

export function discographyReleaseType(release: ReleaseDto): string {
  const label = releaseTypeLabel(release.type)
  return label.charAt(0) + label.slice(1).toLowerCase()
}

/** PREVIEW: pad popular list to 10 tracks — placeholder copy only, not real catalog titles */
const POPULAR_PREVIEW_TARGET = 10

const POPULAR_PREVIEW_FILLER = [
  { title: 'Sample Track · 01' },
  { title: 'Sample Track · 02' },
  { title: 'Sample Track · 03' },
  { title: 'Sample Track · 04' },
  { title: 'Sample Track · 05' },
  { title: 'Sample Track · 06' },
  { title: 'Sample Track · 07' },
  { title: 'Sample Track · 08' },
] as const

export function isPopularPreviewRelease(id: string): boolean {
  return id.startsWith('__preview_popular_')
}

export function isLatestPreviewRelease(id: string): boolean {
  return id.startsWith('__preview_latest_')
}

export function isSinglePreviewRelease(id: string): boolean {
  return id.startsWith('__preview_single_')
}

export function isVideoPreviewRelease(id: string): boolean {
  return id.startsWith('__preview_video_')
}

export function fillPopularPreview(releases: ReleaseDto[], preview?: boolean): ReleaseDto[] {
  if (!previewEnabled(preview) || releases.length >= POPULAR_PREVIEW_TARGET) return releases

  const filled = [...releases]
  for (let i = releases.length; i < POPULAR_PREVIEW_TARGET; i++) {
    const base = releases.length > 0 ? releases[i % releases.length]! : undefined
    const filler = POPULAR_PREVIEW_FILLER[i - releases.length]
    const slot = String(i + 1).padStart(2, '0')
    filled.push({
      ...(base ?? {}),
      id: `__preview_popular_${i}`,
      title: filler?.title ?? `Sample Track · ${slot}`,
      type: base?.type ?? 'single',
      playCount: undefined,
      coverUrl: `https://picsum.photos/seed/ios-disc-pop-${i}/120/120`,
      streamUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 6) + 1}.mp3`,
    })
  }
  return filled
}

/** PREVIEW: pad albums/EP grid to 4 — placeholder copy only */
const ALBUMS_PREVIEW_TARGET = 4

const ALBUMS_PREVIEW_FILLER = [
  { title: 'Sample Album Title', type: 'album' as const, genre: 'Your Genre', daysAgo: 0 },
  { title: 'Sample EP Title', type: 'ep' as const, genre: 'Your Genre', daysAgo: 84 },
  { title: 'Catalog Release · Demo 03', type: 'ep' as const, genre: 'Your Genre', daysAgo: 112 },
  { title: 'Catalog Release · Demo 04', type: 'ep' as const, genre: 'Your Genre', daysAgo: 140 },
] as const

export function isAlbumPreviewRelease(id: string): boolean {
  return id.startsWith('__preview_album_')
}

export function fillAlbumsPreview(releases: ReleaseDto[], artistName?: string, preview?: boolean): ReleaseDto[] {
  if (!previewEnabled(preview) || releases.length >= ALBUMS_PREVIEW_TARGET) return releases

  const filled = [...releases]
  for (let i = releases.length; i < ALBUMS_PREVIEW_TARGET; i++) {
    const base = releases[i % Math.max(releases.length, 1)] ?? releases[0]
    const filler = ALBUMS_PREVIEW_FILLER[i - releases.length]
    const fallbackBase: ReleaseDto = base ?? {
      id: '__preview_album_base',
      title: filler?.title ?? 'Sample Release Title',
      type: filler?.type ?? 'album',
      artistName,
      genre: filler?.genre ?? 'Your Genre',
      releaseDate: new Date().toISOString(),
    }
    filled.push({
      ...fallbackBase,
      id: `__preview_album_${i}`,
      title: filler?.title ?? `Catalog Release · Demo ${String(i + 1).padStart(2, '0')}`,
      type: filler?.type ?? 'ep',
      genre: filler?.genre ?? fallbackBase.genre,
      artistName: artistName ?? fallbackBase.artistName,
      playCount: undefined,
      releaseDate: new Date(Date.now() - (filler?.daysAgo ?? i * 30) * 86400000).toISOString(),
      coverUrl: `https://picsum.photos/seed/ios-disc-album-${i}/600/600`,
      streamUrl: undefined,
    })
  }
  return filled
}

/** PREVIEW: pad singles grid to 4 — placeholder copy only */
const SINGLES_PREVIEW_TARGET = 4

const SINGLES_PREVIEW_FILLER = [
  { title: 'Sample Single · 01', genre: 'Your Genre', daysAgo: 14 },
  { title: 'Sample Single · 02', genre: 'Your Genre', daysAgo: 28 },
  { title: 'Sample Single · 03', genre: 'Your Genre', daysAgo: 42 },
  { title: 'Sample Single · 04', genre: 'Your Genre', daysAgo: 56 },
] as const

export function fillSinglesPreview(releases: ReleaseDto[], artistName?: string, preview?: boolean): ReleaseDto[] {
  if (!previewEnabled(preview) || releases.length >= SINGLES_PREVIEW_TARGET) return releases

  const filled = [...releases]
  for (let i = releases.length; i < SINGLES_PREVIEW_TARGET; i++) {
    const base = releases[i % Math.max(releases.length, 1)] ?? releases[0]
    const filler = SINGLES_PREVIEW_FILLER[i - releases.length]
    const fallbackBase: ReleaseDto = base ?? {
      id: '__preview_single_base',
      title: filler?.title ?? 'Sample Single Title',
      type: 'single',
      artistName,
      genre: filler?.genre ?? 'Your Genre',
      releaseDate: new Date().toISOString(),
    }
    filled.push({
      ...fallbackBase,
      id: `__preview_single_${i}`,
      title: filler?.title ?? `Sample Single · ${String(i + 1).padStart(2, '0')}`,
      type: 'single',
      genre: filler?.genre ?? fallbackBase.genre,
      artistName: artistName ?? fallbackBase.artistName,
      playCount: undefined,
      releaseDate: new Date(Date.now() - (filler?.daysAgo ?? i * 20) * 86400000).toISOString(),
      coverUrl: `https://picsum.photos/seed/ios-disc-single-${i}/600/600`,
      streamUrl: undefined,
    })
  }
  return filled
}

export function formatVideoDuration(durationSec?: number): string {
  if (durationSec == null || durationSec <= 0) return '—'
  const m = Math.floor(durationSec / 60)
  const s = durationSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatVideoViews(viewCount?: number): string {
  if (viewCount == null || viewCount <= 0) return '—'
  if (viewCount >= 1_000_000) return `${(viewCount / 1_000_000).toFixed(1)}M`
  if (viewCount >= 1_000) return `${(viewCount / 1_000).toFixed(1)}K`
  return viewCount.toLocaleString('en-US')
}

const VIDEOS_PREVIEW_TARGET = 4

const VIDEOS_PREVIEW_FILLER = [
  { title: 'Sample Music Video · 01', durationSec: 242, daysAgo: 21 },
  { title: 'Sample Live Session · 02', durationSec: 318, daysAgo: 45 },
  { title: 'Sample Official Video · 03', durationSec: 214, daysAgo: 60 },
  { title: 'Sample Visualizer · 04', durationSec: 96, daysAgo: 12 },
] as const

export function fillMusicVideosPreview(videos: MusicVideoDto[], preview?: boolean): MusicVideoDto[] {
  if (!previewEnabled(preview) || videos.length >= VIDEOS_PREVIEW_TARGET) return videos

  const filled = [...videos]
  for (let i = videos.length; i < VIDEOS_PREVIEW_TARGET; i++) {
    const filler = VIDEOS_PREVIEW_FILLER[i - videos.length]
    filled.push({
      id: `__preview_video_${i}`,
      artistProfileId: videos[0]?.artistProfileId ?? '__preview',
      title: filler?.title ?? `Sample Music Video · ${String(i + 1).padStart(2, '0')}`,
      thumbnailUrl: `https://picsum.photos/seed/ios-disc-video-${i}/1280/720`,
      videoUrl: '#',
      durationSec: filler?.durationSec ?? 180,
      viewCount: undefined,
      releaseDate: new Date(Date.now() - (filler?.daysAgo ?? i * 15) * 86400000).toISOString(),
    })
  }
  return filled
}

const LATEST_PREVIEW_FILLER = {
  title: 'Your Latest Release',
  type: 'album' as const,
  genre: 'Your Genre',
}

export function fillLatestReleasePreview(
  release: ReleaseDto | null,
  artistName?: string,
  preview?: boolean,
): ReleaseDto | null {
  if (release) return release
  if (!previewEnabled(preview)) return null

  return {
    id: '__preview_latest_0',
    title: LATEST_PREVIEW_FILLER.title,
    type: LATEST_PREVIEW_FILLER.type,
    artistName,
    genre: LATEST_PREVIEW_FILLER.genre,
    releaseDate: new Date().toISOString(),
    coverUrl: 'https://picsum.photos/seed/ios-disc-latest/800/800',
    playCount: undefined,
  }
}

export function discographyHasContent(data: DiscographyDto): boolean {
  return Boolean(
    data.latestRelease ||
      data.popular.length > 0 ||
      (data.albumsAndEps?.length ?? 0) > 0 ||
      (data.singles?.length ?? 0) > 0 ||
      (data.musicVideos?.length ?? 0) > 0,
  )
}

/** Starter layout for artists — fills empty sections with editable preview modules. */
export function enrichDiscographyForDisplay(
  data: DiscographyDto,
  user: UserDto,
  options: { preview?: boolean } = {},
): DiscographyDto {
  const preview = options.preview ?? false
  if (!preview) return data

  const artistName = data.artist?.displayName || user.name

  return {
    ...data,
    latestRelease: fillLatestReleasePreview(data.latestRelease, artistName, true),
    popular: fillPopularPreview(data.popular, true),
    albumsAndEps: fillAlbumsPreview(data.albumsAndEps ?? [], artistName, true),
    singles: fillSinglesPreview(data.singles ?? [], artistName, true),
    musicVideos: fillMusicVideosPreview(data.musicVideos ?? [], true),
  }
}
