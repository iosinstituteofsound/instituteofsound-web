import { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { FeedAuthorProfileLink } from '@/modules/feed/components/feed-author-profile-link'
import { UserAvatar } from '@/shared/components/user'
import { reelCaption } from '@/modules/reels/lib/reel-item'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { VerifiedUserName } from '@/shared/components/icons/verified-user-name'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

interface ReelOverlayProps {
  item: FeedItemDto
  muted: boolean
  onMutedChange: (muted: boolean) => void
}

export function ReelOverlay({ item, muted, onMutedChange }: ReelOverlayProps) {
  const [expanded, setExpanded] = useState(false)
  const caption = reelCaption(item)
  const showSeeMore = caption.length > 120

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="reel-overlay__mute"
        onClick={(event) => {
          event.stopPropagation()
          onMutedChange(!muted)
        }}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>

      <div className="reel-overlay__bottom" onClick={(event) => event.stopPropagation()}>
        <div className="reel-overlay__author">
          <FeedAuthorProfileLink author={item.author} variant="avatar">
            <UserAvatar
              name={item.author.name}
              avatarUrl={item.author.avatarUrl}
              className="h-9 w-9 ring-2 ring-white/30"
            />
          </FeedAuthorProfileLink>
          <FeedAuthorProfileLink author={item.author} variant="name">
            <VerifiedUserName
              name={item.author.name}
              isVerified={item.author.isVerified}
              className="text-sm font-semibold text-white"
              nameClassName="font-semibold"
            />
          </FeedAuthorProfileLink>
        </div>

        {caption ? (
          <p className={cn('reel-overlay__caption', !expanded && showSeeMore && 'line-clamp-2')}>
            {caption}
            {showSeeMore && !expanded ? (
              <button
                type="button"
                className="reel-overlay__see-more"
                onClick={() => setExpanded(true)}
              >
                {' '}
                See more
              </button>
            ) : null}
          </p>
        ) : null}
      </div>
    </>
  )
}
