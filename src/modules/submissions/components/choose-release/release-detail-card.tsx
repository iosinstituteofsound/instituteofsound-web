import { useMemo, useRef, useState } from 'react'
import { Disc3, Pause, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { ReleaseDetailDto } from '@/modules/music/types/music.types'
import { formatDuration } from '@/modules/submissions/lib/submission-mapper'
import { Button } from '@/shared/components/ui/button'

interface ReleaseDetailCardProps {
  release: ReleaseDetailDto | null
}

function buildWaveBars(peaks?: number[], seed = 'default') {
  if (peaks && peaks.length > 0) {
    const step = Math.max(1, Math.floor(peaks.length / 48))
    return Array.from({ length: 48 }, (_, i) => {
      const val = peaks[i * step] ?? 0.3
      return Math.max(0.15, Math.min(1, val))
    })
  }
  return Array.from({ length: 48 }, (_, i) => {
    const char = seed.charCodeAt(i % Math.max(seed.length, 1)) ?? 0
    return 0.18 + ((char + i * 13) % 82) / 100
  })
}

export function ReleaseDetailCard({ release }: ReleaseDetailCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  const track = release?.tracks[0]
  const audioUrl = release?.streamUrl ?? track?.audioUrl
  const bars = useMemo(
    () => buildWaveBars(track?.waveformPeaks, release?.id ?? 'empty'),
    [track?.waveformPeaks, release?.id],
  )

  const togglePlay = async () => {
    if (!audioRef.current || !audioUrl) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
      return
    }
    try {
      await audioRef.current.play()
      setPlaying(true)
    } catch {
      setPlaying(false)
    }
  }

  if (!release) {
    return (
      <div className="sub-panel sub-release-detail">
        <div className="sub-panel__body">
          <p className="text-sm text-muted-foreground">Select a release to preview details.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sub-panel sub-release-detail">
      <div className="sub-panel__body">
        <div className="sub-release-detail__hero">
          {release.coverUrl ? (
            <img src={release.coverUrl} alt="" className="sub-release-detail__cover" />
          ) : (
            <span className="sub-release-detail__cover-placeholder" aria-hidden>
              <Disc3 className="size-6" />
            </span>
          )}
          <div>
            <h3 className="sub-release-detail__title">{track?.title ?? release.title}</h3>
            <p className="sub-release-detail__artist">{release.artistName ?? 'Artist'}</p>
            <span className="sub-release-detail__badge">{release.type}</span>
          </div>
        </div>

        <div className="sub-waveform">
          <button
            type="button"
            className="sub-waveform__play"
            onClick={togglePlay}
            disabled={!audioUrl}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <div className="sub-waveform__bars" aria-hidden>
            {bars.map((scale, i) => (
              <span
                key={i}
                className="sub-waveform__bar sub-waveform__bar--active"
                style={{ '--bar-scale': scale } as React.CSSProperties}
              />
            ))}
          </div>
          <span className="sub-waveform__time">{formatDuration(track?.durationSec)}</span>
          {audioUrl ? (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setPlaying(false)}
              onPause={() => setPlaying(false)}
              preload="metadata"
            />
          ) : null}
        </div>

        <div className="sub-meta-grid">
          <div className="sub-meta-grid__item">
            <span className="sub-meta-grid__label">Genre</span>
            <span className="sub-meta-grid__value">{release.genre ?? '—'}</span>
          </div>
          <div className="sub-meta-grid__item">
            <span className="sub-meta-grid__label">Sub Genre</span>
            <span className="sub-meta-grid__value">—</span>
          </div>
          <div className="sub-meta-grid__item">
            <span className="sub-meta-grid__label">Language</span>
            <span className="sub-meta-grid__value">—</span>
          </div>
          <div className="sub-meta-grid__item">
            <span className="sub-meta-grid__label">Release Date</span>
            <span className="sub-meta-grid__value">
              {release.releaseDate ? new Date(release.releaseDate).toLocaleDateString() : '—'}
            </span>
          </div>
          <div className="sub-meta-grid__item">
            <span className="sub-meta-grid__label">Explicit Content</span>
            <span className="sub-meta-grid__value">—</span>
          </div>
          <div className="sub-meta-grid__item">
            <span className="sub-meta-grid__label">ISRC</span>
            <span className="sub-meta-grid__value">—</span>
          </div>
        </div>

        <Button variant="outline" size="sm" asChild>
          <Link to={`/artist/releases/${release.id}/edit`}>Edit Details</Link>
        </Button>
      </div>
    </div>
  )
}
