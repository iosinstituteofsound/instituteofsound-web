import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { CuratorStudioHomePage } from '@/modules/curator/pages/curator-studio-home-page'
import { MusicPlaylistsPage } from '@/modules/music/pages/music-playlists-page'
import { Page, PageDescription, PageHeader, PageSection, PageTitle } from '@/shared/components/layout/page-shell'
import { Button } from '@/shared/components/ui/button'

function CuratorPicksPage() {
  return (
    <Page>
      <PageHeader>
        <PageTitle>Signal Picks</PageTitle>
        <PageDescription>
          Curator signal picks surface on your profile overview. Full pick management is coming next.
        </PageDescription>
      </PageHeader>
      <PageSection className="max-w-lg space-y-4">
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Recent picks already appear on your public curator profile. Use editorial tools to publish full curator
          reviews linked from each pick.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/profile">View profile picks</Link>
        </Button>
      </PageSection>
    </Page>
  )
}

export function CuratorDashboardPage() {
  const location = useLocation()
  const path = location.pathname

  if (path.includes('/curator/playlists')) return <MusicPlaylistsPage />
  if (path.includes('/curator/picks')) return <CuratorPicksPage />

  return <CuratorStudioHomePage />
}
