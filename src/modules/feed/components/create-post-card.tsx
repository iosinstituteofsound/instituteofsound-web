import { Film, ImageIcon, Music2, Plus } from 'lucide-react'
import type { FeedItemType } from '@/modules/feed/types/feed.types'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { Button } from '@/shared/components/ui/button'
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
  const compact = collapseProgress > 0.55
  const actionsHeight = 64

  return (
    <div
      className={cn(
        'relative z-30 overflow-hidden border bg-card shadow-sm transition-[border-radius,box-shadow] duration-300 ease-out',
        compact ? 'rounded-full shadow-none' : 'rounded-xl',
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
      </div>

      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
        style={{
          maxHeight: `${(1 - collapseProgress) * actionsHeight}px`,
          opacity: 1 - collapseProgress,
        }}
      >
        <div className="mx-3 border-t sm:mx-4" />

        <div className="flex items-stretch gap-1 p-2 sm:gap-2 sm:p-3">
          {QUICK_POST_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.type}
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
      className="group relative h-[200px] w-[112px] shrink-0 overflow-hidden rounded-xl border bg-card shadow-sm transition-transform hover:scale-[1.02]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-muted/40 to-muted" />
      <div className="absolute left-3 top-3">
        <FeedUserAvatar name={userName} avatarUrl={avatarUrl} className="h-9 w-9 ring-2 ring-primary" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 border-t bg-card p-2 text-left">
        <div className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
        </div>
        <p className="text-center text-xs font-semibold leading-tight">Create story</p>
      </div>
    </button>
  )
}
