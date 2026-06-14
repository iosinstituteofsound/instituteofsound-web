import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { AnimatedEmojiText } from '@/modules/feed/components/animated-emoji-text'
import { FeedEngagement } from '@/modules/feed/components/feed-engagement'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { cn } from '@/shared/lib/cn'

function formatRelativeTime(value: string) {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function FeedCardShell({
  item,
  children,
  media,
  className,
  defaultCommentsOpen = false,
}: {
  item: FeedItemDto
  children?: React.ReactNode
  media?: React.ReactNode
  className?: string
  defaultCommentsOpen?: boolean
}) {
  return (
    <article className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}>
      <header className="flex items-center gap-3 px-4 py-3">
        <FeedUserAvatar name={item.author.name} avatarUrl={item.author.avatarUrl} className="h-10 w-10" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">{item.author.name}</p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(item.createdAt)} · Feed</p>
        </div>
      </header>

      {(item.body || item.title) && (
        <div className="space-y-1 px-4 pb-3">
          {item.title ? <h3 className="font-semibold leading-snug">{item.title}</h3> : null}
          {item.body ? (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
              <AnimatedEmojiText text={item.body} emojiSize="sm" />
            </p>
          ) : null}
        </div>
      )}

      {media}

      {children ? <div className="px-4 pb-3 pt-1">{children}</div> : null}

      <FeedEngagement item={item} defaultCommentsOpen={defaultCommentsOpen} />
    </article>
  )
}

export function payloadString(payload: Record<string, unknown>, key: string) {
  const value = payload[key]
  return typeof value === 'string' ? value : undefined
}

export function payloadNumber(payload: Record<string, unknown>, key: string) {
  const value = payload[key]
  return typeof value === 'number' ? value : undefined
}
