import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ArtistProfileDto, ExploreFilter } from '@/modules/explore/types/explore.types'
import {
  artistFollowers,
  artistGenreLabel,
  avatarStackSeeds,
  filterArtists,
} from '@/modules/explore/lib/artist-meta'
import { ArtistCardMedia, ArtistWaveform } from '@/modules/explore/components/artist-waveform'
import { cn } from '@/shared/lib/cn'

const FILTER_OPTIONS: { value: ExploreFilter; label: string }[] = [
  { value: 'all', label: 'Human-Ranked' },
  { value: 'top', label: 'Verified' },
  { value: 'new', label: 'Open Studios' },
]

function ArtistCard({ artist, index }: { artist: ArtistProfileDto; index: number }) {
  const fanSeeds = avatarStackSeeds(artist.slug)

  return (
    <Link
      to={`/profile/${artist.userId}`}
      className="explore-art-card explore-art-glass"
      style={{ '--explore-art-card-delay': `${80 + index * 55}ms` } as React.CSSProperties}
      aria-label={`View ${artist.displayName}`}
    >
      <ArtistCardMedia artist={artist} />
      <div className="explore-art-card__scrim" aria-hidden />
      <span className="explore-art-card__open">• Open</span>
      <span className="explore-art-card__idx">{String(index + 1).padStart(2, '0')}</span>
      <div className="explore-art-card__panel explore-art-glass-panel">
        <p className="explore-art-card__genre">{artistGenreLabel(artist)}</p>
        <h3 className="explore-art-card__name">{artist.displayName}</h3>
        <ArtistWaveform slug={artist.slug} />
        <span className="explore-art-card__cta">
          View Artist
          <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
        </span>
        <div className="explore-art-card__foot">
          <div className="explore-art-card__avatars" aria-hidden>
            {fanSeeds.map((seed, i) => (
              <img
                key={seed}
                src={`https://picsum.photos/seed/${seed}/64/64`}
                alt=""
                className="explore-art-card__avatar"
                style={{ zIndex: 3 - i }}
              />
            ))}
          </div>
          <span className="explore-art-card__followers">
            {artistFollowers(artist.slug)} Followers
          </span>
        </div>
      </div>
    </Link>
  )
}

export function ExploreArtistsSection({ artists }: { artists: ArtistProfileDto[] }) {
  const [filter, setFilter] = useState<ExploreFilter>('all')
  const [scrollPct, setScrollPct] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  const filtered = filterArtists(artists, filter)
  const openCount = artists.filter((a) => a.genres.length > 0 || a.bio).length

  const syncScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setScrollPct(max > 0 ? (el.scrollLeft / max) * 100 : 0)
  }, [])

  const scrollBy = (dir: -1 | 1) => {
    trackRef.current?.scrollBy({ left: dir * 400, behavior: 'smooth' })
  }

  if (artists.length === 0) return null

  return (
    <section id="explore-artists" className="explore-section explore-art-section">
      <header className="explore-art-head">
        <div className="explore-art-head__top">
          <div className="explore-art-head__brand">
            <span className="explore-art-head__num" aria-hidden>
              02
            </span>
            <div>
              <h2 className="explore-art-head__title">Artists</h2>
              <p className="explore-art-head__sub">
                Live studio pages on the underground network.
              </p>
            </div>
          </div>

          <div className="explore-art-head__aside">
            <ul className="explore-art-head__stats">
              <li>
                <span className="explore-art-head__stat-val">{artists.length}+</span>
                <span className="explore-art-head__stat-label">Artists</span>
              </li>
              <li>
                <span className="explore-art-head__stat-val">{openCount}+</span>
                <span className="explore-art-head__stat-label">Open Studios</span>
              </li>
              <li className="explore-art-head__stat-accent">
                <span className="explore-art-head__stat-val">24/7</span>
                <span className="explore-art-head__stat-label">The Wire</span>
              </li>
            </ul>
            <div className="explore-art-nav explore-art-nav--compact">
              <div className="explore-art-scroll-track explore-art-scroll-track--compact" aria-hidden>
                <span
                  className="explore-art-scroll-thumb"
                  style={{ left: `${scrollPct * 0.62}%` }}
                />
              </div>
              <button
                type="button"
                className="explore-art-nav__btn"
                aria-label="Scroll artists left"
                onClick={() => scrollBy(-1)}
              >
                <ChevronLeft size={18} strokeWidth={2} />
              </button>
              <button
                type="button"
                className="explore-art-nav__btn"
                aria-label="Scroll artists right"
                onClick={() => scrollBy(1)}
              >
                <ChevronRight size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        <div className="explore-art-filters">
          {FILTER_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={cn('explore-art-filter', filter === value && 'is-active')}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div ref={trackRef} className="explore-art-track" onScroll={syncScroll}>
        {filtered.map((artist, i) => (
          <ArtistCard key={artist.id} artist={artist} index={i} />
        ))}
      </div>

      <footer className="explore-art-wire">
        <div className="explore-art-wire__copy">
          <p className="explore-art-wire__label">The Wire</p>
          <p className="explore-art-wire__sub">New studios joining now.</p>
        </div>
        <div className="explore-art-wire__scroll" aria-hidden>
          <div className="explore-art-scroll-track explore-art-scroll-track--wire">
            <span
              className="explore-art-scroll-handle"
              style={{ left: `calc(${scrollPct}% - ${scrollPct * 0.12}%)` }}
            />
          </div>
        </div>
        <a href="#explore-artists" className="explore-art-wire__link">
          View All Artists
          <ArrowUpRight size={15} strokeWidth={2} aria-hidden />
        </a>
      </footer>
    </section>
  )
}
