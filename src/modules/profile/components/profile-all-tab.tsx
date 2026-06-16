import type { UserDto } from '@/shared/types/auth.types'
import { ProfileIntroSidebar } from '@/modules/profile/components/profile-intro-sidebar'
import { ProfilePostsPanel } from '@/modules/profile/components/profile-posts-panel'

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
      <aside className="lg:sticky lg:top-0 lg:max-h-[calc(100dvh-1rem)] lg:overflow-y-auto lg:overscroll-y-contain lg:self-start lg:pr-1">
        <ProfileIntroSidebar
          user={user}
          editable={isOwnProfile}
          onEditSection={onNavigateToAbout}
          onSeeMoreAbout={onNavigateToAbout}
          onSeeAllPhotos={onNavigateToPhotos}
        />
      </aside>
      <div className="lg:sticky lg:top-0 lg:max-h-[calc(100dvh-1rem)] lg:overflow-y-auto lg:overscroll-y-contain lg:self-start lg:pl-1">
        <ProfilePostsPanel user={user} isOwnProfile={isOwnProfile} />
      </div>
    </div>
  )
}
