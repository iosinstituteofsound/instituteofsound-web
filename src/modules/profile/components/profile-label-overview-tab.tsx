import type { UserDto } from '@/shared/types/auth.types'
import { LabelOverviewAboutDevice } from '@/modules/profile/components/label-overview-about-device'
import { LabelOverviewArtistsDevice } from '@/modules/profile/components/label-overview-artists-device'
import { LabelOverviewFeaturedRelease } from '@/modules/profile/components/label-overview-featured-release'
import { LabelOverviewLatestNews } from '@/modules/profile/components/label-overview-latest-news'
import { LabelOverviewLatestReleases } from '@/modules/profile/components/label-overview-latest-releases'
import { LabelOverviewPlaylists } from '@/modules/profile/components/label-overview-playlists'
import { LabelOverviewByTheNumbers } from '@/modules/profile/components/label-overview-by-the-numbers'
import { mergeLabelOverviewWithDemo } from '@/modules/profile/lib/label-overview-demo'
import { useProfileLabelOverview } from '@/modules/profile/hooks/use-profile-label-overview'
import { PageLoader } from '@/shared/components/feedback/loader'
import '@/modules/profile/styles/profile-label-overview.css'

type ProfileLabelOverviewTabProps = {
  user: UserDto
  isOwnProfile?: boolean
  onNavigateToAbout?: () => void
}

export function ProfileLabelOverviewTab({ user, isOwnProfile, onNavigateToAbout }: ProfileLabelOverviewTabProps) {
  const { data, isLoading } = useProfileLabelOverview(user.id)
  const overview = mergeLabelOverviewWithDemo(user, data)

  if (isLoading) return <PageLoader />

  return (
    <div className="profile-label-overview">
      <div className="profile-label-overview__hero">
        <div className="profile-label-overview__featured">
          <LabelOverviewFeaturedRelease
            releases={overview.featuredReleases}
            editable={isOwnProfile}
            userId={user.id}
          />
        </div>
        <div className="profile-label-overview__about">
          <LabelOverviewAboutDevice
            label={overview.label}
            editable={isOwnProfile}
            userId={user.id}
            onReadMore={onNavigateToAbout}
          />
        </div>
      </div>

      <LabelOverviewArtistsDevice
        artists={overview.artists}
        viewAllHref={isOwnProfile ? '/label/roster' : '/discover#explore-artists'}
      />

      <div className="profile-label-overview__intel">
        <LabelOverviewLatestReleases
          releases={overview.latestReleases}
          viewAllHref={isOwnProfile ? '/label/releases' : '/explore/releases'}
        />
        <LabelOverviewLatestNews articles={overview.latestNews} />
      </div>

      <div className="profile-label-overview__catalog">
        <LabelOverviewPlaylists playlists={overview.playlists} />
        <LabelOverviewByTheNumbers stats={overview.stats} />
      </div>
    </div>
  )
}
