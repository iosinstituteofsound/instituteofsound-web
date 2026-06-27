import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { FeedPostAudienceIcon } from '@/modules/feed/components/feed-post-audience-icon'
import { buildPostCaptionText, FeedPostCaption } from '@/modules/feed/components/feed-post-caption'
import { ProfileLink } from '@/shared/components/user'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'
import { UserAvatar } from '@/shared/components/user'
import { FeedPostTimestamp } from '@/modules/feed/components/feed-post-timestamp'
import { FeedEngagement } from '@/modules/feed/components/feed-engagement'
import { Button } from '@/shared/components/ui/button'
import { feedItemHasAttachedAudio, FeedPostSoundToggle } from '@/modules/feed/components/feed-post-sound-toggle'
import './feed-photo-viewer.css'

type FeedPhotoViewerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: FeedItemDto
  imageUrl: string
  alt?: string
}

export function FeedPhotoViewer({ open, onOpenChange, item, imageUrl, alt }: FeedPhotoViewerProps) {
  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  if (!open) return null

  const captionText = buildPostCaptionText(item.title, item.body)

  return createPortal(
    <div className="feed-photo-viewer" role="dialog" aria-modal="true" aria-label="Photo post">
      <header className="feed-photo-viewer__header">
        <div className="feed-photo-viewer__header-main">
          <ProfileLink userId={item.author.id} name={item.author.name} variant="avatar">
            <UserAvatar name={item.author.name} avatarUrl={item.author.avatarUrl} className="h-9 w-9" />
          </ProfileLink>
          <div className="min-w-0">
            <p className="feed-photo-viewer__author-line">
              <ProfileLink userId={item.author.id} name={item.author.name} variant="name">
                <VerifiedUserName
                  name={item.author.name}
                  isVerified={item.author.isVerified}
                  nameClassName="feed-photo-viewer__author-name"
                />
              </ProfileLink>
            </p>
            <p className="feed-photo-viewer__meta-line">
              <FeedPostTimestamp value={item.createdAt} />
              <span className="feed-photo-viewer__meta-dot" aria-hidden>
                ·
              </span>
              <FeedPostAudienceIcon payload={item.payload} className="feed-photo-viewer__globe" />
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="feed-photo-viewer__close"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="feed-photo-viewer__body">
        <div className="feed-photo-viewer__stage">
          <img src={imageUrl} alt={alt ?? 'Post photo'} className="feed-photo-viewer__image" />
          {feedItemHasAttachedAudio(item) ? <FeedPostSoundToggle item={item} /> : null}
        </div>

        <aside className="feed-photo-viewer__panel">
          {captionText ? (
            <div className="feed-photo-viewer__caption">
              <FeedPostCaption text={captionText} />
            </div>
          ) : null}
          <div className="feed-photo-viewer__engagement">
            <FeedEngagement item={item} variant="social" />
          </div>
        </aside>
      </div>
    </div>,
    document.body,
  )
}
