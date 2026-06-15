import { Globe, MoreHorizontal } from 'lucide-react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { AnimatedEmojiText } from '@/modules/feed/components/animated-emoji-text'
import { FeedEngagement } from '@/modules/feed/components/feed-engagement'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { formatFeedTimestamp } from '@/modules/feed/lib/feed-time'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

export function FeedCardShell({
  item,
  children,
  media,
  className,
  defaultCommentsOpen = false,
  subtitle,
}: {
  item: FeedItemDto
  children?: React.ReactNode
  media?: React.ReactNode
  className?: string
  defaultCommentsOpen?: boolean
  subtitle?: React.ReactNode
}) {
  const caption = item.body || item.title

  return (
    <article className={cn('overflow-hidden rounded-lg border bg-card shadow-sm', className)}>
      <header className="flex items-start gap-2 px-3 pb-2 pt-3 sm:px-4">
        <FeedUserAvatar name={item.author.name} avatarUrl={item.author.avatarUrl} className="h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-[15px] font-semibold leading-tight hover:underline">
            {item.author.name}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <span>{formatFeedTimestamp(item.createdAt)}</span>
            <span aria-hidden>·</span>
            <Globe className="h-3 w-3" aria-label="Public" />
          </div>
          {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-full text-muted-foreground"
          aria-label="Post options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </header>

      {caption ? (
        <div className="space-y-1 px-3 pb-2 sm:px-4">
          {item.title && item.body ? (
            <h3 className="text-[15px] font-semibold leading-snug">{item.title}</h3>
          ) : null}
          {item.body ? (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
              <AnimatedEmojiText text={item.body} emojiSize="sm" />
            </p>
          ) : item.title && !item.body ? (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{item.title}</p>
          ) : null}
        </div>
      ) : null}

      {media}

      {children ? <div className="px-3 pb-2 pt-1 sm:px-4">{children}</div> : null}

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

export function FeedMediaFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex w-full items-center justify-center bg-black', className)}>
      {children}
    </div>
  )
}
