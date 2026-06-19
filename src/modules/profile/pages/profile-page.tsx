import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Grid3x3 } from 'lucide-react'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { ProfileAboutSection } from '@/modules/profile/components/about/profile-about-section'
import { ProfileAllTab } from '@/modules/profile/components/profile-all-tab'
import { ProfileArtistSubmissionsTab } from '@/modules/profile/components/profile-artist-submissions-tab'
import { ProfileCoverSection } from '@/modules/profile/components/profile-cover-section'
import { ProfileDiscographyTab } from '@/modules/profile/components/profile-discography-tab'
import { ProfileEditorDraftsTab } from '@/modules/profile/components/profile-editor-drafts-tab'
import { ProfileEditorSubmissionsTab } from '@/modules/profile/components/profile-editor-submissions-tab'
import { ProfileEditorWireTab } from '@/modules/profile/components/profile-editor-wire-tab'
import { ProfileEditorialTab } from '@/modules/profile/components/profile-editorial-tab'
import { ProfileLabelOverviewTab } from '@/modules/profile/components/profile-label-overview-tab'
import { ProfilePostsPanel } from '@/modules/profile/components/profile-posts-panel'
import { usePublicProfile } from '@/modules/profile/hooks/use-public-profile'
import { useSlidingIndicator } from '@/modules/profile/lib/use-sliding-indicator'
import type { PublicProfileDto } from '@/modules/search/api/search.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { PageLoader } from '@/shared/components/feedback/loader'
import { ErrorState } from '@/shared/components/feedback/states'
import type { UserDto } from '@/shared/types/auth.types'
import { ListenerPlaylistsSection, ProfileMusicSection } from '@/modules/profile/components/profile-music-section'
import { cn } from '@/shared/lib/cn'
import './profile-page.css'

<<<<<<< Updated upstream
const FALLBACK_TABS: Array<{ id: string; label: string; panelKey: 'all' | 'posts' | 'about' | 'photos' }> = [
  { id: 'all', label: 'All', panelKey: 'all' },
  { id: 'posts', label: 'Posts', panelKey: 'posts' },
  { id: 'about', label: 'About', panelKey: 'about' },
  { id: 'photos', label: 'Photos', panelKey: 'photos' },
=======
const TABS: { id: ProfileViewTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'posts', label: 'Posts' },
  { id: 'music', label: 'Music' },
  { id: 'about', label: 'About' },
  { id: 'photos', label: 'Photos' },
>>>>>>> Stashed changes
]

function mapPublicProfileToUser(profile: PublicProfileDto): UserDto {
  return {
    id: profile.id,
    email: profile.email ?? '',
    name: profile.name,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    avatarThumbnailUrl: profile.avatarThumbnailUrl,
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
  const [activeTab, setActiveTab] = useState<string>('')
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

  const dynamicTabs =
    (isOwnProfile
      ? meData?.authorization.activeLayout?.profileTabs
      : publicProfile?.profileTabs) ?? []

  const tabs = dynamicTabs.length
    ? dynamicTabs.map((t) => ({ id: t.slug, label: t.label, panelKey: t.panelKey }))
    : FALLBACK_TABS

  useEffect(() => {
    if (!tabs.length) return
    if (!activeTab || !tabs.some((t) => t.id === activeTab)) {
      setActiveTab(tabs[0]!.id)
    }
  }, [activeTab, tabs])

  if (isLoading) return <PageLoader />
  if (isError || !user) {
    return <ErrorState onRetry={() => (isOwnProfile ? refetchMe() : refetchPublic())} />
  }

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0]
  const aboutTabId = tabs.find((t) => t.panelKey === 'about')?.id
  const photosTabId = tabs.find((t) => t.panelKey === 'photos')?.id

  const onNavigateToAbout = () => {
    if (aboutTabId) setActiveTab(aboutTabId)
  }
  const onNavigateToPhotos = () => {
    if (photosTabId) setActiveTab(photosTabId)
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-0">
      <ProfileCoverSection user={user} editable={isOwnProfile} />

      <div className="mt-1 border-b">
        <nav ref={tabNavRef} className="relative -mb-px flex gap-1 overflow-x-auto px-1">
          {tabs.map(({ id, label }) => {
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
          {active?.panelKey === 'overview' ? (
            <ProfileLabelOverviewTab
              user={user}
              isOwnProfile={isOwnProfile}
              onNavigateToAbout={onNavigateToAbout}
            />
          ) : null}

          {active?.panelKey === 'all' ? (
            <ProfileAllTab user={user} isOwnProfile={isOwnProfile} onNavigateToAbout={onNavigateToAbout} onNavigateToPhotos={onNavigateToPhotos} />
          ) : null}

          {active?.panelKey === 'posts' ? <ProfilePostsPanel user={user} isOwnProfile={isOwnProfile} /> : null}

          {active?.panelKey === 'discography' ? (
            <ProfileDiscographyTab user={user} isOwnProfile={isOwnProfile} />
          ) : null}

          {active?.panelKey === 'artist-submissions' ? (
            <ProfileArtistSubmissionsTab isOwnProfile={isOwnProfile} />
          ) : null}

          {active?.panelKey === 'editorial' ? (
            <ProfileEditorialTab user={user} isOwnProfile={isOwnProfile} />
          ) : null}

          {active?.panelKey === 'editor-drafts' ? <ProfileEditorDraftsTab isOwnProfile={isOwnProfile} /> : null}

          {active?.panelKey === 'editor-wire' ? <ProfileEditorWireTab isOwnProfile={isOwnProfile} /> : null}

          {active?.panelKey === 'editor-submissions' ? (
            <ProfileEditorSubmissionsTab isOwnProfile={isOwnProfile} />
          ) : null}

          {active?.panelKey === 'photos' ? (
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

<<<<<<< Updated upstream
          {active?.panelKey === 'about' ? <ProfileAboutSection user={user} editable={isOwnProfile} /> : null}
=======
          {activeTab === 'about' ? <ProfileAboutSection user={user} editable={isOwnProfile} /> : null}

          {activeTab === 'music' ? (
            <div className="space-y-8">
              <ProfileMusicSection userId={user.id} />
              <ListenerPlaylistsSection isOwnProfile={isOwnProfile} />
            </div>
          ) : null}
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  )
}
