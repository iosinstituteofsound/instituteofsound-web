import type { ReleaseDto, MusicVideoDto } from '@/modules/explore/types/explore.types'
import { releaseDateLabel, releaseTypeLabel } from '@/modules/explore/lib/release-meta'

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

/** PREVIEW: pad popular list to 10 tracks in dev — remove when layout review is done */
const POPULAR_PREVIEW_TARGET = 10

const POPULAR_PREVIEW_FILLER = [
  { title: 'Riha', playCount: 70_712 },
  { title: 'Tarse Naina', playCount: 61_204 },
  { title: 'Khwaab', playCount: 58_930 },
  { title: 'Chal', playCount: 45_210 },
  { title: 'Ashes', playCount: 39_880 },
  { title: 'Red Eclipse', playCount: 33_120 },
  { title: 'Maya', playCount: 28_440 },
  { title: 'Nirguna', playCount: 22_100 },
] as const

export function isPopularPreviewRelease(id: string): boolean {
  return id.startsWith('__preview_popular_')
}

export function fillPopularPreview(releases: ReleaseDto[]): ReleaseDto[] {
  if (!import.meta.env.DEV || releases.length >= POPULAR_PREVIEW_TARGET) return releases

  const filled = [...releases]
  for (let i = releases.length; i < POPULAR_PREVIEW_TARGET; i++) {
    const base = releases[i % releases.length]!
    const filler = POPULAR_PREVIEW_FILLER[i - releases.length]
    filled.push({
      ...base,
      id: `__preview_popular_${i}`,
      title: filler?.title ?? `Transmission ${i + 1}`,
      playCount: filler?.playCount ?? Math.max(1200, 20_000 - i * 1800),
      coverUrl: `https://picsum.photos/seed/ios-disc-pop-${i}/120/120`,
    })
  }
  return filled
}

/** PREVIEW: pad albums/EP grid to 4 in dev — remove when layout review is done */
const ALBUMS_PREVIEW_TARGET = 4

const ALBUMS_PREVIEW_FILLER = [
  { title: 'Kailasa Ka Rahasya', type: 'album' as const, genre: 'Industrial', playCount: 128_400, daysAgo: 0 },
  { title: 'Cathedral EP', type: 'ep' as const, genre: 'Noise', playCount: 45_200, daysAgo: 84 },
  { title: 'Red Eclipse', type: 'ep' as const, genre: 'Techno', playCount: 33_120, daysAgo: 112 },
  { title: 'Void Protocol', type: 'ep' as const, genre: 'Ambient', playCount: 28_400, daysAgo: 140 },
] as const

export function isAlbumPreviewRelease(id: string): boolean {
  return id.startsWith('__preview_album_')
}

export function fillAlbumsPreview(releases: ReleaseDto[], artistName?: string): ReleaseDto[] {
  if (!import.meta.env.DEV || releases.length >= ALBUMS_PREVIEW_TARGET) return releases

  const filled = [...releases]
  for (let i = releases.length; i < ALBUMS_PREVIEW_TARGET; i++) {
    const base = releases[i % Math.max(releases.length, 1)] ?? releases[0]
    const filler = ALBUMS_PREVIEW_FILLER[i - releases.length]
    const fallbackBase: ReleaseDto = base ?? {
      id: '__preview_album_base',
      title: filler?.title ?? 'Untitled',
      type: filler?.type ?? 'album',
      artistName,
      genre: filler?.genre ?? 'Electronic',
      playCount: filler?.playCount ?? 10_000,
      releaseDate: new Date().toISOString(),
      streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    }
    filled.push({
      ...fallbackBase,
      id: `__preview_album_${i}`,
      title: releases.length === 0 ? (filler?.title ?? `Archive ${i + 1}`) : (filler?.title ?? `Archive ${i + 1}`),
      type: filler?.type ?? 'ep',
      genre: filler?.genre ?? fallbackBase.genre,
      artistName: artistName ?? fallbackBase.artistName,
      playCount: filler?.playCount ?? Math.max(5000, 40_000 - i * 8000),
      releaseDate: new Date(Date.now() - (filler?.daysAgo ?? i * 30) * 86400000).toISOString(),
      coverUrl: `https://picsum.photos/seed/ios-disc-album-${i}/600/600`,
    })
  }
  return filled
}

