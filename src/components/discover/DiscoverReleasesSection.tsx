import { useCallback, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { GatedLink } from '@/components/auth/GatedLink'
import { PremiereCard } from '@/components/releases/PremiereCard'
import { useDiscoverPremieres } from '@/hooks/useDiscoverPremieres'
import { filterPremiereCards, type PremiereFilter } from '@/lib/discovery/premieres'
import '@/styles/releases-premieres.css'

const FILTERS: { id: PremiereFilter; label: string }[] = [
  { id: 'all', label: 'All releases' },
  { id: 'album', label: 'Albums' },
  { id: 'ep', label: 'EPs' },
  { id: 'single', label: 'Singles' },
  { id: 'archive', label: 'Archive drops' },
]

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
