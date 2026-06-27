import { useState } from 'react'
import { Grid3x3, List } from 'lucide-react'
import { FeedComposer } from '@/modules/feed/components/feed-composer'
import { FeedList } from '@/modules/feed/components/feed-list'
import { useFeedListStatus } from '@/modules/feed/hooks/use-feed'
import type { FeedItemType } from '@/modules/feed/types/feed.types'
import type { UserDto } from '@/shared/types/auth.types'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { SlidingTabBar } from '@/shared/components/controls'
import { SectionHeader } from '@/shared/components/layout'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import './profile-posts-panel.css'

type PostsViewMode = 'list' | 'grid'

type ProfilePostFilter = 'all' | FeedItemType

const POST_FILTERS: { id: ProfilePostFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Photos' },
  { id: 'video', label: 'Videos' },
  { id: 'music', label: 'Audio' },
  { id: 'text', label: 'Text' },
  { id: 'article', label: 'Articles' },
]

const VIEW_TABS: { id: PostsViewMode; label: string; icon: typeof List }[] = [
  { id: 'list', label: 'List view', icon: List },
  { id: 'grid', label: 'Grid view', icon: Grid3x3 },
]

type ProfilePostsPanelProps = {
  user: UserDto
  isOwnProfile?: boolean
}

export function ProfilePostsPanel({ user, isOwnProfile }: ProfilePostsPanelProps) {
  const [viewMode, setViewMode] = useState<PostsViewMode>('list')
  const [activeFilter, setActiveFilter] = useState<ProfilePostFilter>('all')
  const feedType = activeFilter === 'all' ? undefined : activeFilter

  const { isFetching, isFetchingNextPage, isLoading } = useFeedListStatus({
    authorId: user.id,
    type: feedType,
    enabled: Boolean(user.id),
  })
  const isFilterPending = isFetching && !isFetchingNextPage && !isLoading

  return (
    <div className="space-y-4">
      {isOwnProfile ? (
        <PermissionGate resource="feed" action="create">
          <FeedComposer collapseProgress={0} />
        </PermissionGate>
      ) : null}

      <Card>
        <div className="border-b px-4 py-3">
          <SectionHeader
            title="Posts"
            action={
              isOwnProfile ? (
                <Button variant="secondary" size="sm" className="rounded-lg">
                  Manage posts
                </Button>
              ) : null
            }
          />
        </div>

        <div className="overflow-x-auto border-b px-4 py-3">
          <SlidingTabBar
            value={activeFilter}
            options={POST_FILTERS.map(({ id, label }) => ({ value: id, label }))}
            onChange={setActiveFilter}
            className="min-w-max rounded-full"
            tabClassName="profile-posts-filter-chip shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold"
            aria-label="Post filters"
          />
        </div>

        <div className="border-b px-2 py-2">
          <SlidingTabBar
            value={viewMode}
            options={VIEW_TABS.map(({ id, label, icon: Icon }) => ({
              value: id,
              label: (
                <span className="profile-posts-view-tab inline-flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              ),
            }))}
            onChange={setViewMode}
            className="w-full bg-transparent p-0"
            tabClassName="flex-1 px-4 py-2.5 text-sm font-semibold"
            aria-label="Post view mode"
          />
        </div>

        <CardContent className="p-3 sm:p-4">
          <div className="relative min-h-[12rem]">
            {isFilterPending ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-background/25 backdrop-blur-[1px] transition-opacity duration-300"
              />
            ) : null}
            <div
              className="profile-posts-content-shell profile-posts-panel-content"
              data-pending={isFilterPending}
            >
              <FeedList
                authorId={user.id}
                type={feedType}
                compact={viewMode === 'grid'}
                listClassName={viewMode === 'grid' ? 'profile-posts-grid' : 'profile-posts-list'}
                itemClassName="profile-post-item"
                staggerAnimation={viewMode === 'list'}
                compactLoader
                emptyMessage={profileEmptyMessage(isOwnProfile, activeFilter)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function profileEmptyMessage(isOwnProfile: boolean | undefined, filter: ProfilePostFilter) {
  const filterLabel = POST_FILTERS.find((entry) => entry.id === filter)?.label.toLowerCase() ?? 'posts'
  const isFiltered = filter !== 'all'

  if (isOwnProfile) {
    return isFiltered
      ? `When you share ${filterLabel} on the feed, they will show up here.`
      : 'When you share on the feed, your posts will show up here.'
  }

  return isFiltered
    ? `${filterLabel.charAt(0).toUpperCase()}${filterLabel.slice(1)} from this profile will show up here.`
    : 'Posts from this profile will show up here.'
}
