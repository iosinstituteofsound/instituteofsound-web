import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Share2, ThumbsUp } from 'lucide-react'
import { useAuthStore } from '@/app/stores/auth-store'
import { FeedEngagement } from '@/modules/feed/components/feed-engagement'
import { useReleaseFeedItem } from '@/modules/explore/hooks/use-release-feed-item'
import { toast } from '@/shared/components/ui/sonner'
import '@/modules/feed/components/cards/feed-card.css'

interface ReleaseHeroEngagementProps {
  releaseId: string
  releaseTitle: string
  menu?: ReactNode
}

const OPTIONS_TRIGGER_CLASS =
  'feed-social-card__action-btn explore-release-hero__options-trigger'

function ReleaseHeroSocialFallback({
  releaseTitle,
  menu,
}: {
  releaseTitle: string
  menu?: ReactNode
}) {
  const userId = useAuthStore((s) => s.userId)
  const [busy, setBusy] = useState(false)

  const share = async () => {
    if (busy) return
    setBusy(true)
    try {
      const url = window.location.href
      if (navigator.share) {
        await navigator.share({ title: releaseTitle, url })
        return
      }
      await navigator.clipboard?.writeText(url)
      toast.success('Link copied')
    } catch {
      // User cancelled share sheet — no toast.
    } finally {
      setBusy(false)
    }
  }

  const promptEngagement = () => {
    toast.message('Share this release on the feed to enable likes and comments.')
  }

  const likeButton = userId ? (
    <button
      type="button"
      className="feed-social-card__action-btn"
      aria-label="Like"
      onClick={promptEngagement}
    >
      <ThumbsUp className="h-5 w-5" />
      <span>Like</span>
    </button>
  ) : (
    <Link to="/auth/login" className="feed-social-card__action-btn" aria-label="Like">
      <ThumbsUp className="h-5 w-5" />
      <span>Like</span>
    </Link>
  )

  return (
    <div className="feed-social-card__engagement">
      <div className="feed-social-card__divider" />
      <div className="feed-social-card__action-bar">
        <div className="feed-social-card__action-slot">{likeButton}</div>
        <div className="feed-social-card__action-slot">
          {userId ? (
            <button
              type="button"
              className="feed-social-card__action-btn"
              aria-label="Comment"
              onClick={promptEngagement}
            >
              <MessageCircle className="h-5 w-5" />
              <span>Comment</span>
            </button>
          ) : (
            <Link to="/auth/login" className="feed-social-card__action-btn" aria-label="Comment">
              <MessageCircle className="h-5 w-5" />
              <span>Comment</span>
            </Link>
          )}
        </div>
        <div className="feed-social-card__action-slot">
          <button
            type="button"
            className="feed-social-card__action-btn"
            aria-label="Share"
            disabled={busy}
            onClick={() => void share()}
          >
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
        {menu ? (
          <div className="feed-social-card__action-slot feed-social-card__action-slot--trailing">
            {menu}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ReleaseHeroEngagement({ releaseId, releaseTitle, menu }: ReleaseHeroEngagementProps) {
  const { data: feedItem, isLoading } = useReleaseFeedItem(releaseId)

  if (isLoading) {
    return (
      <div className="explore-release-hero__engagement explore-release-hero__engagement--loading" aria-hidden />
    )
  }

  if (feedItem) {
    return (
      <div className="explore-release-hero__engagement">
        <FeedEngagement item={feedItem} variant="social" trailingAction={menu} />
      </div>
    )
  }

  return (
    <div className="explore-release-hero__engagement">
      <ReleaseHeroSocialFallback releaseTitle={releaseTitle} menu={menu} />
    </div>
  )
}

export { OPTIONS_TRIGGER_CLASS }
