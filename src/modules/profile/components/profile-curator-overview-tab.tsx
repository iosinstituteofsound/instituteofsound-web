import type { UserDto } from '@/shared/types/auth.types'
import { CuratorActivityFeed } from '@/modules/profile/components/curator/curator-activity-feed'
import { CuratorArtistRail } from '@/modules/profile/components/curator/curator-artist-rail'
import { CuratorSimilarArtistsRail } from '@/modules/profile/components/curator/curator-similar-artists-rail'
import { CuratorCommunityReputation } from '@/modules/profile/components/curator/curator-community-reputation'
import { CuratorDiscoveryWall } from '@/modules/profile/components/curator/curator-discovery-wall'
import { CuratorEditorialContributions } from '@/modules/profile/components/curator/curator-editorial-contributions'
import { CuratorFeaturedPlaylists } from '@/modules/profile/components/curator/curator-featured-playlists'
import { CuratorIntelligenceGrid } from '@/modules/profile/components/curator/curator-intelligence-grid'
import { CuratorRecentPicks } from '@/modules/profile/components/curator/curator-recent-picks'
import { CuratorStatsBar } from '@/modules/profile/components/curator/curator-stats-bar'
import { useProfileCuratorOverview } from '@/modules/profile/hooks/use-profile-curator-overview'
import { mergeCuratorOverviewWithDemo } from '@/modules/profile/lib/curator-overview-demo'
import { PageLoader } from '@/shared/components/feedback/loader'
import '@/modules/profile/styles/profile-curator-overview.css'
import '@/modules/profile/styles/curator-discovery-device.css'

type ProfileCuratorOverviewTabProps = {
  user: UserDto
  isOwnProfile?: boolean
}

export function ProfileCuratorOverviewTab({ user, isOwnProfile }: ProfileCuratorOverviewTabProps) {
  const { data, isLoading } = useProfileCuratorOverview(user.id)
  const overview = mergeCuratorOverviewWithDemo(user, data ?? undefined)

  if (isLoading) return <PageLoader />

  const playlistsHref = isOwnProfile ? '/curator/playlists' : '/explore#explore-playlists'
  const picksHref = isOwnProfile ? '/curator/picks' : '/explore#explore-editorial'

  return (
    <div className="profile-curator-overview">
      <CuratorStatsBar stats={overview.stats} />

      <CuratorIntelligenceGrid
        scores={overview.scores}
        tasteMap={overview.tasteMap}
        genreTags={overview.genreTags}
      />

      <CuratorFeaturedPlaylists playlists={overview.featuredPlaylists} viewAllHref={playlistsHref} />

      <div className="profile-curator-overview__split profile-curator-overview__split--primary">
        <CuratorDiscoveryWall artists={overview.discoveryWall} />
        <div className="profile-curator-overview__rail">
          <CuratorRecentPicks picks={overview.recentPicks} viewAllHref={picksHref} />
          <CuratorEditorialContributions articles={overview.editorialContributions} />
        </div>
      </div>

      <CuratorArtistRail
        title="Top Supported Artists"
        id="curator-top-supported-heading"
        artists={overview.topSupportedArtists}
        viewAllHref="/discover#explore-artists"
      />

      <div className="profile-curator-overview__split profile-curator-overview__split--secondary">
        <CuratorSimilarArtistsRail
          id="curator-followers-also-heading"
          artists={overview.followersAlsoListen}
          viewAllHref="/discover#explore-artists"
        />
        <div className="profile-curator-overview__rail">
          <CuratorCommunityReputation stats={overview.communityReputation} />
          <CuratorActivityFeed items={overview.activityFeed} viewAllHref={isOwnProfile ? '/home' : undefined} />
        </div>
      </div>
    </div>
  )
}
