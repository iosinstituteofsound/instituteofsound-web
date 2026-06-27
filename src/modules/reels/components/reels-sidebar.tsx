import { Link } from 'react-router-dom'
import { Clapperboard, Sparkles, User } from 'lucide-react'
import { useMe } from '@/modules/auth/hooks/use-auth'
import type { FeedScope } from '@/modules/feed/hooks/use-feed'
import { getFeedAuthorProfilePath } from '@/modules/feed/lib/feed-author-profile'
import { cn } from '@/shared/lib/cn'

export type ReelsTab = FeedScope | 'profile'

interface ReelsSidebarProps {
  activeTab: ReelsTab
  onTabChange: (tab: ReelsTab) => void
}

const TABS: { id: ReelsTab; label: string; icon: typeof Sparkles }[] = [
  { id: 'all', label: 'For you', icon: Sparkles },
  { id: 'following', label: 'Following', icon: Clapperboard },
]

export function ReelsSidebar({ activeTab, onTabChange }: ReelsSidebarProps) {
  const { data: me } = useMe()
  const profilePath = me?.user
    ? getFeedAuthorProfilePath({
        id: me.user.id,
        name: me.user.name,
        username: me.user.username,
      })
    : '/profile'

  return (
    <aside className="reels-sidebar">
      <h1 className="reels-sidebar__title">Reels</h1>
      <nav className="reels-sidebar__nav" aria-label="Reels navigation">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              className={cn('reels-sidebar__item', active && 'reels-sidebar__item--active')}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          )
        })}

        <Link
          to={profilePath}
          className={cn(
            'reels-sidebar__item',
            activeTab === 'profile' && 'reels-sidebar__item--active',
          )}
          onClick={() => onTabChange('profile')}
        >
          <User className="h-5 w-5 shrink-0" />
          <span>Profile</span>
        </Link>
      </nav>
    </aside>
  )
}
