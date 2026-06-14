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
}

export function CreatePostCard({ userName, avatarUrl, onOpen }: CreatePostCardProps) {
  const firstName = userName.split(' ')[0] ?? userName

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <FeedUserAvatar name={userName} avatarUrl={avatarUrl} className="h-10 w-10 shrink-0" />
        <button
          type="button"
          onClick={() => onOpen('text')}
          className="flex-1 rounded-full bg-muted/70 px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          What&apos;s on your mind, {firstName}?
        </button>
      </div>

      <div className="mx-3 border-t sm:mx-4" />

      <div className="grid grid-cols-3 gap-1 p-2 sm:p-3">
        {QUICK_POST_ACTIONS.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.type}
              type="button"
              variant="ghost"
              className="h-10 gap-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted/60 sm:text-sm"
              onClick={() => onOpen(action.type)}
            >
              <Icon className={cn('h-5 w-5', action.iconClass)} />
              <span>{action.label}</span>
            </Button>
          )
        })}
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
