import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Grid3x3 } from 'lucide-react'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { ProfileAboutSection } from '@/modules/profile/components/about/profile-about-section'
import { ProfileAllTab } from '@/modules/profile/components/profile-all-tab'
import { ProfileCoverSection } from '@/modules/profile/components/profile-cover-section'
import { ProfilePostsPanel } from '@/modules/profile/components/profile-posts-panel'
import { usePublicProfile } from '@/modules/profile/hooks/use-public-profile'
import { useSlidingIndicator } from '@/modules/profile/lib/use-sliding-indicator'
import type { ProfileViewTab } from '@/modules/profile/types/profile.types'
import type { PublicProfileDto } from '@/modules/search/api/search.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import type { UserDto } from '@/shared/types/auth.types'
import { cn } from '@/shared/lib/cn'
import './profile-page.css'

const TABS: { id: ProfileViewTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'posts', label: 'Posts' },
  { id: 'about', label: 'About' },
  { id: 'photos', label: 'Photos' },
]

function mapPublicProfileToUser(profile: PublicProfileDto): UserDto {
  return {
    id: profile.id,
    email: profile.email ?? '',
    name: profile.name,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    avatarCrop: profile.avatarCrop,
    coverUrl: profile.coverUrl,
    coverCrop: profile.coverCrop,
    bio: profile.bio,
    aboutProfile: profile.aboutProfile,
    orgLabel: profile.orgLabel,
    linkUrl: profile.linkUrl,
    isVerified: profile.isVerified,
    privacySettings: profile.privacySettings,
    createdAt: new Date().toISOString(),
  }
}

export function ProfilePage() {
  const { userId: routeUserId } = useParams()
  const [activeTab, setActiveTab] = useState<ProfileViewTab>('all')
  const tabNavRef = useRef<HTMLElement>(null)
  const { data: meData, isLoading: meLoading, isError: meError, refetch: refetchMe } = useMe()
  const isOwnProfile = !routeUserId || routeUserId === meData?.user.id
  const {
    data: publicProfile,
    isLoading: publicLoading,
    isError: publicError,
    refetch: refetchPublic,
  } = usePublicProfile(isOwnProfile ? undefined : routeUserId)

  const tabIndicator = useSlidingIndicator(tabNavRef, activeTab)

  const isLoading = isOwnProfile ? meLoading : meLoading || publicLoading
  const isError = isOwnProfile ? meError || !meData?.user : meError || publicError || !publicProfile
  const user = isOwnProfile
    ? meData?.user
    : publicProfile
      ? mapPublicProfileToUser(publicProfile)
      : undefined

  if (isLoading) return <PageLoader />
  if (isError || !user) {
    return <ErrorState onRetry={() => (isOwnProfile ? refetchMe() : refetchPublic())} />
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-0">
      <ProfileCoverSection user={user} editable={isOwnProfile} />

      <div className="mt-1 border-b">
        <nav ref={tabNavRef} className="relative -mb-px flex gap-1 overflow-x-auto px-1">
          {TABS.map(({ id, label }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                type="button"
                data-indicator-key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'profile-tab-button relative z-10 shrink-0 px-4 py-3 text-sm font-semibold',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                {label}
              </button>
            )
          })}
          <span
            aria-hidden
            className="profile-tab-indicator pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary"
            style={{
              left: tabIndicator.left,
              width: tabIndicator.width,
              opacity: tabIndicator.width ? 1 : 0,
            }}
          />
        </nav>
      </div>

      <div className="py-4">
        <div key={activeTab} className="profile-tab-content">
          {activeTab === 'all' ? (
            <ProfileAllTab
              user={user}
              isOwnProfile={isOwnProfile}
              onNavigateToAbout={() => setActiveTab('about')}
              onNavigateToPhotos={() => setActiveTab('photos')}
            />
          ) : null}

          {activeTab === 'posts' ? (
            <ProfilePostsPanel user={user} isOwnProfile={isOwnProfile} />
          ) : null}

          {activeTab === 'photos' ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Grid3x3 className="h-4 w-4" />
                  Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {user.avatarUrl ? (
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                      <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-contain" />
                    </div>
                  ) : null}
                  {user.coverUrl ? (
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted sm:col-span-2">
                      <img src={user.coverUrl} alt="Cover" className="h-full w-full object-cover" />
                    </div>
                  ) : null}
                  {!user.avatarUrl && !user.coverUrl ? (
                    <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
                      No photos yet.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {activeTab === 'about' ? <ProfileAboutSection user={user} editable={isOwnProfile} /> : null}
        </div>
      </div>
    </div>
  )
}
