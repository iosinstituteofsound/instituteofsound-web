import { useRef, useState } from 'react'
import { useMe } from '@/modules/auth/hooks/use-auth'
import { CreateMediaStoryDialog } from '@/modules/feed/components/create-media-story-dialog'
import { CreateStoryDialog } from '@/modules/feed/components/create-story-dialog'
import { CreateTextStoryDialog } from '@/modules/feed/components/create-text-story-dialog'
import { FeedComposer } from '@/modules/feed/components/feed-composer'
import { FeedList, useFeedListItems } from '@/modules/feed/components/feed-list'
import { FeedStoriesRow } from '@/modules/feed/components/feed-stories-row'
import { StoryViewer } from '@/modules/feed/components/story-viewer'
import { useScrollCollapse } from '@/modules/feed/hooks/use-scroll-collapse'
import { getStoryItems } from '@/modules/feed/lib/story-content'
import { PermissionGate } from '@/shared/components/authz/permission-gate'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { getUserAvatarThumbnailUrl } from '@/shared/lib/user-avatar'
import { FEED_COLUMN_CLASS } from '@/shared/lib/layout-config'
import { premiumSurfaceClass } from '@/shared/lib/surface-classes'
import { cn } from '@/shared/lib/cn'

export function FeedPage() {
  const { data: me } = useMe()
  const { items, isLoading } = useFeedListItems()
  const [storyPickerOpen, setStoryPickerOpen] = useState(false)
  const [mediaStoryOpen, setMediaStoryOpen] = useState(false)
  const [textStoryOpen, setTextStoryOpen] = useState(false)
  const [storyViewerOpen, setStoryViewerOpen] = useState(false)
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null)
  const composerAnchorRef = useRef<HTMLDivElement>(null)
  const collapseProgress = useScrollCollapse(composerAnchorRef)

  const userName = me?.user.name ?? 'You'
  const avatarUrl = me?.user ? getUserAvatarThumbnailUrl(me.user) : undefined
  const storyItems = getStoryItems(items)

  const handleStorySelect = (type: 'image' | 'text') => {
    setStoryPickerOpen(false)
    if (type === 'image') setMediaStoryOpen(true)
    else setTextStoryOpen(true)
  }

  return (
    <div className={cn(FEED_COLUMN_CLASS, 'pb-8')}>
      <PermissionGate resource="feed" action="create">
        <div ref={composerAnchorRef} className="sticky top-0 z-50 bg-background">
          <FeedComposer collapseProgress={collapseProgress} />
        </div>
      </PermissionGate>

      <div className="relative z-0 mt-3 space-y-3">
        {isLoading ? (
          <div className={cn(premiumSurfaceClass, 'overflow-hidden p-3')}>
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
            onCreateStory={() => setStoryPickerOpen(true)}
            onStoryClick={(storyId) => {
              setActiveStoryId(storyId)
              setStoryViewerOpen(true)
            }}
          />
        )}

        <FeedList compactLoader />
      </div>

      <CreateStoryDialog
        open={storyPickerOpen}
        onOpenChange={setStoryPickerOpen}
        userName={userName}
        avatarUrl={avatarUrl}
        onSelect={handleStorySelect}
      />

      <CreateMediaStoryDialog
        open={mediaStoryOpen}
        onOpenChange={setMediaStoryOpen}
        userName={userName}
        avatarUrl={avatarUrl}
      />

      <CreateTextStoryDialog
        open={textStoryOpen}
        onOpenChange={setTextStoryOpen}
        userName={userName}
        avatarUrl={avatarUrl}
      />

      <StoryViewer
        open={storyViewerOpen}
        onOpenChange={setStoryViewerOpen}
        stories={storyItems}
        initialStoryId={activeStoryId}
        userName={userName}
        avatarUrl={avatarUrl}
        onCreateStory={() => {
          setStoryViewerOpen(false)
          setStoryPickerOpen(true)
        }}
      />
    </div>
  )
}
