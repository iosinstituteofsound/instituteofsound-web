import { useRef, useState } from 'react'
import { Grid3x3, List } from 'lucide-react'
import { FeedComposer } from '@/modules/feed/components/feed-composer'
import { FeedList } from '@/modules/feed/components/feed-list'
import { useFeedListStatus } from '@/modules/feed/hooks/use-feed'
import { useSlidingIndicator } from '@/modules/profile/lib/use-sliding-indicator'
import type { FeedItemType } from '@/modules/feed/types/feed.types'
import type { UserDto } from '@/shared/types/auth.types'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/cn'
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
  const filterRowRef = useRef<HTMLDivElement>(null)
  const viewRowRef = useRef<HTMLDivElement>(null)
  const feedType = activeFilter === 'all' ? undefined : activeFilter

  const { isFetching, isFetchingNextPage, isLoading } = useFeedListStatus({
    authorId: user.id,
    type: feedType,
    enabled: Boolean(user.id),
  })
  const isFilterPending = isFetching && !isFetchingNextPage && !isLoading

  const filterIndicator = useSlidingIndicator(filterRowRef, activeFilter)
  const viewIndicator = useSlidingIndicator(viewRowRef, viewMode)

  return (
    <div className="space-y-4">
      {isOwnProfile ? (
        <PermissionGate resource="feed" action="create">
          <FeedComposer collapseProgress={0} />
        </PermissionGate>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
          <h3 className="text-xl font-bold">Posts</h3>
          {isOwnProfile ? (
            <Button variant="secondary" size="sm" className="rounded-lg">
              Manage posts
            </Button>
          ) : null}
        </div>

        <div className="overflow-x-auto border-b px-4 py-3">
          <div ref={filterRowRef} className="relative inline-flex gap-2">
            {POST_FILTERS.map(({ id, label }) => {
              const isActive = activeFilter === id
              return (
                <button
                  key={id}
                  type="button"
                  data-indicator-key={id}
                  onClick={() => setActiveFilter(id)}
                  className={cn(
                    'profile-posts-filter-chip relative z-10 shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              )
            })}
            <span
              aria-hidden
              className="profile-posts-filter-indicator pointer-events-none absolute z-0 rounded-full bg-primary"
              style={{
                left: filterIndicator.left,
                top: filterIndicator.top,
                width: filterIndicator.width,
                height: filterIndicator.height,
                opacity: filterIndicator.width ? 1 : 0,
              }}
            />
          </div>
        </div>

        <div ref={viewRowRef} className="relative flex border-b px-2">
          {VIEW_TABS.map(({ id, label, icon: Icon }) => {
            const isActive = viewMode === id
            return (
              <button
                key={id}
                type="button"
                data-indicator-key={id}
                onClick={() => setViewMode(id)}
                className={cn(
                  'profile-posts-view-tab relative z-10 flex items-center gap-2 px-4 py-3 text-sm font-semibold',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            )
          })}
          <span
            aria-hidden
            className="profile-posts-view-indicator pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-primary"
            style={{
              left: viewIndicator.left,
              width: viewIndicator.width,
              opacity: viewIndicator.width ? 1 : 0,
            }}
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
