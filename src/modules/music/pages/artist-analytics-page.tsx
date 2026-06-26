import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { downloadArtistAnalyticsCsv, getArtistAnalyticsDashboard, getArtistProfile } from '@/modules/music/api/music.api'
import { useAnalyticsRealtime } from '@/modules/music/hooks/use-analytics-realtime'
import { ArtistListeningAnalytics } from '@/modules/music/components/artist-listening-analytics'
import { Page, PageDescription, PageHeader, PageHeaderMain, PageSection, PageTitle } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'
import { Loader } from '@/shared/components/feedback/loader'
import '@/modules/explore/styles/release-analytics.css'
import '@/modules/music/styles/artist-analytics.css'

export function ArtistAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['artist-analytics'],
    queryFn: getArtistAnalyticsDashboard,
  })

  const { data: artistProfile } = useQuery({
    queryKey: ['artist-profile'],
    queryFn: getArtistProfile,
  })

  useAnalyticsRealtime({
    artistMode: true,
    artistProfileId: artistProfile?.id,
  })

  const handleExport = async () => {    const csv = await downloadArtistAnalyticsCsv()
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
    <Page className="ios-artist-analytics ios-artist-analytics--full">
      <PageHeader>
        <PageHeaderMain>
          <p className="ios-section-label ios-section-label--mh">Artist studio</p>
          <PageTitle>Listening analytics</PageTitle>
          <PageDescription>
            Full-width view of plays, listeners, and locations across all your published releases.
          </PageDescription>
        </PageHeaderMain>
        <Button type="button" variant="outline" onClick={() => void handleExport()}>
          <Download size={16} />
          Export CSV
        </Button>
      </PageHeader>

      <PageSection className="ios-artist-analytics__body">
        {data ? <ArtistListeningAnalytics data={data} /> : null}
      </PageSection>
    </Page>
  )
}
