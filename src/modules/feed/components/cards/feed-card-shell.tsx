import { useState } from 'react'
import { Globe, X } from 'lucide-react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { FeedEngagement } from '@/modules/feed/components/feed-engagement'
import { FeedPostHiddenState } from '@/modules/feed/components/feed-post-hidden-state'
import { FeedPostOptionsMenu } from '@/modules/feed/components/feed-post-options-menu'
import { buildPostCaptionText, FeedPostCaption } from '@/modules/feed/components/feed-post-caption'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { FeedPostTimestamp } from '@/modules/feed/components/feed-post-timestamp'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'
import './feed-card.css'

export function FeedCardShell({
  item,
  children,
  media,
  className,
  defaultCommentsOpen = false,
  headerContext,
}: {
  item: FeedItemDto
  children?: React.ReactNode
  media?: React.ReactNode
  className?: string
  defaultCommentsOpen?: boolean
  headerContext?: React.ReactNode
}) {
  const [isHidden, setIsHidden] = useState(false)
  const captionText = buildPostCaptionText(item.title, item.body)

  return (
    <article className={cn('feed-social-card', isHidden && 'feed-social-card--hidden', className)}>
      <div className="feed-social-card__layers">
        <div
          className="feed-social-card__layer feed-social-card__layer--post"
          aria-hidden={isHidden}
        >
          <div className="feed-social-card__layer-inner">
            <header className="feed-social-card__header">
              <div className="feed-social-card__avatar">
                <FeedUserAvatar name={item.author.name} avatarUrl={item.author.avatarUrl} className="h-10 w-10" />
              </div>

              <div className="feed-social-card__meta">
                <p className="feed-social-card__name-line">
                  <span className="feed-social-card__name">{item.author.name}</span>
                </p>
                <p className="feed-social-card__meta-line">
                  <FeedPostTimestamp value={item.createdAt} />
                  <span className="feed-social-card__meta-dot" aria-hidden> · </span>
                  <Globe className="feed-social-card__globe" aria-label="Public" />
                </p>
                {headerContext ? <div className="feed-social-card__context-line">{headerContext}</div> : null}
              </div>

              <div className="feed-social-card__header-actions">
                <FeedPostOptionsMenu author={item.author} postId={item.id} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="feed-social-card__header-btn h-8 w-8 rounded-full"
                  aria-label="Hide post"
                  onClick={() => setIsHidden(true)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </header>

            {captionText ? <FeedPostCaption text={captionText} /> : null}

            {media ? <div className="feed-social-card__media">{media}</div> : null}

            {children ? <div className="feed-social-card__body">{children}</div> : null}

            <FeedEngagement item={item} defaultCommentsOpen={defaultCommentsOpen} variant="social" />
          </div>
        </div>

        <div
          className="feed-social-card__layer feed-social-card__layer--hidden-state"
          aria-hidden={!isHidden}
        >
          <div className="feed-social-card__layer-inner">
            <FeedPostHiddenState author={item.author} onUndo={() => setIsHidden(false)} />
          </div>
        </div>
      </div>
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

export function musicTrackContextLine(payload: Record<string, unknown>) {
  const trackTitle = payloadString(payload, 'trackTitle')
  const artistName = payloadString(payload, 'artistName')
  return [trackTitle, artistName].filter(Boolean).join(' · ')
}

export function FeedMediaFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('feed-social-card__media-frame', className)}>{children}</div>
}
