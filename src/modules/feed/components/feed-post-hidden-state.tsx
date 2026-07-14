import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { MessageCircleWarning, SlidersHorizontal, UserX, X } from 'lucide-react'
import type { FeedAuthorDto } from '@/modules/feed/types/feed.types'
import { ReportDialog } from '@/modules/support/components/report-dialog'
import { Button } from '@/shared/components/ui/button'
import { toast } from '@/shared/components/ui/sonner'

type FeedPostHiddenStateProps = {
  author: FeedAuthorDto
  postId: string
  onUndo: () => void
}

function HiddenAction({
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
    <button type="button" className="feed-post-hidden__action" onClick={onClick}>
      <Icon className="feed-post-hidden__action-icon" aria-hidden />
      <div className="feed-post-hidden__action-text">
        <p className="feed-post-hidden__action-title">{title}</p>
        {subtitle ? <p className="feed-post-hidden__action-subtitle">{subtitle}</p> : null}
      </div>
    </button>
  )
}

export function FeedPostHiddenState({ author, postId, onUndo }: FeedPostHiddenStateProps) {
  const authorName = author.name
  const [reportOpen, setReportOpen] = useState(false)

  return (
    <div className="feed-post-hidden">
      <div className="feed-post-hidden__banner">
        <div className="feed-post-hidden__banner-icon" aria-hidden>
          <X className="h-4 w-4" />
        </div>

        <div className="feed-post-hidden__banner-copy">
          <p className="feed-post-hidden__banner-title">Hidden</p>
          <p className="feed-post-hidden__banner-subtitle">
            Hiding posts helps personalise your Feed.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="feed-post-hidden__undo shrink-0 rounded-full px-4"
          onClick={onUndo}
        >
          Undo
        </Button>
      </div>

      <div className="feed-post-hidden__divider" />

      <div className="feed-post-hidden__actions">
        <HiddenAction
          icon={UserX}
          title={`Unfollow ${authorName}`}
          subtitle="Stop seeing posts from this Page. They won't be notified that you unfollowed."
          onClick={() => toast.success(`Unfollowed ${authorName}`)}
        />
        <HiddenAction
          icon={MessageCircleWarning}
          title="Report post"
          subtitle={`We won't let ${authorName} know who reported this.`}
          onClick={() => setReportOpen(true)}
        />
        <HiddenAction
          icon={SlidersHorizontal}
          title="Content preferences"
          onClick={() => toast.message('Content preferences coming soon')}
        />
      </div>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        target={{ type: 'post', id: postId }}
        subject="Report post"
      />
    </div>
  )
}
