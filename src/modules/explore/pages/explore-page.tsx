import { Compass, Home } from 'lucide-react'
import { useExplore } from '@/modules/explore/hooks/use-explore'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { CenteredPageState } from '@/shared/components/feedback/centered-page-state'
import { Loader } from '@/shared/components/feedback/loader'
import { useBreadcrumbHomeHref } from '@/shared/hooks/use-breadcrumb-home'
import { ExploreEditorialSection } from '@/modules/explore/components/explore-editorial-section'
import { ExploreArtistsSection } from '@/modules/explore/components/explore-artists-section'
import { ExploreReleasesSection } from '@/modules/explore/components/explore-releases-section'
import { ExploreLabelsSection } from '@/modules/explore/components/explore-labels-section'
import { ExplorePlaylistsSection } from '@/modules/explore/components/explore-playlists-section'
import { ExploreSceneHubsSection } from '@/modules/explore/components/explore-scene-hubs-section'
import { ExploreEventsSection } from '@/modules/explore/components/explore-events-section'
import { ExploreListenersSection } from '@/modules/explore/components/explore-listeners-section'
import { ExploreCommunitySection } from '@/modules/explore/components/explore-community-section'
import { ExploreSectionDivider } from '@/modules/explore/components/explore-section-divider'
import '@/modules/explore/styles/explore-section-head.css'
import '@/modules/explore/styles/explore-mh-chrome.css'
import '@/modules/explore/styles/explore.css'
import '@/modules/explore/styles/explore-page-mobile.css'

export function ExplorePage() {
  const { data, isLoading, isError } = useExplore()
  const homeHref = useBreadcrumbHomeHref()

  if (isLoading) return <Loader className="min-h-screen bg-background" />
  if (isError || !data) {
    return (
      <CenteredPageState message="Could not load Explore. Check API connection." pageClassName="explore-page" />
    )
  }

  return (
    <div className="explore-page pb-4 md:pb-16">
      <div className="explore-section !pb-0 !pt-6">
        <AppBreadcrumb
          surface
          items={[
            { label: 'Home', href: homeHref, icon: Home },
            { label: 'Explore', icon: Compass },
          ]}
          description="Artists, releases, labels, and editorial picks from across the network."
        />
      </div>

      <ExploreEditorialSection
        coverStory={data.editorial.coverStory}
        sidebar={data.editorial.sidebar}
      />

      <ExploreSectionDivider variant="gateway" />

      <ExploreArtistsSection artists={data.artists} />

      <ExploreSectionDivider variant="saturn" />

      <ExploreReleasesSection releases={data.releases} />

      <ExploreSectionDivider variant="seal" />

      <ExploreLabelsSection
        labels={data.labels}
        artistCount={data.artists.length}
        releaseCount={data.releases.length}
      />

      <ExploreSectionDivider variant="lunar" />

      <ExplorePlaylistsSection
        featured={data.playlists.featured}
        items={data.playlists.items}
      />

      <ExploreSectionDivider variant="aurora" />

      <ExploreSceneHubsSection
        hubs={data.sceneHubs}
        artistCount={data.artists.length}
        releaseCount={data.releases.length}
        eventCount={data.events.length}
      />

      <ExploreSectionDivider variant="nova" />

      <ExploreEventsSection events={data.events} />

      <ExploreSectionDivider variant="eclipse" />

      <ExploreListenersSection
        topListener={data.listeners.topListener}
        cards={data.listeners.cards}
        totalListeners={data.listeners.totalListeners}
        totalPlays={data.listeners.totalPlays}
      />

      <ExploreSectionDivider variant="nexus" />

      <ExploreCommunitySection community={data.community} />
    </div>
  )
}
