import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Heart, MessageCircle } from 'lucide-react'
import { getIllustratorAnalyticsDashboard } from '@/modules/illustrator/api/illustrator.api'
import { illustratorBreadcrumbs } from '@/modules/illustrator/lib/illustrator-breadcrumb'
import { filterIllustratorTrendByDays, formatIllustratorCount } from '@/modules/illustrator/lib/illustrator-dashboard-utils'
import { DashboardLineChart } from '@/modules/music/components/artist-dashboard/dashboard-line-chart'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { Loader } from '@/shared/components/feedback/loader'
import { EmptyState } from '@/shared/components/feedback/states'
import { Page, PageDescription, PageHeader, PageHeaderMain, PageSection, PageTitle } from '@/shared/components/layout/page-shell'
import '@/modules/music/styles/artist-analytics.css'
import '@/modules/music/styles/artist-dashboard-home.css'

export function IllustratorAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['illustrator-analytics'],
    queryFn: getIllustratorAnalyticsDashboard,
  })

  const trend30 = useMemo(() => filterIllustratorTrendByDays(data?.trend ?? [], 30), [data?.trend])
  const chartPoints = useMemo(
    () =>
      trend30.map((p) => ({
        date: p.date,
        qualifiedPlays: p.reactions,
        totalListenSec: 0,
        sessions: p.comments,
        completions: p.posts,
        skips: 0,
        likes: 0,
      })),
    [trend30],
  )

  if (isLoading) return <Loader />

  const overview = data?.overview

  return (
    <Page className="ios-artist-analytics ios-artist-analytics--full">
      <PageHeader>
        <PageHeaderMain>
          <p className="ios-section-label ios-section-label--mh">Studio</p>
          <PageTitle>Artwork analytics</PageTitle>
          <PageDescription>
            Reactions, comments, and portfolio engagement across your published image posts.
          </PageDescription>
        </PageHeaderMain>
      </PageHeader>

      <PageSection className="ios-artist-analytics__body space-y-6">
        <AppBreadcrumb surface className="app-breadcrumb--dashboard" items={illustratorBreadcrumbs.analytics()} />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total reactions', value: overview?.totalReactions ?? 0 },
            { label: 'Comments', value: overview?.totalComments ?? 0 },
            { label: 'Canvas pieces', value: overview?.portfolioCount ?? 0 },
            { label: 'Unique engagers', value: overview?.uniqueEngagers ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-border/60 bg-card/40 p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold">{formatIllustratorCount(stat.value)}</p>
            </div>
          ))}
        </div>

        <section className="ios-artist-dashboard__panel">
          <div className="ios-artist-dashboard__panel-head">
            <h2 className="ios-artist-dashboard__panel-title">30-day engagement trend</h2>
          </div>
          <DashboardLineChart
            points={chartPoints}
            emptyMessage="Share artwork posts to unlock analytics."
            ariaLabel="Artwork engagement trend"
            className="ios-artist-dashboard__chart-wrap"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Artwork breakdown</h2>
          {data?.artworks.length ? (
            <div className="grid gap-3">
              {data.artworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/30 p-4"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted/30">
                    {artwork.imageUrl ? (
                      <img src={artwork.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{artwork.title || 'Untitled artwork'}</p>
                    <p className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Heart size={14} aria-hidden />
                        {formatIllustratorCount(artwork.reactionTotal)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle size={14} aria-hidden />
                        {formatIllustratorCount(artwork.commentCount)}
                      </span>
                    </p>
                  </div>
                  <Link to={`/feed/${artwork.id}`} className="text-sm font-medium text-primary hover:underline">
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              variant="dashed"
              title=""
              description="No artwork analytics yet. Image posts on the feed power this dashboard."
            />
          )}
        </section>
      </PageSection>
    </Page>
  )
}
