import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useReleasesCatalog } from '@/modules/explore/hooks/use-releases-catalog'
import { useReleasesPage } from '@/modules/explore/hooks/use-releases-page'
import { ReleasesGridCard } from '@/modules/explore/components/releases-grid-card'
import { ReleasesFeaturedHero } from '@/modules/explore/components/releases-featured-hero'
import { ReleasesGenreGrid } from '@/modules/explore/components/releases-genre-grid'
import { Loader } from '@/shared/components/feedback/loader'
import { useBreadcrumbHomeHref } from '@/shared/hooks/use-breadcrumb-home'
import type { ReleasesPageFilter } from '@/modules/explore/types/explore.types'
import { releaseDateLabel } from '@/modules/explore/lib/release-meta'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { releaseDtoToPlayerTrack } from '@/modules/music/lib/player-track-builders'
import { cn } from '@/shared/lib/cn'
import '@/modules/explore/styles/explore.css'
import '@/modules/explore/styles/explore-mh-chrome.css'
import '@/modules/explore/styles/releases-page.css'

export function ReleasesPage() {
  const { data: catalog, isLoading: catalogLoading, isError: catalogError } = useReleasesCatalog()
  const homeHref = useBreadcrumbHomeHref()
  const playTrack = usePlayerStore((s) => s.playTrack)
  const [searchParams, setSearchParams] = useSearchParams()
  const genreSlug = searchParams.get('genre')
  const [filter, setFilter] = useState<ReleasesPageFilter>('all')

  const {
    data: pages,
    isLoading: listLoading,
    isError: listError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useReleasesPage(filter, genreSlug)

  const releases = useMemo(
    () => pages?.pages.flatMap((page) => page.items) ?? [],
    [pages],
  )

  const total = pages?.pages[0]?.total ?? catalog?.stats.total ?? 0

  const activeGenre = useMemo(
    () => (genreSlug ? catalog?.genres.find((g) => g.slug === genreSlug) : null),
    [catalog?.genres, genreSlug],
  )

  if (catalogLoading) return <Loader className="min-h-screen bg-background" />
  if (catalogError || !catalog) {
    return (
      <div className="releases-page flex min-h-screen items-center justify-center p-8 text-center">
        <p>Could not load releases. Check API connection.</p>
      </div>
    )
  }

  const { featured, rail, upcoming, genres, filters, stats } = catalog

  const handleFeaturedPlay = (release: NonNullable<typeof featured>) => {
    const track = releaseDtoToPlayerTrack(release)
    if (!track) return
    playTrack(track)
  }

  return (
    <div className="releases-page">
      <div className="releases-page__shell">
        <nav className="releases-page__crumb" aria-label="Breadcrumb">
          <Link to={homeHref}>Home</Link>
          <span aria-hidden>/</span>
          <Link to="/explore">Explore</Link>
          <span aria-hidden>/</span>
          <span aria-current="page">Releases</span>
        </nav>

        <header className="releases-page__masthead">
          <div className="releases-page__brand">
            <div>
              <p className="releases-page__kicker">New drop</p>
              <h1 className="releases-page__title">Releases</h1>
              <p className="releases-page__lede">
                Full catalog from published artist studios — music tracks, discography, and premiere
                releases. Every approved artist submission appears here automatically.
                {stats.total > 0 ? (
                  <>
                    {' '}
                    <strong>
                      {stats.total.toLocaleString()} releases
                      {stats.albums > 0 ? ` · ${stats.albums.toLocaleString()} albums` : ''}
                      {stats.eps > 0 ? ` · ${stats.eps.toLocaleString()} EPs` : ''}
                    </strong>
                  </>
                ) : null}
              </p>
            </div>
          </div>
          <Link to="/artist/releases/new" className="releases-page__submit">
            Submit release
          </Link>
        </header>

        {featured ? (
          <ReleasesFeaturedHero featured={featured} rail={rail} onPlay={handleFeaturedPlay} />
        ) : null}

        <section className="releases-page__latest" aria-labelledby="latest-releases-heading">
          <div className="releases-page__latest-top">
            <h2 id="latest-releases-heading" className="releases-page__section-title">
              <span className="releases-page__dot" aria-hidden />
              Latest releases
              {activeGenre ? (
                <span className="releases-page__genre-pill">{activeGenre.label}</span>
              ) : null}
            </h2>
            <Link to="/explore#explore-releases" className="releases-page__see-all">
              See all
            </Link>
          </div>

          {filters.length > 0 ? (
            <div className="releases-page__filters" role="tablist" aria-label="Release filters">
              {filters.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={filter === f.id ? 'true' : 'false'}
                  className={cn(
                    'releases-page__filter',
                    filter === f.id && 'releases-page__filter--on',
                  )}
                  onClick={() => {
                    setFilter(f.id as ReleasesPageFilter)
                    if (genreSlug) setSearchParams({})
                  }}
                >
                  {f.label}
                  {f.count > 0 ? ` (${f.count.toLocaleString()})` : ''}
                </button>
              ))}
            </div>
          ) : null}

          {listLoading ? (
            <Loader className="py-12" />
          ) : listError ? (
            <p className="releases-page__empty">Could not load release catalog.</p>
          ) : releases.length === 0 ? (
            <p className="releases-page__empty">No releases match this filter.</p>
          ) : (
            <>
              <div className="releases-page__grid">
                {releases.map((release) => (
                  <ReleasesGridCard key={release.id} release={release} />
                ))}
              </div>

              <div className="releases-page__pager">
                <p className="releases-page__pager-meta">
                  <span className="releases-page__pager-label">Showing</span>{' '}
                  <span className="releases-page__pager-count">
                    {releases.length.toLocaleString()}
                  </span>
                  <span aria-hidden> of </span>
                  <span className="releases-page__pager-total">
                    {total.toLocaleString()}
                  </span>{' '}
                  releases
                </p>
                {hasNextPage ? (
                  <button
                    type="button"
                    className="ios-mh-btn ios-mh-btn--line releases-page__btn"
                    disabled={isFetchingNextPage}
                    onClick={() => void fetchNextPage()}
                  >
                    {isFetchingNextPage ? 'Loading…' : 'Load more releases'}
                  </button>
                ) : null}
              </div>
            </>
          )}
        </section>

        <div className="releases-page__split">
          {upcoming.length > 0 ? (
            <section className="releases-page__upcoming" aria-labelledby="upcoming-heading">
              <div className="releases-page__split-head">
                <h2 id="upcoming-heading" className="releases-page__section-title">
                  Upcoming releases
                </h2>
                <Link to="/explore#explore-releases" className="releases-page__see-all">
                  See all
                  <span className="releases-page__see-all-arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </div>
              <ul className="releases-page__upcoming-list">
                {upcoming.map((release) => (
                  <li key={release.id}>
                    <div className="releases-page__upcoming-row">
                      <time className="releases-page__upcoming-date">
                        {releaseDateLabel(release)}
                      </time>
                      <Link
                        to={`/releases/${release.id}`}
                        className="releases-page__upcoming-main"
                      >
                        {release.coverUrl ? (
                          <img
                            src={release.coverUrl}
                            alt=""
                            width={56}
                            className="releases-page__upcoming-thumb"
                            loading="lazy"
                          />
                        ) : (
                          <span className="releases-page__upcoming-thumb releases-page__upcoming-thumb--fb">
                            {release.title.slice(0, 1)}
                          </span>
                        )}
                        <span>
                          <span className="releases-page__upcoming-title">{release.title}</span>
                          {release.artistName ? (
                            <span className="releases-page__upcoming-artist">
                              {release.artistName}
                            </span>
                          ) : null}
                          {release.labelName ? (
                            <span className="releases-page__upcoming-label">{release.labelName}</span>
                          ) : null}
                        </span>
                      </Link>
                      <button
                        type="button"
                        className="ios-mh-btn ios-mh-btn--line releases-page__presave"
                        disabled
                        title="Coming soon"
                      >
                        Pre-save
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="releases-page__genres" aria-labelledby="genre-heading">
            <div className="releases-page__split-head">
              <h2 id="genre-heading" className="releases-page__section-title">
                Browse by genre
              </h2>
              <Link to="/releases" className="releases-page__see-all">
                See all
                <span className="releases-page__see-all-arrow" aria-hidden>
                  →
                </span>
              </Link>
            </div>
            <ReleasesGenreGrid genres={genres} activeSlug={genreSlug} />
          </section>
        </div>

        <section className="releases-page__cta">
          <div>
            <p className="releases-page__cta-kicker ios-mh-kicker">Are you an artist?</p>
            <p className="releases-page__cta-text">
              Submit your track — once approved by the desk, it goes live on this catalog for everyone.
            </p>
          </div>
          <Link to="/artist/releases/new" className="ios-mh-btn ios-mh-btn--fill releases-page__btn">
            Submit your release
          </Link>
        </section>
      </div>
    </div>
  )
}
