import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { downloadArtistAnalyticsCsv, getArtistAnalyticsDashboard } from '@/modules/music/api/music.api'
import { formatListenTime, formatPercent, formatPlays } from '@/modules/music/lib/analytics-format'
import { Page, PageHeader, PageSection, PageTitle } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Loader } from '@/shared/components/feedback/loader'
import '@/modules/explore/styles/release-analytics.css'

export function ArtistAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['artist-analytics'],
    queryFn: getArtistAnalyticsDashboard,
  })

  const handleExport = async () => {
    const csv = await downloadArtistAnalyticsCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'artist-analytics.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) return <Loader />

  return (
    <Page className="ios-artist-analytics">
      <PageHeader className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>Analytics</PageTitle>
        <Button type="button" variant="outline" onClick={() => void handleExport()}>
          <Download size={16} />
          Export CSV
        </Button>
      </PageHeader>

      <PageSection>
        <div className="ios-artist-analytics__overview">
          <div className="ios-release-analytics__stat">
            <span className="ios-release-analytics__stat-label">Plays</span>
            <span className="ios-release-analytics__stat-value">
              {formatPlays(data?.overview.qualifiedPlays ?? 0)}
            </span>
          </div>
          <div className="ios-release-analytics__stat">
            <span className="ios-release-analytics__stat-label">Listen hours</span>
            <span className="ios-release-analytics__stat-value">
              {formatListenTime(data?.overview.totalListenSec ?? 0)}
            </span>
          </div>
          <div className="ios-release-analytics__stat">
            <span className="ios-release-analytics__stat-label">Completion</span>
            <span className="ios-release-analytics__stat-value">
              {formatPercent(data?.overview.averageCompletionRate ?? 0)}
            </span>
          </div>
          <div className="ios-release-analytics__stat">
            <span className="ios-release-analytics__stat-label">Likes</span>
            <span className="ios-release-analytics__stat-value">
              {formatPlays(data?.overview.activeLikes ?? 0)}
            </span>
          </div>
          <div className="ios-release-analytics__stat">
            <span className="ios-release-analytics__stat-label">Listeners</span>
            <span className="ios-release-analytics__stat-value">
              {formatPlays(data?.overview.uniqueListeners ?? 0)}
            </span>
          </div>
        </div>

        <h2 className="mb-3 text-lg font-semibold">Releases</h2>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Plays</th>
                <th>Listen time</th>
                <th>Completion</th>
                <th>Likes</th>
                <th>Links</th>
              </tr>
            </thead>
            <tbody>
              {(data?.releases ?? []).map((r) => (
                <tr key={r.releaseId}>
                  <td>{r.title}</td>
                  <td className="capitalize">{r.type}</td>
                  <td>{formatPlays(r.qualifiedPlays)}</td>
                  <td>{formatListenTime(r.totalListenSec)}</td>
                  <td>{formatPercent(r.completionRate)}</td>
                  <td>{formatPlays(r.activeLikes)}</td>
                  <td>
                    <Link to={`/releases/${r.releaseId}`} className="underline mr-2">
                      Release
                    </Link>
                    <Link to={`/releases/${r.releaseId}/listeners`} className="underline mr-2">
                      Listeners
                    </Link>
                    <Link to={`/releases/${r.releaseId}/likes`} className="underline">
                      Likes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.releases.length ? (
            <p className="text-sm text-muted-foreground">No published releases with analytics yet.</p>
          ) : null}
        </div>
      </PageSection>
    </Page>
  )
}
