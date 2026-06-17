import { Film, ImageIcon, Music2, Plus } from 'lucide-react'
import type { FeedItemType } from '@/modules/feed/types/feed.types'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { Button } from '@/shared/components/ui/button'
import { premiumSurfaceClass } from '@/shared/lib/surface-classes'
import { cn } from '@/shared/lib/cn'

export const QUICK_POST_ACTIONS: {
  type: FeedItemType
  label: string
  icon: typeof Music2
  iconClass: string
}[] = [
  { type: 'video', label: 'Video', icon: Film, iconClass: 'text-pink-500' },
  { type: 'image', label: 'Photo', icon: ImageIcon, iconClass: 'text-emerald-500' },
  { type: 'music', label: 'Audio', icon: Music2, iconClass: 'text-red-500' },
]

const INLINE_ACTIONS_WIDTH = QUICK_POST_ACTIONS.length * 36 + (QUICK_POST_ACTIONS.length - 1) * 4
const BOTTOM_ACTIONS_HEIGHT = 68

function stagedCollapse(progress: number) {
  const bottomOpacity = Math.max(0, 1 - progress * 2)
  const bottomHeight =
    progress < 0.5 ? BOTTOM_ACTIONS_HEIGHT : BOTTOM_ACTIONS_HEIGHT * Math.max(0, 1 - (progress - 0.5) * 2)
  const inlineOpacity = Math.min(1, Math.max(0, (progress - 0.15) / 0.55))
  const inlineWidth = inlineOpacity * INLINE_ACTIONS_WIDTH

  return { bottomOpacity, bottomHeight, inlineOpacity, inlineWidth }
}

interface CreatePostCardProps {
  userName: string
  avatarUrl?: string | null
  onOpen: (type?: FeedItemType) => void
  /** 0 = expanded, 1 = fully collapsed (scroll-driven) */
  collapseProgress?: number
}

export function CreatePostCard({
  userName,
  avatarUrl,
  onOpen,
  collapseProgress = 0,
}: CreatePostCardProps) {
  const firstName = userName.split(' ')[0] ?? userName
  const compact = collapseProgress > 0.5
  const { bottomOpacity, bottomHeight, inlineOpacity, inlineWidth } = stagedCollapse(collapseProgress)

  return (
    <div
      className={cn(
        premiumSurfaceClass,
        'relative w-full transition-[box-shadow] duration-300 ease-out',
        compact ? 'shadow-none' : 'shadow-sm',
      )}
    >
      <div
        className="flex min-w-0 items-center transition-[gap,padding] duration-300 ease-out"
        style={{
          gap: `${12 - collapseProgress * 4}px`,
          padding: `${12 - collapseProgress * 4}px ${16 - collapseProgress * 4}px`,
        }}
      >
        <FeedUserAvatar
          name={userName}
          avatarUrl={avatarUrl}
          className="shrink-0 transition-[width,height] duration-300 ease-out"
          style={{
            width: `${40 - collapseProgress * 8}px`,
            height: `${40 - collapseProgress * 8}px`,
          }}
        />

        <button
          type="button"
          onClick={() => onOpen('text')}
          className="min-w-0 flex-1 truncate rounded-full bg-muted/70 px-4 text-left text-sm text-muted-foreground transition-[padding,font-size] duration-300 ease-out hover:bg-muted"
          style={{
            paddingTop: `${10 - collapseProgress * 3}px`,
            paddingBottom: `${10 - collapseProgress * 3}px`,
            fontSize: `${14 - collapseProgress * 1}px`,
          }}
        >
          {compact ? "What's on your mind?" : `What's on your mind, ${firstName}?`}
        </button>

        <div
          className="flex shrink-0 items-center gap-1 overflow-hidden transition-[max-width,opacity] duration-300 ease-out"
          style={{
            maxWidth: `${inlineWidth}px`,
            opacity: inlineOpacity,
          }}
        >
          {QUICK_POST_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={`inline-${action.type}`}
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:bg-muted/60"
                onClick={() => onOpen(action.type)}
                aria-label={action.label}
              >
                <Icon className={cn('h-5 w-5', action.iconClass)} />
              </Button>
            )
          })}
        </div>
      </div>

      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
        style={{
          maxHeight: `${bottomHeight}px`,
          opacity: bottomOpacity,
        }}
      >
        <div className="mx-3 border-t sm:mx-4" />

        <div className="flex items-stretch gap-1 p-2 sm:gap-2 sm:p-3">
          {QUICK_POST_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={`bottom-${action.type}`}
                type="button"
                variant="ghost"
                className="h-10 min-w-0 flex-1 gap-1.5 rounded-lg px-1 text-xs font-semibold text-muted-foreground hover:bg-muted/60 sm:gap-2 sm:px-2 sm:text-sm"
                onClick={() => onOpen(action.type)}
              >
                <Icon className={cn('h-5 w-5 shrink-0', action.iconClass)} />
                <span className="truncate">{action.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function CreateStoryCard({
  userName,
  avatarUrl,
  onClick,
}: {
  userName: string
  avatarUrl?: string | null
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="feed-story-card feed-story-card--create"
      style={{ '--story-i': 0 } as React.CSSProperties}
    >
      <div className="feed-story-card__orb">
        <span className="feed-story-card__orbit" aria-hidden />
        <FeedUserAvatar name={userName} avatarUrl={avatarUrl} className="feed-story-card__avatar" />
      </div>

      <div className="feed-story-card__capsule">
        <div className="feed-story-card__glass">
          <span className="feed-story-card__hud" aria-hidden />
          <span className="feed-story-card__core" aria-hidden>
            <Plus className="h-4 w-4" />
          </span>
          <p className="feed-story-card__create-label">Create story</p>
        </div>
      </div>
    </button>
  )
}
