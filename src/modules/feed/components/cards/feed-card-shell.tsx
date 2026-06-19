import { useState, type KeyboardEvent } from 'react'
import { Globe, X } from 'lucide-react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { FeedEngagement } from '@/modules/feed/components/feed-engagement'
import { FeedPhotoViewer } from '@/modules/feed/components/feed-photo-viewer'
import { FeedPostHiddenState } from '@/modules/feed/components/feed-post-hidden-state'
import { FeedPostOptionsMenu } from '@/modules/feed/components/feed-post-options-menu'
import { buildPostCaptionText, FeedPostCaption } from '@/modules/feed/components/feed-post-caption'
import { FeedAuthorProfileLink } from '@/modules/feed/components/feed-author-profile-link'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'
import { FeedUserAvatar } from '@/modules/feed/components/feed-user-avatar'
import { FeedPostTimestamp } from '@/modules/feed/components/feed-post-timestamp'
import { getFeedItemPhotoUrl } from '@/modules/feed/lib/feed-post-meta'
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
  compact = false,
}: {
  item: FeedItemDto
  children?: React.ReactNode
  media?: React.ReactNode
  className?: string
  defaultCommentsOpen?: boolean
  headerContext?: React.ReactNode
  compact?: boolean
}) {
  const [isHidden, setIsHidden] = useState(false)
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)
  const captionText = buildPostCaptionText(item.title, item.body)
  const photoUrl = getFeedItemPhotoUrl(item)
  const mediaIsInteractive = Boolean(photoUrl)

  const openPhotoViewer = () => {
    if (!photoUrl) return
    setPhotoViewerOpen(true)
  }

  const handleMediaKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openPhotoViewer()
    }
  }

  const photoAlt =
    item.type === 'article'
      ? (item.title ?? 'Article cover')
      : (payloadString(item.payload, 'alt') ?? item.title ?? 'Post photo')

  return (
    <article className={cn('feed-social-card', isHidden && 'feed-social-card--hidden', compact && 'feed-social-card--compact', className)}>
      <div className="feed-social-card__layers">
        <div
          className="feed-social-card__layer feed-social-card__layer--post"
          aria-hidden={isHidden}
        >
          <div className="feed-social-card__layer-inner">
            <header className="feed-social-card__header">
              <FeedAuthorProfileLink author={item.author} variant="avatar" className="feed-social-card__avatar">
                <FeedUserAvatar name={item.author.name} avatarUrl={item.author.avatarUrl} className="h-10 w-10" />
              </FeedAuthorProfileLink>

              <div className="feed-social-card__meta">
                <p className="feed-social-card__name-line">
                  <FeedAuthorProfileLink author={item.author} variant="name">
                    <VerifiedUserName
                      name={item.author.name}
                      isVerified={item.author.isVerified}
                      nameClassName="feed-social-card__name"
                    />
                  </FeedAuthorProfileLink>
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

            {media ? (
              <div
                className={cn(
                  'feed-social-card__media',
                  mediaIsInteractive && 'feed-social-card__media--interactive',
                )}
                {...(mediaIsInteractive
                  ? {
                      role: 'button',
                      tabIndex: 0,
                      'aria-label': 'View photo',
                      onClick: openPhotoViewer,
                      onKeyDown: handleMediaKeyDown,
                    }
                  : {})}
              >
                {media}
              </div>
            ) : null}

            {children ? <div className="feed-social-card__body">{children}</div> : null}
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

      {!isHidden ? (
        <FeedEngagement item={item} defaultCommentsOpen={defaultCommentsOpen} variant="social" />
      ) : null}

      {photoUrl ? (
        <FeedPhotoViewer
          open={photoViewerOpen}
          onOpenChange={setPhotoViewerOpen}
          item={item}
          imageUrl={photoUrl}
          alt={photoAlt}
        />
      ) : null}
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
