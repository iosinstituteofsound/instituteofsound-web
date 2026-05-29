import { useCallback, useMemo, useState } from 'react'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { getAlbumReleases } from '@/api/endpoints'
import { GatedLink } from '@/components/auth/GatedLink'
import { IOSImage } from '@/components/ui/IOSImage'
import { PremiereCard } from '@/components/releases/PremiereCard'
import { ReleaseVinylArt } from '@/components/releases/ReleaseVinylArt'
import { useContent } from '@/hooks/useContent'
import { useReleasesCatalog } from '@/hooks/useReleasesCatalog'
import { useSeo } from '@/hooks/useSeo'
import { SCENE_GENRE_SLUGS } from '@/lib/releases/constants'
import {
  filterForReleasesPage,
  RELEASES_PAGE_FILTERS,
  type ReleasesPageFilter,
} from '@/lib/discovery/releasesPageFilters'
import { formatPremiereDate } from '@/lib/discovery/premieres'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import '@/styles/releases-premieres.css'

const GENRE_IMAGES: Record<string, string> = {
  electronic:
    'https://images.unsplash.com/photo-1571330735066-0abcd4055f08?auto=format&fit=crop&w=600&q=80',
  metal:
    'https://images.unsplash.com/photo-1498038432885-c6d3f1e8e8f0?auto=format&fit=crop&w=600&q=80',
  indie:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  'hip-hop':
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
  rock:
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80',
  experimental:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  jazz:
    'https://images.unsplash.com/photo-1415201364774-f6f0ba3a80a0?auto=format&fit=crop&w=600&q=80',
  folk:
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
}

