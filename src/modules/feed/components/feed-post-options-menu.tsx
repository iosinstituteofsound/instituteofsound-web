'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Bell,
  Bookmark,
  Clock,
  MessageCircleWarning,
  MoreHorizontal,
  Trash2,
  UserX,
} from 'lucide-react'
import { useAuthStore } from '@/app/stores/auth-store'
import { useDeleteFeedItem } from '@/modules/feed/hooks/use-feed'
import { useFollowStatus, useToggleFollow } from '@/shared/hooks/use-follow'
import type { FeedAuthorDto } from '@/modules/feed/types/feed.types'
import { ReportDialog } from '@/modules/support/components/report-dialog'
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
  onDeleted?: () => void
}

function PostMenuOption({
  icon: Icon,
  title,
  subtitle,
  onClick,
  destructive = false,
  disabled = false,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}) {
  return (
    <DropdownMenuItem
      className={cn(
        'cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 focus:bg-accent',
        destructive && 'text-destructive focus:text-destructive',
      )}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon
        className={cn(
          'mt-0.5 h-5 w-5 shrink-0',
          destructive ? 'text-destructive' : 'text-muted-foreground',
        )}
      />
      <div className="min-w-0 text-left">
        <p className="text-[15px] font-semibold leading-snug">{title}</p>
        {subtitle ? (
          <p
            className={cn(
              'mt-0.5 text-xs leading-snug',
              destructive ? 'text-destructive/80' : 'text-muted-foreground',
            )}
          >
            {subtitle}
          </p>
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
  onDeleted,
}: FeedPostOptionsMenuProps) {
  const authorName = author.name
  const inDialog = Boolean(portalContainer)
  const userId = useAuthStore((s) => s.userId)
  const isOwner = Boolean(userId && userId === author.id)
  const deletePost = useDeleteFeedItem()
  const { data: followStatus } = useFollowStatus(!isOwner ? author.id : undefined)
  const toggleFollow = useToggleFollow(author.id)
  const isFollowing = followStatus?.following ?? false
  const [reportOpen, setReportOpen] = useState(false)

  const handleDelete = () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return

    deletePost.mutate(postId, {
      onSuccess: () => {
        toast.success('Post deleted')
        onDeleted?.()
      },
      onError: () => {
        toast.error('Could not delete post. Please try again.')
      },
    })
  }

  return (
    <>
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
        {isOwner ? (
          <>
            <PostMenuOption
              icon={Trash2}
              title="Delete post"
              subtitle="Remove this post permanently."
              destructive
              disabled={deletePost.isPending}
              onClick={handleDelete}
            />
            <DropdownMenuSeparator />
          </>
        ) : null}
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
          title={isFollowing ? `Unfollow ${authorName}` : `Follow ${authorName}`}
          subtitle={
            isFollowing
              ? `Stop seeing posts from ${authorName}. They won't be notified that you unfollowed.`
              : `See posts from ${authorName} in your following feed.`
          }
          onClick={() => {
            toggleFollow.mutate(isFollowing, {
              onSuccess: (result) => {
                toast.success(
                  result.following ? `Following ${authorName}` : `Unfollowed ${authorName}`,
                )
              },
              onError: () => {
                toast.error('Could not update follow status. Please try again.')
              },
            })
          }}
          disabled={toggleFollow.isPending}
        />
        <PostMenuOption
          icon={MessageCircleWarning}
          title="Report post"
          subtitle={`We won't let ${authorName} know who reported this.`}
          onClick={() => setReportOpen(true)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
    <ReportDialog
      open={reportOpen}
      onOpenChange={setReportOpen}
      target={{ type: 'post', id: postId }}
      subject="Report post"
    />
    </>
  )
}
