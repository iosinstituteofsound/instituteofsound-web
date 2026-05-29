import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { DiscoverReleasesSection } from '@/components/discover/DiscoverReleasesSection'
import { GatedLink } from '@/components/auth/GatedLink'
import { IOSImage } from '@/components/ui/IOSImage'
import { useDiscoverPremieres } from '@/hooks/useDiscoverPremieres'
import { useSeo } from '@/hooks/useSeo'
import {
  currentHourBucket,
  filterPremiereCards,
  formatPlayCount,
  formatPremiereDate,
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

export default function ReleasesPage() {
  const [filter, setFilter] = useState<PremiereFilter>('all')
  const { cards, loading, refresh } = useDiscoverPremieres(48)

  useSeo({
    title: 'All releases',
    description:
      'Premieres and profile tracks from underground artists on Institute of Sound — refreshed hourly on the wire.',
    canonicalPath: '/releases',
  })

  const filtered = useMemo(
    () => filterPremiereCards(cards ?? [], filter),
    [cards, filter]
  )

  return (
    <div className="discover-wire mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 lg:py-8">
      <header className="prem-sec__head mb-8">
        <div className="prem-sec__brand">
          <span className="prem-sec__idx" aria-hidden>
            03
          </span>
          <div>
            <p className="prem-sec__tag">Premieres</p>
            <h1 className="prem-sec__title">All releases</h1>
            <p className="prem-sec__sub">
              One track per artist studio — editor picks first, then hourly rotation.
            </p>
            <p className="prem-page__refresh">
              Wire bucket <strong>{cards?.[0]?.hourBucket ?? currentHourBucket()}</strong> · refreshes
              each hour (UTC)
            </p>
          </div>
        </div>
        <GatedLink to="/discover#discover-releases" className="prem__all-btn">
          Back to explore
          <span aria-hidden>→</span>
        </GatedLink>
      </header>

      <div className="prem__toolbar mb-6">
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
        <button type="button" className="ios-btn ios-btn-ghost !text-xs" onClick={() => void refresh()}>
          Refresh wire
        </button>
      </div>

      {loading && <p className="disco-loading">Loading releases…</p>}

      {!loading && filtered.length === 0 && (
        <p className="disco-empty">No releases match this filter on the current wire.</p>
      )}

      {!loading && filtered.length > 0 && (
        <div className="prem-page__grid">
          {filtered.map((card) => (
            <GatedLink
              key={card.trackId}
              to={`/artist/${card.artistSlug}`}
              forceGate
              className="prem-card !flex-none !w-auto"
            >
              <article className="prem-card__inner">
                {card.badge && (
                  <span className="prem-card__badge">
                    {card.badge === 'wire_pick' ? 'Wire pick' : card.badge}
                  </span>
                )}
                <div className="prem-card__art">
                  {card.coverUrl ? (
                    <IOSImage
                      src={card.coverUrl}
                      alt=""
                      width={400}
                      className="prem-card__img"
                    />
                  ) : (
                    <div className="prem-card__art-fallback">{card.trackTitle.slice(0, 1)}</div>
                  )}
                </div>
                <div className="prem-card__body">
                  <p className="prem-card__genre">{card.genreLabel}</p>
                  <h2 className="prem-card__title">{card.trackTitle}</h2>
                  <p className="prem-card__artist">{card.artistName}</p>
                </div>
                <footer className="prem-card__foot">
                  <span>{formatPremiereDate(card.trackCreatedAt)}</span>
                  <span className="prem-card__plays">{formatPlayCount(card.playCount)} plays</span>
                </footer>
              </article>
            </GatedLink>
          ))}
        </div>
      )}
    </div>
  )
}
