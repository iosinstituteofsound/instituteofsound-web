import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Grid3x3, List, PenLine } from 'lucide-react'
import { FeedItemCard } from '@/modules/feed/lib/feed-type-registry'
import { FeedComposer } from '@/modules/feed/components/feed-composer'
import { useProfilePosts } from '@/modules/profile/hooks/use-profile-posts'
import { useSlidingIndicator } from '@/modules/profile/lib/use-sliding-indicator'
import type { FeedItemType, FeedItemDto } from '@/modules/feed/types/feed.types'
import type { UserDto } from '@/shared/types/auth.types'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useInfiniteScroll } from '@/shared/hooks/use-infinite-scroll'
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

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProfilePosts(user.id, feedType)

  const posts = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data?.pages])
  const [displayPosts, setDisplayPosts] = useState<FeedItemDto[]>([])
  const [contentKey, setContentKey] = useState(0)
  const isInitialLoading = isLoading && displayPosts.length === 0 && posts.length === 0
  const isFilterPending = isFetching && !isFetchingNextPage && !isInitialLoading

  useEffect(() => {
    if (isFetching && !isFetchingNextPage) return
    setDisplayPosts(posts)
    setContentKey((value) => value + 1)
  }, [posts, isFetching, isFetchingNextPage, activeFilter, viewMode])

  const filterIndicator = useSlidingIndicator(filterRowRef, activeFilter)
  const viewIndicator = useSlidingIndicator(viewRowRef, viewMode)

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  const sentinelRef = useInfiniteScroll(loadMore, { enabled: Boolean(hasNextPage) })

  useEffect(() => {
    if (isFetchingNextPage || !hasNextPage) return
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const rect = sentinel.getBoundingClientRect()
    if (rect.top <= window.innerHeight + 240) {
      loadMore()
    }
  }, [hasNextPage, isFetchingNextPage, loadMore, posts.length, sentinelRef])

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
          {isInitialLoading ? (
            <PostsSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="font-semibold">Could not load posts</p>
              <Button variant="secondary" size="sm" onClick={() => void refetch()}>
                Try again
              </Button>
            </div>
          ) : (
            <div className="relative min-h-[12rem]">
              {isFilterPending ? (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-background/25 backdrop-blur-[1px] transition-opacity duration-300"
                />
              ) : null}
              <div
                key={contentKey}
                className="profile-posts-content-shell profile-posts-panel-content"
                data-pending={isFilterPending}
              >
                {displayPosts.length ? (
                  <PostsCollection items={displayPosts} viewMode={viewMode} />
                ) : (
                  <EmptyPostsState isOwnProfile={isOwnProfile} filterLabel={getFilterLabel(activeFilter)} />
                )}
              </div>
            </div>
          )}

          {isFetchingNextPage ? <PostsSkeleton compact /> : null}
          {hasNextPage ? <div ref={sentinelRef} className="h-px w-full" aria-hidden /> : null}
        </CardContent>
      </Card>
    </div>
  )
}

function PostsCollection({
  items,
  viewMode,
}: {
  items: FeedItemDto[]
  viewMode: PostsViewMode
}) {
  const containerClass =
    viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 gap-3 sm:grid-cols-2'

  return (
    <div className={containerClass}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="profile-post-item"
          style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
        >
          <FeedItemCard item={item} />
        </div>
      ))}
    </div>
  )
}

function getFilterLabel(filter: ProfilePostFilter) {
  return POST_FILTERS.find((entry) => entry.id === filter)?.label.toLowerCase() ?? 'posts'
}

function EmptyPostsState({
  isOwnProfile,
  filterLabel,
}: {
  isOwnProfile?: boolean
  filterLabel: string
}) {
  const isFiltered = filterLabel !== 'all'

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <PenLine className="h-10 w-10 text-muted-foreground/50" />
      <div className="space-y-1">
        <p className="font-semibold">{isFiltered ? `No ${filterLabel} yet` : 'No posts yet'}</p>
        <p className="text-sm text-muted-foreground">
          {isOwnProfile
            ? isFiltered
              ? `When you share ${filterLabel} on the feed, they will show up here.`
              : 'When you share on the feed, your posts will show up here.'
            : isFiltered
              ? `${filterLabel.charAt(0).toUpperCase()}${filterLabel.slice(1)} from this profile will show up here.`
              : 'Posts from this profile will show up here.'}
        </p>
      </div>
      {isOwnProfile && !isFiltered ? (
        <Button asChild variant="secondary" size="sm">
          <Link to="/home">Go to feed</Link>
        </Button>
      ) : null}
    </div>
  )
}

function PostsSkeleton({ compact }: { compact?: boolean }) {
  const count = compact ? 1 : 2

  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="feed-social-card overflow-hidden p-4">
          <div className="mb-3 flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}
