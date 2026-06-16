import { useMemo, useState } from 'react'
import { Grid3x3, List, PenLine } from 'lucide-react'
import { FeedItemCard } from '@/modules/feed/lib/feed-type-registry'
import { useFeedListItems } from '@/modules/feed/components/feed-list'
import { FeedComposer } from '@/modules/feed/components/feed-composer'
import { isStoryItem } from '@/modules/feed/lib/story-utils'
import type { UserDto } from '@/shared/types/auth.types'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'

type PostsViewMode = 'list' | 'grid'

type ProfilePostsPanelProps = {
  user: UserDto
  isOwnProfile?: boolean
}

export function ProfilePostsPanel({ user, isOwnProfile }: ProfilePostsPanelProps) {
  const [viewMode, setViewMode] = useState<PostsViewMode>('list')
  const { items: allItems, isLoading } = useFeedListItems()

  const posts = useMemo(
    () => allItems.filter((item) => !isStoryItem(item) && item.author.id === user.id),
    [allItems, user.id],
  )

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
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" className="rounded-lg">
                Filters
              </Button>
              <Button variant="secondary" size="sm" className="rounded-lg">
                Manage posts
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex border-b px-2">
          <ViewTab
            active={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            icon={List}
            label="List view"
          />
          <ViewTab
            active={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
            icon={Grid3x3}
            label="Grid view"
          />
        </div>

        <CardContent className="p-3 sm:p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((key) => (
                <div key={key} className="feed-social-card overflow-hidden p-4">
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
          ) : posts.length ? (
            viewMode === 'list' ? (
              <div className="space-y-3">
                {posts.map((item) => (
                  <FeedItemCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {posts.map((item) => (
                  <FeedItemCard key={item.id} item={item} />
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <PenLine className="h-10 w-10 text-muted-foreground/50" />
              <div className="space-y-1">
                <p className="font-semibold">No posts yet</p>
                <p className="text-sm text-muted-foreground">
                  {isOwnProfile
                    ? 'When you share on the feed, your posts will show up here.'
                    : 'Posts from this profile will show up here.'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ViewTab({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors',
        active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
      {active ? (
        <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" />
      ) : null}
    </button>
  )
}
