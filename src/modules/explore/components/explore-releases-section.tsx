import { useCallback, useRef, useState } from 'react'
import { ArrowUpRight, Calendar, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import type { ReleaseDto, ReleaseFilter } from '@/modules/explore/types/explore.types'
import { ArtistWaveform } from '@/modules/explore/components/artist-waveform'
import {
  filterReleases,
  isHotRelease,
  isNewRelease,
  releaseDateLabel,
  releaseGenreLabel,
  releaseInitials,
  releasePlays,
  releaseTrackCount,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { cn } from '@/shared/lib/cn'

const FILTER_OPTIONS: { value: ReleaseFilter; label: string }[] = [
  { value: 'all', label: 'All Releases' },
  { value: 'album', label: 'Albums' },
  { value: 'ep', label: 'EPs' },
  { value: 'single', label: 'Singles' },
  { value: 'archive', label: 'Archive Drops' },
]

function ReleaseCover({ release }: { release: ReleaseDto }) {
  if (release.coverUrl) {
    return <img src={release.coverUrl} alt="" loading="lazy" className="explore-rel-card__cover-img" />
  }

  return (
    <div className="explore-rel-card__cover-mono" aria-hidden>
      <span>{releaseInitials(release.title)}</span>
    </div>
  )
}

function ReleaseCard({ release, index }: { release: ReleaseDto; index: number }) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const tracks = releaseTrackCount(release)
  const showPlays = index % 2 === 1

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!release.streamUrl) return
    playTrack({
      id: release.id,
      title: release.title,
      artist: release.artistName ?? 'Unknown',
      audioUrl: release.streamUrl,
      artworkUrl: release.coverUrl,
    })
  }

  return (
    <article
      className="explore-rel-card explore-rel-glass"
      style={{ '--explore-rel-card-delay': `${70 + index * 50}ms` } as React.CSSProperties}
    >
      <div className="explore-rel-card__cover">
        <ReleaseCover release={release} />
        <div className="explore-rel-card__badges">
          <span className="explore-rel-card__badge">{releaseTypeLabel(release.type)}</span>
          {isHotRelease(release) ? <span className="explore-rel-card__badge">Hot</span> : null}
          {isNewRelease(release) ? <span className="explore-rel-card__badge explore-rel-card__badge--accent">New</span> : null}
        </div>
        {release.streamUrl ? (
          <button
            type="button"
            className="explore-rel-card__play"
            aria-label={`Play ${release.title}`}
            onClick={handlePlay}
          >
            <Play size={14} strokeWidth={2} fill="currentColor" aria-hidden />
          </button>
        ) : null}
      </div>

      <div className="explore-rel-card__body">
        <p className="explore-rel-card__genre">{releaseGenreLabel(release)}</p>
        <h3 className="explore-rel-card__title">{release.title}</h3>
        {release.artistName ? <p className="explore-rel-card__artist">{release.artistName}</p> : null}
        <p className="explore-rel-card__meta">
          {showPlays ? `${releasePlays(release)} plays` : `${tracks} tracks`}
        </p>
        <div className="explore-rel-card__foot">
          <span className="explore-rel-card__date">
            <Calendar size={12} strokeWidth={1.75} aria-hidden />
            {releaseDateLabel(release)}
          </span>
          <ArtistWaveform slug={release.id} className="explore-rel-card__wave" />
          <button type="button" className="explore-rel-card__arrow" aria-label={`Open ${release.title}`}>
            <ArrowUpRight size={15} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
}

export function ExploreReleasesSection({ releases }: { releases: ReleaseDto[] }) {
  const [filter, setFilter] = useState<ReleaseFilter>('all')
  const [scrollPct, setScrollPct] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const filtered = filterReleases(releases, filter)

  const syncScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setScrollPct(max > 0 ? (el.scrollLeft / max) * 100 : 0)
  }, [])

  const scrollBy = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * 400, behavior: 'smooth' })
  }

  if (releases.length === 0) return null

  return (
    <section id="explore-releases" className="explore-section explore-rel-section">
      <header className="explore-rel-head">
        <div className="explore-rel-head__top">
          <div className="explore-rel-head__brand">
            <span className="explore-rel-head__num" aria-hidden>
              03
            </span>
            <div>
              <p className="explore-rel-head__kicker">Premieres</p>
              <h2 className="explore-rel-head__title">Releases</h2>
              <p className="explore-rel-head__sub">Albums and archive drops from artist studios.</p>
            </div>
          </div>
          <a href="#explore-releases" className="explore-rel-head__all">
            All Releases
            <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
          </a>
        </div>

        <div className="explore-rel-head__controls">
          <div className="explore-rel-filters">
            {FILTER_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                className={cn('explore-rel-filter', filter === value && 'is-active')}
                onClick={() => setFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="explore-rel-nav">
            <div className="explore-rel-scroll-track explore-rel-scroll-track--compact" aria-hidden>
              <span className="explore-rel-scroll-thumb" style={{ left: `${scrollPct * 0.62}%` }} />
            </div>
            <button type="button" className="explore-rel-nav__btn" aria-label="Scroll releases left" onClick={() => scrollBy(-1)}>
              <ChevronLeft size={18} strokeWidth={2} />
            </button>
            <button type="button" className="explore-rel-nav__btn" aria-label="Scroll releases right" onClick={() => scrollBy(1)}>
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      <div ref={trackRef} className="explore-rel-track" onScroll={syncScroll}>
        {filtered.map((release, i) => (
          <ReleaseCard key={release.id} release={release} index={i} />
        ))}
      </div>
    </section>
  )
}
