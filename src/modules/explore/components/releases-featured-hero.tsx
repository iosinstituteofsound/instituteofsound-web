import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { ReleaseVinylArt } from '@/modules/explore/components/release-vinyl-art'
import {
  releaseDateLabel,
  releaseGenreLabel,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'
import { cn } from '@/shared/lib/cn'

const ROTATE_MS = 5200

interface ReleasesFeaturedHeroProps {
  featured: ReleaseDto
  rail: ReleaseDto[]
  onPlay: (release: ReleaseDto) => void
}

export function ReleasesFeaturedHero({ featured, rail, onPlay }: ReleasesFeaturedHeroProps) {
  const lineup = useMemo(() => {
    const rest = rail.filter((r) => r.id !== featured.id)
    return [featured, ...rest].slice(0, 5)
  }, [featured, rail])

  const [activeId, setActiveId] = useState(featured.id)
  const [wireIndex, setWireIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setActiveId(featured.id)
    setWireIndex(0)
  }, [featured.id])

  const activeIndex = wireIndex
  const active = lineup.find((release) => release.id === activeId) ?? featured

  const selectRelease = useCallback(
    (index: number) => {
      const next = lineup[index]
      if (!next || index === wireIndex) return
      setWireIndex(index)
      setActiveId(next.id)
    },
    [lineup, wireIndex],
  )

  const goTo = useCallback((index: number) => selectRelease(index), [selectRelease])

  const goNext = useCallback(() => {
    selectRelease((wireIndex + 1) % lineup.length)
  }, [lineup.length, selectRelease, wireIndex])

  const goPrev = useCallback(() => {
    selectRelease((wireIndex - 1 + lineup.length) % lineup.length)
  }, [lineup.length, selectRelease, wireIndex])

  useEffect(() => {
    if (lineup.length <= 1 || paused) return

    const timer = window.setInterval(goNext, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [goNext, lineup.length, paused])

  const wireListStyle = { '--wire-active-index': activeIndex } as CSSProperties

  return (
    <section
      className="rel-hero"
      aria-label="Featured release"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false)
        }
      }}
    >
      <div className="rel-hero__main">
        <div className="rel-hero__art">
          <ReleaseVinylArt release={active} variant="hero" className="rel-hero__vinyl" />
        </div>

        <div className="rel-hero__copy">
          <header className="rel-hero__masthead">
            <span className="rel-hero__kicker ios-mh-kicker">Out now</span>

            <div className="rel-hero__title-block">
              <h2 className="rel-hero__title">{active.title}</h2>
              {active.artistName ? (
                <p className="rel-hero__artist">
                  <span className="rel-hero__artist-label">by</span>
                  <span className="rel-hero__artist-name">{active.artistName}</span>
                </p>
              ) : null}
            </div>
          </header>

          <div className="rel-hero__rule" aria-hidden />

          <div className="rel-hero__body">
            <div className="rel-hero__info">
              <div className="rel-hero__tags">
                <span className="ios-mh-tag">{releaseTypeLabel(active.type)}</span>
                <span className="ios-mh-tag">{releaseGenreLabel(active)}</span>
                <time className="rel-hero__date" dateTime={active.releaseDate ?? undefined}>
                  {releaseDateLabel(active)}
                </time>
              </div>

              <p className="rel-hero__dek">
                Stream from the artist studio or open the full profile.
              </p>

              <div className="rel-hero__actions">
                {active.streamUrl ? (
                  <button
                    type="button"
                    className="ios-mh-btn ios-mh-btn--fill rel-hero__btn"
                    onClick={() => onPlay(active)}
                  >
                    <Play size={11} strokeWidth={2.5} fill="currentColor" aria-hidden />
                    Listen now
                  </button>
                ) : null}
                <Link
                  to={`/releases/${active.id}`}
                  className="ios-mh-btn ios-mh-btn--line rel-hero__btn"
                >
                  View release
                </Link>
              </div>
            </div>

            {lineup.length > 1 ? (
              <aside className="rel-hero__wire" aria-label="Featured rotation">
                <header className="rel-hero__wire-head">
                  <p className="rel-hero__wire-kicker ios-mh-kicker">On the wire</p>
                  <span className="rel-hero__wire-count" aria-live="polite">
                    {String(activeIndex + 1).padStart(2, '0')}
                    <span aria-hidden> / </span>
                    {String(lineup.length).padStart(2, '0')}
                  </span>
                </header>

                <ol className="rel-hero__wire-list" style={wireListStyle}>
                  {lineup.map((release, index) => {
                    const isActive = index === wireIndex
                    return (
                      <li key={release.id} className="rel-hero__wire-row">
                        <button
                          type="button"
                          className={cn('rel-hero__wire-item', isActive && 'is-active')}
                          aria-current={isActive ? 'true' : undefined}
                          aria-label={`${release.title}${release.artistName ? ` by ${release.artistName}` : ''}`}
                          onClick={() => goTo(index)}
                        >
                          <span className="rel-hero__wire-index">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="rel-hero__wire-body">
                            <span className="rel-hero__wire-title">{release.title}</span>
                            {release.artistName ? (
                              <span className="rel-hero__wire-artist">{release.artistName}</span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ol>

                <div className="rel-hero__wire-controls">
                  <button
                    type="button"
                    className="rel-hero__wire-nav"
                    aria-label="Previous featured release"
                    onClick={goPrev}
                  >
                    <ChevronLeft size={13} strokeWidth={2.5} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="rel-hero__wire-nav"
                    aria-label="Next featured release"
                    onClick={goNext}
                  >
                    <ChevronRight size={13} strokeWidth={2.5} aria-hidden />
                  </button>
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
