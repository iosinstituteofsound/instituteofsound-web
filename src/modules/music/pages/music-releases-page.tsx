import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { invalidateArtistSurfaceQueries } from '@/modules/explore/lib/invalidate-artist-surface'
import { filterReleases } from '@/modules/explore/lib/release-meta'
import type { ReleaseFilter } from '@/modules/explore/types/explore.types'
import { deleteRelease, listArtistReleases } from '@/modules/music/api/music.api'
import { ArtistReleasesGrid } from '@/modules/music/components/artist-releases-grid'
import { artistReleaseBreadcrumbs } from '@/modules/music/lib/artist-breadcrumb'
import { toReleaseDto } from '@/modules/music/lib/release-map'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { Loader } from '@/shared/components/feedback/loader'
import { Page, PageSection } from '@/shared/components/layout/page-shell'
import { cn } from '@/shared/lib/cn'
import '@/modules/explore/styles/releases-page.css'
import '@/modules/music/styles/artist-dashboard-home.css'
import '@/modules/music/styles/artist-releases-page.css'

const TYPE_FILTERS: { value: ReleaseFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'album', label: 'Albums' },
  { value: 'ep', label: 'EPs' },
  { value: 'single', label: 'Singles' },
]

export function MusicReleasesPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<ReleaseFilter>('all')

  const { data: releases, isLoading } = useQuery({
    queryKey: ['artist-releases'],
    queryFn: listArtistReleases,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRelease,
    onSuccess: () => {
      toast.success('Release deleted')
      void queryClient.invalidateQueries({ queryKey: ['artist-releases'] })
      invalidateArtistSurfaceQueries(queryClient)
    },
  })

  const filtered = useMemo(() => {
    const items = releases ?? []
    const dtos = items.map(toReleaseDto)
    const filteredDtos = filterReleases(dtos, filter)
    const ids = new Set(filteredDtos.map((item) => item.id))
    return items.filter((item) => ids.has(item.id))
  }, [releases, filter])

  const albumsAndEps = useMemo(
    () => filtered.filter((item) => item.type === 'album' || item.type === 'ep'),
    [filtered],
  )
  const singles = useMemo(() => filtered.filter((item) => item.type === 'single'), [filtered])
  const showGrouped = filter === 'all' && albumsAndEps.length > 0 && singles.length > 0

  const filterCounts = useMemo(() => {
    const items = releases ?? []
    const dtos = items.map(toReleaseDto)
    return TYPE_FILTERS.map((option) => ({
      ...option,
      count: filterReleases(dtos, option.value).length,
    }))
  }, [releases])

  return (
    <Page>
      <PageSection className="artist-releases-page releases-page releases-page--embed">
        <AppBreadcrumb
          surface
          className="app-breadcrumb--dashboard"
          items={artistReleaseBreadcrumbs.releases()}
          description="Your published and scheduled releases."
          actions={
            <Link to="/artist/releases/new" className="ios-artist-dashboard__upload-btn">
              New Release
            </Link>
          }
        />

        <div className="artist-releases-page__filters releases-page__filters" role="tablist" aria-label="Release type filters">
          {filterCounts.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={filter === option.value ? 'true' : 'false'}
              className={cn(
                'releases-page__filter',
                filter === option.value && 'releases-page__filter--on',
              )}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
              {option.count > 0 ? ` (${option.count})` : ''}
            </button>
          ))}
        </div>

        {isLoading ? <Loader className="py-12" /> : null}

        {!isLoading && showGrouped ? (
          <div className="space-y-8">
            <section className="artist-releases-page__section" aria-labelledby="artist-albums-heading">
              <header className="artist-releases-page__section-head">
                <p className="ios-mh-kicker">:: Catalog</p>
                <h2 id="artist-albums-heading" className="artist-releases-page__section-title">
                  Albums / EP
                </h2>
              </header>
              <ArtistReleasesGrid
                releases={albumsAndEps}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDeleting={deleteMutation.isPending}
              />
            </section>

            <section className="artist-releases-page__section" aria-labelledby="artist-singles-heading">
              <header className="artist-releases-page__section-head">
                <p className="ios-mh-kicker">:: Singles</p>
                <h2 id="artist-singles-heading" className="artist-releases-page__section-title">
                  Singles
                </h2>
              </header>
              <ArtistReleasesGrid
                releases={singles}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDeleting={deleteMutation.isPending}
              />
            </section>
          </div>
        ) : null}

        {!isLoading && !showGrouped ? (
          <ArtistReleasesGrid
            releases={filtered}
            onDelete={(id) => deleteMutation.mutate(id)}
            isDeleting={deleteMutation.isPending}
          />
        ) : null}
      </PageSection>
    </Page>
  )
}