/** PREVIEW: pad singles grid to 4 in dev — remove when layout review is done */
const SINGLES_PREVIEW_TARGET = 4

const SINGLES_PREVIEW_FILLER = [
  { title: 'Riha', genre: 'Industrial', playCount: 70_712, daysAgo: 14 },
  { title: 'Tarse Naina', genre: 'Noise', playCount: 61_204, daysAgo: 28 },
  { title: 'Khwaab', genre: 'Techno', playCount: 58_930, daysAgo: 42 },
  { title: 'Chal', genre: 'Ambient', playCount: 45_210, daysAgo: 56 },
] as const

export function fillSinglesPreview(releases: ReleaseDto[], artistName?: string): ReleaseDto[] {
  if (!import.meta.env.DEV || releases.length >= SINGLES_PREVIEW_TARGET) return releases

  const filled = [...releases]
  for (let i = releases.length; i < SINGLES_PREVIEW_TARGET; i++) {
    const base = releases[i % Math.max(releases.length, 1)] ?? releases[0]
    const filler = SINGLES_PREVIEW_FILLER[i - releases.length]
    const fallbackBase: ReleaseDto = base ?? {
      id: '__preview_single_base',
      title: filler?.title ?? 'Untitled',
      type: 'single',
      artistName,
      genre: filler?.genre ?? 'Electronic',
      playCount: filler?.playCount ?? 10_000,
      releaseDate: new Date().toISOString(),
      streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    }
    filled.push({
      ...fallbackBase,
      id: `__preview_single_${i}`,
      title: releases.length === 0 ? (filler?.title ?? `Single ${i + 1}`) : (filler?.title ?? `Single ${i + 1}`),
      type: 'single',
      genre: filler?.genre ?? fallbackBase.genre,
      artistName: artistName ?? fallbackBase.artistName,
      playCount: filler?.playCount ?? Math.max(5000, 35_000 - i * 6000),
      releaseDate: new Date(Date.now() - (filler?.daysAgo ?? i * 20) * 86400000).toISOString(),
      coverUrl: `https://picsum.photos/seed/ios-disc-single-${i}/600/600`,
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
  { title: 'Anantram — Visual', durationSec: 242, viewCount: 89_400, daysAgo: 21 },
  { title: 'Riha — Live Session', durationSec: 318, viewCount: 52_100, daysAgo: 45 },
  { title: 'Chal — Official', durationSec: 214, viewCount: 67_300, daysAgo: 60 },
  { title: 'Signal Bloom — Teaser', durationSec: 96, viewCount: 31_200, daysAgo: 12 },
] as const

export function fillMusicVideosPreview(videos: MusicVideoDto[]): MusicVideoDto[] {
  if (!import.meta.env.DEV || videos.length >= VIDEOS_PREVIEW_TARGET) return videos

  const filled = [...videos]
  for (let i = videos.length; i < VIDEOS_PREVIEW_TARGET; i++) {
    const filler = VIDEOS_PREVIEW_FILLER[i - videos.length]
    filled.push({
      id: `__preview_video_${i}`,
      artistProfileId: videos[0]?.artistProfileId ?? '__preview',
      title: filler?.title ?? `Transmission ${i + 1}`,
      thumbnailUrl: `https://picsum.photos/seed/ios-disc-video-${i}/1280/720`,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      durationSec: filler?.durationSec ?? 180,
      viewCount: filler?.viewCount ?? 20_000 - i * 3000,
      releaseDate: new Date(Date.now() - (filler?.daysAgo ?? i * 15) * 86400000).toISOString(),
    })
  }
  return filled
}
