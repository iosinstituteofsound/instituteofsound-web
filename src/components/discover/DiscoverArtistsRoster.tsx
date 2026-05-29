import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import clsx from 'clsx'
import { GatedLink } from '@/components/auth/GatedLink'
import { IOSImage } from '@/components/ui/IOSImage'
import type { Artist } from '@/types'
import '@/styles/roster-pro.css'

type RosterFilter = 'ranked' | 'verified' | 'open'

export interface DiscoverArtistsRosterProps {
  artists: Artist[]
  loading: boolean
  onCarouselReady?: (api: {
    scrollBy: (dir: -1 | 1) => void
    activeIndex: number
    pageCount: number
  }) => void
}

function artistInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
}

function followerLabel(slug: string): string {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * 31) % 100000
  const n = 600 + (h % 4800)
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K Followers` : `${n} Followers`
}

function WaveformBars({ className }: { className?: string }) {
  return (
    <div className={clsx('roster-pro-wave', className)} aria-hidden>
      {Array.from({ length: 20 }, (_, i) => (
        <span key={i} style={{ '--bar-i': i } as CSSProperties} />
      ))}
    </div>
  )
}

function isOpenArtist(artist: Artist, index: number): boolean {
  return Boolean(artist.featured || artist.onTour || index % 3 === 0)
}

function RosterArtistCard({ artist, index }: { artist: Artist; index: number }) {
  const hasImage = Boolean(artist.image?.trim())
  const [showImage, setShowImage] = useState(hasImage)
  const open = isOpenArtist(artist, index)
  const verified = !open

  return (
    <GatedLink
      to={`/artist/${artist.slug}`}
      forceGate
      className="roster-pro-card"
      aria-label={`${artist.name} — ${artist.genre}`}
    >
      <article className="roster-pro-card__inner">
        <div className="roster-pro-card__top">
          {open ? (
            <span className="roster-pro-card__open">
              <span className="roster-pro-card__open-dot" aria-hidden />
              Open
            </span>
          ) : (
            <span className="roster-pro-card__wire">On wire</span>
          )}
          <span className="roster-pro-card__num">{String(index + 1).padStart(2, '0')}</span>
        </div>

        <div className="roster-pro-card__media">
          {showImage && hasImage ? (
            <IOSImage
              src={artist.image}
              alt=""
              width={560}
              sizes="280px"
              className="roster-pro-card__img"
              onBroken={() => setShowImage(false)}
            />
          ) : (
            <div className="roster-pro-card__placeholder">
              <span>{artistInitials(artist.name)}</span>
            </div>
          )}
        </div>

        <div className="roster-pro-card__shade" aria-hidden />

        <div className="roster-pro-card__content">
          <p className="roster-pro-card__genre">{artist.genre}</p>
          <h3 className="roster-pro-card__name">{artist.name}</h3>
          <WaveformBars className="roster-pro-card__title-wave" />
          <p className="roster-pro-card__status">
            {verified ? (
              <>
                <CheckIcon />
                Verified artist
              </>
            ) : (
              <>Open artist</>
            )}
          </p>

          <span className="roster-pro-card__cta">
            View artist
            <span aria-hidden>→</span>
          </span>

          <div className="roster-pro-card__social">
            <div className="roster-pro-card__avatars" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <span className="roster-pro-card__followers">{followerLabel(artist.slug)}</span>
          </div>
        </div>
      </article>
    </GatedLink>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2 6.2 4.8 9 10 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const FILTERS: { id: RosterFilter; label: string }[] = [
  { id: 'ranked', label: 'Human-ranked' },
  { id: 'verified', label: 'Verified' },
  { id: 'open', label: 'Open studios' },
]

export function DiscoverArtistsRoster({ artists, loading, onCarouselReady }: DiscoverArtistsRosterProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<RosterFilter>('ranked')
  const [carouselPage, setCarouselPage] = useState(0)
  const [carouselPages, setCarouselPages] = useState(1)
  const [scrollProgress, setScrollProgress] = useState(0)

  const filtered = (() => {
    if (filter === 'open') {
      const open = artists.filter(
        (a, i) => a.featured || Boolean(a.newAlbum) || a.onTour || i % 3 === 0
      )
      return open.length > 0 ? open : artists
    }
    return artists
  })()

  const syncScroll = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setScrollProgress(max > 0 ? el.scrollLeft / max : 0)
    const card = el.querySelector<HTMLElement>('.roster-pro-card')
    const gap = 14
    const cardW = card ? card.offsetWidth + gap : 274
    const perView = Math.max(1, Math.floor((el.clientWidth + gap) / cardW))
    const pages = Math.max(1, Math.ceil(filtered.length / perView))
    setCarouselPages(pages)
    setCarouselPage(Math.min(pages - 1, Math.floor(el.scrollLeft / (cardW * perView))))
  }, [filtered.length])

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.roster-pro-card')
    const gap = 14
    const cardW = card ? card.offsetWidth + gap : 274
    const perView = Math.max(1, Math.floor((el.clientWidth + gap) / cardW))
    el.scrollBy({ left: dir * cardW * perView, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    syncScroll()
    el.addEventListener('scroll', syncScroll, { passive: true })
    return () => el.removeEventListener('scroll', syncScroll)
  }, [syncScroll, filtered.length])

  useEffect(() => {
    onCarouselReady?.({
      scrollBy,
      activeIndex: carouselPage,
      pageCount: carouselPages,
    })
  }, [onCarouselReady, scrollBy, carouselPage, carouselPages])

  return (
    <div className="roster-pro">
      <div className="roster-pro__filters-row" role="tablist" aria-label="Roster filters">
        {FILTERS.map((f, i) => (
          <span key={f.id} className="roster-pro__filter-wrap">
            {i > 0 && <span className="roster-pro__filter-dot" aria-hidden />}
            <button
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={clsx('roster-pro__filter', filter === f.id && 'roster-pro__filter--on')}
              onClick={() => {
                setFilter(f.id)
                trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
              }}
            >
              {f.label}
            </button>
          </span>
        ))}
      </div>

      {loading && <p className="disco-loading">Scanning roster…</p>}

      {!loading && filtered.length > 0 && (
        <div ref={trackRef} className="roster-pro__track hide-scrollbar">
          {filtered.map((artist, index) => (
            <RosterArtistCard key={artist.id} artist={artist} index={index} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <p className="disco-empty">No artists match this filter yet.</p>
      )}

      <footer className="roster-pro__foot">
        <div className="roster-pro__wire">
          <WaveformBars className="roster-pro__foot-wave roster-pro__foot-wave--live" />
          <div>
            <p className="roster-pro__wire-title">The wire</p>
            <p className="roster-pro__wire-sub">New studios joining now.</p>
          </div>
        </div>

        <div className="roster-pro__progress-wrap">
          <div
            className="roster-pro__progress"
            role="progressbar"
            aria-valuenow={Math.round(scrollProgress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className="roster-pro__progress-thumb"
              style={{ left: `${scrollProgress * 100}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          className="roster-pro__view-all"
          onClick={() => {
            const el = trackRef.current
            if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
          }}
        >
          View all artists
          <span className="roster-pro__view-all-icon" aria-hidden>
            ↗
          </span>
        </button>
      </footer>
    </div>
  )
}

export function RosterCarouselNav({
  pageCount,
  activeIndex,
  onPrev,
  onNext,
}: {
  pageCount: number
  activeIndex: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="roster-pro-sec__nav">
      <div className="roster-pro__dots" aria-hidden>
        {Array.from({ length: Math.min(pageCount, 12) }, (_, i) => (
          <span key={i} className={clsx('roster-pro__dot', i === activeIndex && 'roster-pro__dot--on')} />
        ))}
      </div>
      <button type="button" className="roster-pro__arrow" aria-label="Previous artists" onClick={onPrev}>
        <ChevronIcon dir="left" />
      </button>
      <button type="button" className="roster-pro__arrow" aria-label="Next artists" onClick={onNext}>
        <ChevronIcon dir="right" />
      </button>
    </div>
  )
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d={dir === 'left' ? 'M9 3 5 7l4 4' : 'M5 3l4 4-4 4'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
