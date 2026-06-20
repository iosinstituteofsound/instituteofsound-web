import { useMemo } from 'react'
import type { DiscographyTrackDto } from '@/modules/explore/types/explore.types'
import { releaseInitials } from '@/modules/explore/lib/release-meta'
import type { PlayerTrack } from '@/modules/player/types/player.types'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import {
  formatDiscographyPlays,
  fillPopularPreview,
  isPopularPreviewRelease,
} from '@/modules/profile/lib/discography-format'
import { cn } from '@/shared/lib/cn'
import '@/modules/profile/styles/disc-device-panel.css'

type DiscographyPopularListProps = {
  tracks: DiscographyTrackDto[]
  artistName?: string
}

const DEMO_STREAM_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
] as const

function trackStreamUrl(track: DiscographyTrackDto, index: number): string | undefined {
  if (track.streamUrl) return track.streamUrl
  if (isPopularPreviewRelease(track.id)) {
    return DEMO_STREAM_URLS[index % DEMO_STREAM_URLS.length]
  }
  return undefined
}

function popularTracksToPlayerQueue(tracks: DiscographyTrackDto[], artistName?: string): PlayerTrack[] {
  return tracks.flatMap((track, index) => {
    const audioUrl = trackStreamUrl(track, index)
    if (!audioUrl) return []

    return [
      {
        id: track.id,
        title: track.title,
        artist: track.artistName ?? artistName ?? 'Unknown',
        audioUrl,
        artworkUrl: track.coverUrl,
        durationSec: track.durationSec,
      },
    ]
  })
}

export function DiscographyPopularList({ tracks: inputTracks, artistName }: DiscographyPopularListProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const currentTrack = usePlayerStore((s) => s.currentTrack)

  const tracks = fillPopularPreview(inputTracks)
  const queue = useMemo(() => popularTracksToPlayerQueue(tracks, artistName), [tracks, artistName])

  if (tracks.length === 0) return null

  const onPlay = (track: DiscographyTrackDto) => {
    const queueIndex = queue.findIndex((item) => item.id === track.id)
    if (queueIndex < 0) return
    playTrack(queue[queueIndex]!, { queue, queueIndex })
  }

  return (
    <section className="disc-dev disc-dev--matrix" aria-labelledby="discography-popular-heading">
      <div className="disc-dev__chassis">
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--tl" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--tr" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--bl" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--br" aria-hidden />

        <header className="disc-dev__header">
          <span className="disc-dev__vents" aria-hidden />
          <div className="disc-dev__header-left">
            <span className="disc-dev__led-cluster" aria-hidden>
              <span className="disc-dev__led" />
              <span className="disc-dev__led disc-dev__led--dim" />
            </span>
            <span className="disc-dev__module-id">MX-01</span>
          </div>
          <div className="disc-dev__header-center">
            <p className="disc-dev__kicker">:: Stream matrix</p>
            <h2 id="discography-popular-heading" className="disc-dev__title">
              Popular
            </h2>
          </div>
          <span className="disc-dev__header-meta">{String(tracks.length).padStart(2, '0')} trks</span>
        </header>

        <div className="disc-dev__screen">
          <span className="disc-dev__screen-bezel" aria-hidden />
          <span className="disc-dev__screen-grid" aria-hidden />
          <span className="disc-dev__screen-scan" aria-hidden />
          <span className="disc-dev__screen-glow" aria-hidden />
          <span className="disc-dev__screen-noise" aria-hidden />

          <ol className="disc-dev__tracks">
            {tracks.map((track, index) => {
              const playable = queue.some((item) => item.id === track.id)
              const active = currentTrack?.id === track.id
              const preview = isPopularPreviewRelease(track.id)

              return (
                <li key={track.id} className="disc-dev__track">
                  <button
                    type="button"
                    className={cn(
                      'disc-dev__track-link',
                      preview && 'disc-dev__track-link--preview',
                      active && 'disc-dev__track-link--active',
                      !playable && 'disc-dev__track-link--disabled',
                    )}
                    onClick={() => onPlay(track)}
                    disabled={!playable}
                    aria-label={`Play ${track.title}`}
                    aria-current={active ? 'true' : undefined}
                  >
                    <span className="disc-dev__track-rank">{String(index + 1).padStart(2, '0')}</span>
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt=""
                        className="disc-dev__track-thumb"
                        loading="lazy"
                      />
                    ) : (
                      <span className="disc-dev__track-thumb disc-dev__track-thumb--fallback" aria-hidden>
                        {releaseInitials(track.title)}
                      </span>
                    )}
                    <span className="disc-dev__track-name">{track.title}</span>
                    <span className="disc-dev__track-stat">
                      <span className="disc-dev__track-stat-value">
                        {formatDiscographyPlays(track.playCount)}
                      </span>
                      <span className="disc-dev__track-stat-label">streams</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </div>

        <footer className="disc-dev__footer">
          <span className="disc-dev__footer-tag">SYS.OK</span>
          <span className="disc-dev__footer-line" aria-hidden />
          <span className="disc-dev__footer-tag disc-dev__footer-tag--live">LIVE</span>
        </footer>
      </div>
    </section>
  )
}
