'use client'

import type { LucideIcon } from 'lucide-react'
import { Bell, Bookmark, Clock, MessageCircleWarning, MoreHorizontal, UserX } from 'lucide-react'
import type { FeedAuthorDto } from '@/modules/feed/types/feed.types'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { toast } from '@/shared/components/ui/sonner'
import { cn } from '@/shared/lib/cn'

type FeedPostOptionsMenuProps = {
  author: FeedAuthorDto
  postId: string
  triggerClassName?: string
  portalContainer?: HTMLElement | null
  contentClassName?: string
}

function PostMenuOption({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  onClick: () => void
}) {
  return (
    <DropdownMenuItem
      className="cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 focus:bg-accent"
      onClick={onClick}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 text-left">
        <p className="text-[15px] font-semibold leading-snug">{title}</p>
        {subtitle ? (
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
    </DropdownMenuItem>
  )
}

export function FeedPostOptionsMenu({
  author,
  postId,
  triggerClassName,
  portalContainer,
  contentClassName,
}: FeedPostOptionsMenuProps) {
  const authorName = author.name
  const inDialog = Boolean(portalContainer)

  return (
    <DropdownMenu modal={!inDialog}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn('feed-social-card__header-btn h-8 w-8 rounded-full', triggerClassName)}
          aria-label="Post options"
        >
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        portalContainer={portalContainer}
        className={cn(
          'w-[min(100vw-2rem,22rem)] rounded-xl p-1.5 shadow-lg',
          inDialog ? 'z-[110]' : 'z-50',
          contentClassName,
        )}
      >
        <PostMenuOption
          icon={Bookmark}
          title="Save Post"
          subtitle="Add this to your saved items."
          onClick={() => toast.success('Post saved')}
        />
        <PostMenuOption
          icon={Bell}
          title="Turn on notifications for this post"
          onClick={() => toast.success('Notifications turned on for this post')}
        />
        <DropdownMenuSeparator />
        <PostMenuOption
          icon={Clock}
          title={`Snooze ${authorName} for 30 days`}
          subtitle="Temporarily stop seeing posts."
          onClick={() => toast.success(`Snoozed ${authorName} for 30 days`)}
        />
        <PostMenuOption
          icon={UserX}
          title={`Unfollow ${authorName}`}
          subtitle={`Stop seeing posts from this Page. They won't be notified that you unfollowed.`}
          onClick={() => toast.success(`Unfollowed ${authorName}`)}
        />
        <PostMenuOption
          icon={MessageCircleWarning}
          title="Report post"
          subtitle={`We won't let ${authorName} know who reported this.`}
          onClick={() => toast.success('Thanks for reporting this post')}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
