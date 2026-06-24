import type { PlayTrackOptions, PlayerTrack } from '@/modules/player/types/player.types'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import type { ReleaseDetailDto } from '@/modules/music/types/music.types'
import type { ReleasePlaybackMeta } from '@/modules/explore/components/release-player-bar'
import { playReleaseFromDetail, releaseToPlayerQueue } from '@/modules/music/lib/player-queue'
import {
  releaseDetailToPlayerTrack,
  releaseDtoToPlayerTrack,
} from '@/modules/music/lib/player-track-builders'

type PlayTrackFn = (
  track: PlayerTrack,
  options?: PlayTrackOptions,
) => void

function trackPlaybackUrl(track?: { audioUrl?: string; streamUrl?: string }): string | undefined {
  return track?.audioUrl ?? track?.streamUrl
}

/** Same audio resolution as ReleasePlayerBar on the release hero. */
export function releaseHeroAudioUrl(
  release: ReleaseDto,
  releaseDetail?: ReleaseDetailDto | null,
  trackId?: string,
): string | undefined {
  if (releaseDetail) {
    const track = trackId
      ? releaseDetail.tracks.find((item) => item.id === trackId)
      : releaseDetail.tracks[0]
    const anyTrackUrl = releaseDetail.tracks
      .map((item) => trackPlaybackUrl(item))
      .find(Boolean)
    return (
      trackPlaybackUrl(track) ??
      anyTrackUrl ??
      releaseDetail.streamUrl ??
      release.streamUrl ??
      undefined
    )
  }
  return release.streamUrl ?? undefined
}

export function buildReleaseHeroPlayback(
  release: ReleaseDto,
  releaseDetail?: ReleaseDetailDto | null,
  trackId?: string,
): ReleasePlaybackMeta | undefined {
  const audioUrl = releaseHeroAudioUrl(release, releaseDetail, trackId)
  if (!audioUrl) return undefined

  const track = trackId
    ? releaseDetail?.tracks.find((item) => item.id === trackId)
    : releaseDetail?.tracks[0]

  return {
    trackId: track?.id ?? trackId,
    releaseId: releaseDetail?.id ?? release.id,
    artistProfileId: releaseDetail?.artistProfileId ?? release.artistProfileId,
    audioUrl,
    durationSec: track?.durationSec ?? release.durationSec,
  }
}

/** Mirrors ReleasePlayerBar play/pause toggle using the same playback metadata. */
export function playReleaseHeroPlayback(
  release: ReleaseDto,
  playback: ReleasePlaybackMeta | undefined,
  playTrack: PlayTrackFn,
  togglePlay: () => void,
  currentTrack: PlayerTrack | null,
  _isPlaying: boolean,
  title?: string,
) {
  const releaseId = playback?.releaseId ?? release.id
  const trackId = playback?.trackId
  const audioUrl = playback?.audioUrl ?? release.streamUrl
  if (!audioUrl) return

  const activeKey = trackId ?? releaseId
  const isActive =
    currentTrack?.releaseId === releaseId ||
    currentTrack?.trackId === trackId ||
    currentTrack?.id === activeKey

  if (isActive) {
    togglePlay()
    return
  }

  playTrack({
    id: activeKey,
    trackId,
    releaseId,
    artistProfileId: playback?.artistProfileId ?? release.artistProfileId,
    title: title ?? release.title,
    artist: release.artistName ?? 'Unknown',
    audioUrl,
    artworkUrl: release.coverUrl,
    durationSec: playback?.durationSec ?? release.durationSec,
  })
}

export function releaseHeroCanPlay(
  release: ReleaseDto,
  releaseDetail?: ReleaseDetailDto | null,
  trackId?: string,
): boolean {
  return Boolean(releaseHeroAudioUrl(release, releaseDetail, trackId))
}

export function releaseDetailCanPlay(releaseDetail?: ReleaseDetailDto | null): boolean {
  if (!releaseDetail) return false
  if (releaseToPlayerQueue(releaseDetail).length > 0) return true
  return Boolean(releaseDetail.streamUrl || releaseDetail.tracks.some((track) => track.audioUrl))
}

export function releaseCanPlay(
  release?: ReleaseDto | null,
  releaseDetail?: ReleaseDetailDto | null,
): boolean {
  if (!release) return false
  return releaseHeroCanPlay(release, releaseDetail)
}

export function playReleaseDetail(
  releaseDetail: ReleaseDetailDto,
  playTrack: PlayTrackFn,
  options?: { startIndex?: number },
) {
  const queue = releaseToPlayerQueue(releaseDetail)
  if (queue.length > 0) {
    playReleaseFromDetail(releaseDetail, playTrack, options)
    return
  }

  const track = releaseDetailToPlayerTrack(releaseDetail)
  if (track) playTrack(track)
}

export function playReleaseHero(
  release: ReleaseDto,
  releaseDetail: ReleaseDetailDto | undefined | null,
  playTrack: PlayTrackFn,
  togglePlay: () => void,
  currentTrack: PlayerTrack | null,
  isPlaying: boolean,
  options?: { trackId?: string; playAll?: boolean },
) {
  if (options?.playAll && releaseDetail && releaseDetail.tracks.length > 1) {
    playReleaseDetail(releaseDetail, playTrack)
    return
  }

  const playback = buildReleaseHeroPlayback(release, releaseDetail, options?.trackId)
  const track = options?.trackId
    ? releaseDetail?.tracks.find((item) => item.id === options.trackId)
    : releaseDetail?.tracks[0]

  if (playback) {
    playReleaseHeroPlayback(
      release,
      playback,
      playTrack,
      togglePlay,
      currentTrack,
      isPlaying,
      track?.title,
    )
    return
  }

  const fallbackTrack = releaseDtoToPlayerTrack(release)
  if (fallbackTrack) playTrack(fallbackTrack)
}
