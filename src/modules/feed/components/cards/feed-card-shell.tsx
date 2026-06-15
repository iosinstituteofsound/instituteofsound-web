import { Globe, MoreHorizontal } from 'lucide-react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { AnimatedEmojiText } from '@/modules/feed/components/animated-emoji-text'
import { FeedEngagement } from '@/modules/feed/components/feed-engagement'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { formatFeedTimestamp } from '@/modules/feed/lib/feed-time'
import { Button } from '@/shared/components/ui/button'
import { premiumSurfaceClass } from '@/shared/lib/surface-classes'
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
    <article className={cn(premiumSurfaceClass, 'overflow-hidden', className)}>
      <header className="flex items-start gap-3 px-4 pb-2.5 pt-4 sm:px-5">
        <FeedUserAvatar name={item.author.name} avatarUrl={item.author.avatarUrl} className="h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="truncate text-sm font-semibold leading-tight hover:underline">
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
        <div className="space-y-1.5 px-4 pb-2.5 sm:px-5">
          {item.title && item.body ? (
            <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
          ) : null}
          {item.body ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              <AnimatedEmojiText text={item.body} emojiSize="sm" />
            </p>
          ) : item.title && !item.body ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.title}</p>
          ) : null}
        </div>
      ) : null}

      {media}

      {children ? <div className="px-4 pb-2.5 pt-1 sm:px-5">{children}</div> : null}

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
