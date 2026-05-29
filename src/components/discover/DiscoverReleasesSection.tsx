import { useCallback, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { GatedLink } from '@/components/auth/GatedLink'
import { IOSImage } from '@/components/ui/IOSImage'
import { useDiscoverPremieres } from '@/hooks/useDiscoverPremieres'
import {
  filterPremiereCards,
  formatPlayCount,
  formatPremiereDate,
  type DiscoverPremiereCard,
  type PremiereBadge,
  type PremiereFilter,
} from '@/lib/discovery/premieres'
import '@/styles/releases-premieres.css'

const FILTERS: { id: PremiereFilter; label: string }[] = [
  { id: 'all', label: 'All releases' },
  { id: 'album', label: 'Albums' },
  { id: 'ep', label: 'EPs' },
  { id: 'single', label: 'Singles' },
  { id: 'archive', label: 'Archive drops' },
]

const BADGE_LABEL: Record<PremiereBadge, string> = {
  wire_pick: 'Wire pick',
  hot: 'Hot',
  new: 'New',
}

function MiniWave() {
  return (
    <span className="prem-wave" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} />
      ))}
    </span>
  )
}

function PremiereCard({ card }: { card: DiscoverPremiereCard }) {
  const [broken, setBroken] = useState(false)
  const badge = card.badge ? BADGE_LABEL[card.badge] : card.isEditorPick ? 'Wire pick' : null

  return (
    <GatedLink
      to={`/artist/${card.artistSlug}`}
      forceGate
      className="prem-card"
      aria-label={`${card.trackTitle} by ${card.artistName}`}
    >
      <article className="prem-card__inner">
        {badge && <span className="prem-card__badge">{badge}</span>}
        <span className="prem-card__play" aria-hidden>
          <PlayIcon />
        </span>
        <div className="prem-card__art">
          {card.coverUrl && !broken ? (
            <IOSImage
              src={card.coverUrl}
              alt=""
              width={400}
              sizes="240px"
              className="prem-card__img"
              onBroken={() => setBroken(true)}
            />
          ) : (
            <div className="prem-card__art-fallback" aria-hidden>
              {card.trackTitle.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="prem-card__body">
          <p className="prem-card__genre">{card.genreLabel}</p>
          <h3 className="prem-card__title">{card.trackTitle}</h3>
          <p className="prem-card__artist">{card.artistName}</p>
        </div>
        <footer className="prem-card__foot">
          <span className="prem-card__date">
            <CalendarIcon />
            {formatPremiereDate(card.trackCreatedAt)}
          </span>
          <span className="prem-card__plays">
            <MiniWave />
            {formatPlayCount(card.playCount)} plays
          </span>
          <span className="prem-card__ext" aria-hidden>
            ↗
          </span>
        </footer>
      </article>
    </GatedLink>
  )
}

export function DiscoverReleasesSection() {
  const { cards, loading } = useDiscoverPremieres(24)
  const trackRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<PremiereFilter>('all')

  const filtered = useMemo(
    () => filterPremiereCards(cards ?? [], filter),
    [cards, filter]
  )

  const scrollBy = useCallback((dir: -1 | 1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.prem-card')
    const step = card ? card.offsetWidth + 14 : 240
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  return (
    <section id="discover-releases" className="prem-sec scroll-mt-24">
      <header className="prem-sec__head">
        <div className="prem-sec__brand">
          <span className="prem-sec__idx" aria-hidden>
            03
          </span>
          <div>
            <p className="prem-sec__tag">Premieres</p>
            <h2 className="prem-sec__title">Releases</h2>
            <p className="prem-sec__sub">Albums and archive drops from artist studios.</p>
          </div>
        </div>
        <GatedLink to="/releases" forceGate className="prem__all-btn">
          All releases
          <span aria-hidden>→</span>
        </GatedLink>
      </header>

      <div className="prem__toolbar">
        <div className="prem__filters" role="tablist" aria-label="Release filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              className={clsx('prem__filter', filter === f.id && 'prem__filter--on')}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="prem__nav">
          <button
            type="button"
            className="prem__arrow"
            aria-label="Previous releases"
            onClick={() => scrollBy(-1)}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            className="prem__arrow"
            aria-label="Next releases"
            onClick={() => scrollBy(1)}
          >
            <Chevron dir="right" />
          </button>
        </div>
      </div>

      {loading && <p className="disco-loading">Loading premieres…</p>}

      {!loading && filtered.length === 0 && (
        <p className="disco-empty">
          No tracks on the wire yet — artists add streams on their profile pages.
        </p>
      )}

      {!loading && filtered.length > 0 && (
        <div ref={trackRef} className="prem__track hide-scrollbar">
          {filtered.map((card) => (
            <PremiereCard key={card.trackId} card={card} />
          ))}
        </div>
      )}
    </section>
  )
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 4.8v4.4l4-2.2-4-2.2z" fill="currentColor" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <rect x="1.5" y="2" width="8" height="7.5" rx="1" stroke="currentColor" strokeWidth="1" />
      <path d="M3.5 1v2M7.5 1v2M1.5 4.5h8" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
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
