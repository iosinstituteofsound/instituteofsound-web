import { Link } from 'react-router-dom'
import { Compass, ListMusic, Radio } from 'lucide-react'
import { DashboardPanel, Page, PageDescription, PageHeader, PageSection, PageTitle } from '@/shared/components/layout'
import { Button } from '@/shared/components/ui/button'

export function CuratorStudioHomePage() {
  return (
    <Page>
      <PageHeader>
        <PageTitle>Curator Studio</PageTitle>
        <PageDescription>
          Shape taste, surface discovery, and manage the playlists and signal picks that define your profile.
        </PageDescription>
      </PageHeader>
      <PageSection>
        <div className="grid gap-3 sm:grid-cols-3">
          <DashboardPanel className="backdrop-blur-sm">
            <Compass className="mb-3 h-5 w-5 text-primary" aria-hidden />
            <h3 className="font-semibold">Public profile</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your curator intelligence, discovery wall, and editorial footprint live on your profile overview.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link to="/profile">Open profile</Link>
            </Button>
          </DashboardPanel>
          <DashboardPanel className="backdrop-blur-sm">
            <ListMusic className="mb-3 h-5 w-5 text-primary" aria-hidden />
            <h3 className="font-semibold">Playlists</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Curate featured playlists that showcase your taste and drive artist discovery.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link to="/curator/playlists">Manage playlists</Link>
            </Button>
          </DashboardPanel>
          <DashboardPanel className="backdrop-blur-sm">
            <Radio className="mb-3 h-5 w-5 text-primary" aria-hidden />
            <h3 className="font-semibold">Signal picks</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Publish signal picks with curator notes that open into full reviews.
            </p>
            <Button asChild size="sm" variant="outline" className="mt-4">
              <Link to="/curator/picks">Open picks</Link>
            </Button>
          </DashboardPanel>
        </div>
      </PageSection>
    </Page>
  )
}