export default function ReleasesPage() {
  const [filter, setFilter] = useState<ReleasesPageFilter>('all')
  const { cards, loading, refresh } = useReleasesCatalog()
  const upcoming = useContent(useCallback(() => getAlbumReleases(), []))

  useSeo({
    title: 'Releases',
    description:
      'Every track, album, and premiere release from published artist studios on Institute of Sound.',
    canonicalPath: '/releases',
    jsonLd: breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Releases', path: '/releases' },
    ]),
  })

  const all = cards ?? []
  const filtered = useMemo(() => filterForReleasesPage(all, filter), [all, filter])

  const trackCount = useMemo(
    () => all.filter((c) => c.catalogKind !== 'album').length,
    [all]
  )
  const albumShellCount = useMemo(
    () => all.filter((c) => c.catalogKind === 'album').length,
    [all]
  )

  const featured = useMemo(() => {
    const playable =
      all.find((c) => c.isEditorPick && c.catalogKind !== 'album' && c.streamUrl) ??
      all.find((c) => c.catalogKind !== 'album' && c.streamUrl) ??
      all[0]
    return playable ?? null
  }, [all])

  const featuredRail = useMemo(() => {
    if (!featured) return all.slice(0, 4)
    return all.filter((c) => c.trackId !== featured.trackId).slice(0, 4)
  }, [all, featured])

  const releaseTypeLabel = (rt: string) => {
    if (rt === 'album') return 'Album'
    if (rt === 'ep') return 'EP'
    return 'Single'
  }

  return (
    <div className="discover-wire prem-page mx-auto w-full max-w-[1200px] px-3 py-5 sm:px-4 lg:py-8">
      <header className="prem-page__top">
        <div className="prem-sec__brand">
          <span className="prem-sec__idx" aria-hidden>
            02
          </span>
          <div>
            <p className="prem-page__drop">New drop</p>
            <h1 className="prem-sec__title">Releases</h1>
            <p className="prem-sec__sub">
              Full catalog from published artist studios — Music tracks, discography, and premiere
              releases. When an artist publishes their studio and adds material, it appears here.{' '}
              {!loading && (
                <strong>
                  {trackCount} tracks
                  {albumShellCount > 0 ? ` · ${albumShellCount} albums` : ''}
                </strong>
              )}
            </p>
          </div>
        </div>
        <GatedLink to="/submissions" forceGate className="prem-page__submit">
          Submit release
        </GatedLink>
      </header>

      {loading && <p className="disco-loading">Loading releases…</p>}

      {!loading && featured && (
        <section className="prem-page__hero" aria-label="Featured release">
          <div className="prem-page__hero-main">
            <div className="prem-page__hero-art">
              <ReleaseVinylArt
                coverUrl={featured.coverUrl}
                fallbackLetter={featured.trackTitle}
                variant="hero"
                width={560}
              />
            </div>
            <div className="prem-page__hero-copy">
              <span className="prem-page__out">Out now</span>
              <h2 className="prem-page__hero-title">{featured.trackTitle}</h2>
              <p className="prem-page__hero-artist">{featured.artistName}</p>
              <div className="prem-page__tags">
                <span>{releaseTypeLabel(featured.releaseType)}</span>
                <span>{featured.genreLabel}</span>
              </div>
              <p className="prem-page__hero-dek">
                {formatPremiereDate(featured.trackCreatedAt)} —{' '}
                {featured.catalogKind === 'album'
                  ? 'Album on the artist studio.'
                  : 'Stream from the artist studio or open the full profile.'}
              </p>
              <div className="prem-page__hero-actions">
                {featured.catalogKind !== 'album' && featured.streamUrl && (
                  <a
                    href={featured.streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="prem-page__btn prem-page__btn--fill"
                  >
                    Listen now
                  </a>
                )}
                <GatedLink
                  to={`/artist/${featured.artistSlug}${featured.catalogKind === 'album' ? '#releases' : ''}`}
                  forceGate
                  className="prem-page__btn prem-page__btn--line"
                >
                  View release
                </GatedLink>
              </div>
            </div>
          </div>

          <aside className="prem-page__rail" aria-label="More featured">
            {featuredRail.map((card) => (
              <GatedLink
                key={card.trackId}
                to={`/artist/${card.artistSlug}`}
                forceGate
                className="prem-page__rail-item"
              >
                {card.coverUrl ? (
                  <IOSImage src={card.coverUrl} alt="" width={80} className="prem-page__rail-thumb" />
                ) : (
                  <span className="prem-page__rail-thumb prem-page__rail-thumb--fb">
                    {card.trackTitle.slice(0, 1)}
                  </span>
                )}
                <span>
                  <span className="prem-page__rail-title">{card.trackTitle}</span>
                  <span className="prem-page__rail-artist">{card.artistName}</span>
                </span>
              </GatedLink>
            ))}
          </aside>
        </section>
      )}

      <section className="prem-page__latest" aria-labelledby="latest-releases-heading">
        <div className="prem-page__latest-head">
          <h2 id="latest-releases-heading" className="prem-page__section-title">
            <span className="prem-page__dot" aria-hidden />
            Latest releases
          </h2>
          <div className="prem__filters" role="tablist" aria-label="Release filters">
            {RELEASES_PAGE_FILTERS.map((f) => (
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
        </div>

        <div className="prem-page__latest-toolbar">
          <GatedLink to="/discover#discover-releases" forceGate className="prem-page__view-all">
            Hourly picks on explore
          </GatedLink>
          <button type="button" className="ios-btn ios-btn-ghost !text-xs" onClick={() => void refresh()}>
            Refresh catalog
          </button>
        </div>

        {!loading && filtered.length === 0 && (
          <p className="disco-empty">No releases match this filter on the current wire.</p>
        )}

        {!loading && filtered.length > 0 && (
          <div className="prem-page__grid">
            {filtered.map((card) => (
              <PremiereCard
                key={card.trackId}
                card={card}
                headingLevel="h3"
                className="prem-card prem-page__grid-card"
              />
            ))}
          </div>
        )}
      </section>

      <div className="prem-page__split">
        <section className="prem-page__upcoming" aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="prem-page__section-title">
            Upcoming releases
          </h2>
          <ul className="prem-page__upcoming-list">
            {(upcoming.data ?? []).slice(0, 5).map((item) => (
              <li key={item.id}>
                <div className="prem-page__upcoming-row">
                  <time className="prem-page__upcoming-date">{item.releaseDate}</time>
                  <Link to={item.href ?? '/discover'} className="prem-page__upcoming-main">
                    <IOSImage
                      src={item.cover}
                      alt=""
                      width={56}
                      className="prem-page__upcoming-thumb"
                    />
                    <span>
                      <span className="prem-page__upcoming-title">{item.title}</span>
                      <span className="prem-page__upcoming-artist">{item.artist}</span>
                      <span className="prem-page__upcoming-label">{item.label}</span>
                    </span>
                  </Link>
                  <button type="button" className="prem-page__presave" disabled title="Soon">
                    Pre-save
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="prem-page__genres" aria-labelledby="genre-heading">
          <h2 id="genre-heading" className="prem-page__section-title">
            Browse by genre
          </h2>
          <div className="prem-page__genre-grid">
            {SCENE_GENRE_SLUGS.map((g) => (
              <Link
                key={g.slug}
                to={`/scenes/delhi/${g.slug}`}
                className="prem-page__genre-card"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.35)), url(${GENRE_IMAGES[g.slug] ?? GENRE_IMAGES.electronic})`,
                }}
              >
                <span className="prem-page__genre-name">{g.label}</span>
                <span className="prem-page__genre-arrow" aria-hidden>
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="prem-page__cta">
        <div>
          <p className="prem-page__cta-kicker">Are you an artist?</p>
          <p className="prem-page__cta-text">
            Get your music in front of our global underground community.
          </p>
        </div>
        <GatedLink to="/submissions" forceGate className="prem-page__btn prem-page__btn--fill">
          Submit your release
        </GatedLink>
      </section>
    </div>
  )
}
