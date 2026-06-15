import { useRef, useState } from 'react'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { CreatePostDialog } from '@/modules/feed/components/create-post-dialog'
import { FeedComposer } from '@/modules/feed/components/feed-composer'
import { FeedList, useFeedListItems } from '@/modules/feed/components/feed-list'
import { FeedStoriesRow } from '@/modules/feed/components/feed-stories-row'
import { useScrollCollapse } from '@/modules/feed/hooks/use-scroll-collapse'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Skeleton } from '@/shared/components/ui/skeleton'

export function FeedPage() {
  const { data: me } = useMe()
  const { items, isLoading } = useFeedListItems()
  const [storyOpen, setStoryOpen] = useState(false)
  const composerAnchorRef = useRef<HTMLDivElement>(null)
  const collapseProgress = useScrollCollapse(composerAnchorRef)

  const userName = me?.user.name ?? 'You'
  const avatarUrl = me?.user.avatarUrl

  return (
    <div className="mx-auto w-full max-w-[680px] pb-8">
      <PermissionGate resource="feed" action="create">
        <div ref={composerAnchorRef} className="relative sticky top-0 z-30">
          <FeedComposer collapseProgress={collapseProgress} />
        </div>
      </PermissionGate>

      <div className="relative z-0 space-y-3 pt-3">
        {isLoading ? (
          <div className="overflow-hidden rounded-lg border bg-card p-3 shadow-sm">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((key) => (
                <Skeleton key={key} className="h-[200px] w-[112px] shrink-0 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <FeedStoriesRow
            items={items}
            userName={userName}
            avatarUrl={avatarUrl}
            onCreateStory={() => setStoryOpen(true)}
          />
        )}

        <FeedList compactLoader />
      </div>

      <CreatePostDialog
        open={storyOpen}
        onOpenChange={setStoryOpen}
        initialType="image"
        userName={userName}
        avatarUrl={avatarUrl}
      />
    </div>
  )
}
