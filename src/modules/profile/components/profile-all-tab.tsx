import type { UserDto } from '@/shared/types/auth.types'
import { ProfileIntroSidebar } from '@/modules/profile/components/profile-intro-sidebar'
import { ProfilePostsPanel } from '@/modules/profile/components/profile-posts-panel'
import { ListenerPlaylistsSection } from '@/modules/profile/components/listener-playlists-section'

type ProfileAllTabProps = {
  user: UserDto
  isOwnProfile?: boolean
  onNavigateToAbout?: () => void
  onNavigateToPhotos?: () => void
}

export function ProfileAllTab({
  user,
  isOwnProfile,
  onNavigateToAbout,
  onNavigateToPhotos,
}: ProfileAllTabProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
      <aside className="lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:overscroll-y-contain lg:self-start lg:pr-1">
        <ProfileIntroSidebar
          user={user}
          editable={isOwnProfile}
          onEditSection={onNavigateToAbout}
          onSeeMoreAbout={onNavigateToAbout}
          onSeeAllPhotos={onNavigateToPhotos}
        />
        {isOwnProfile ? (
          <div className="mt-4">
            <ListenerPlaylistsSection isOwnProfile />
          </div>
        ) : null}
      </aside>
      <div className="min-w-0 lg:pl-1">
        <ProfilePostsPanel user={user} isOwnProfile={isOwnProfile} />
      </div>
    </div>
  )
}
