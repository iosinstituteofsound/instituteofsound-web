import { useEffect, useState, type ReactNode } from 'react'
import { animatedEmojiUrl } from '@/modules/feed/lib/animated-emoji'
import { FEED_REACTION_ASSETS } from '@/modules/feed/lib/feed-reaction-assets'
import { feedReactionMeta } from '@/modules/feed/lib/feed-reactions'
import type { FeedReactionKind } from '@/modules/feed/types/feed.types'
import { cn } from '@/shared/lib/cn'
import './feed-reaction-icons.css'

export type ReactionIconSize = 'picker' | 'inline'

const ICON_PX: Record<ReactionIconSize, number> = {
  picker: 48,
  inline: 20,
}

interface ReactionIconProps {
  kind: FeedReactionKind
  label: string
  hovered?: boolean
  size?: ReactionIconSize
  className?: string
}

function ReactionIconFrame({
  kind,
  size,
  hovered,
  className,
  children,
}: {
  kind: FeedReactionKind
  size: ReactionIconSize
  hovered?: boolean
  className?: string
  children: ReactNode
}) {
  if (size === 'inline') {
    return <span className={cn('feed-reaction-inline-frame', className)}>{children}</span>
  }

  return (
    <span
      className={cn(
        'feed-reaction-picker-icon',
        `feed-reaction-picker-icon--${kind}`,
        hovered && 'feed-reaction-picker-icon--live',
        className,
      )}
    >
      {children}
    </span>
  )
}

function PickerReactionStack({
  kind,
  hovered,
  px,
}: {
  kind: FeedReactionKind
  hovered: boolean
  px: number
}) {
  const staticSrc = FEED_REACTION_ASSETS[kind]
  const animatedSrc = animatedEmojiUrl(feedReactionMeta(kind).notoSlug)
  const [animatedReady, setAnimatedReady] = useState(false)
  const [animatedFailed, setAnimatedFailed] = useState(false)

  useEffect(() => {
    setAnimatedReady(false)
    setAnimatedFailed(false)
  }, [animatedSrc])

  const showAnimated = hovered && animatedReady && !animatedFailed

  return (
    <span className="feed-reaction-asset-stack" aria-hidden>
      <img
        src={staticSrc}
        alt=""
        width={px}
        height={px}
        draggable={false}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className={cn(
          'feed-reaction-asset-img feed-reaction-asset-img--static',
          showAnimated && 'feed-reaction-asset-img--hidden',
        )}
      />
      <img
        src={animatedSrc}
        alt=""
        width={px}
        height={px}
        draggable={false}
        loading="eager"
        decoding="async"
        onLoad={() => setAnimatedReady(true)}
        onError={() => setAnimatedFailed(true)}
        className={cn(
          'feed-reaction-asset-img feed-reaction-asset-img--animated',
          !showAnimated && 'feed-reaction-asset-img--hidden',
        )}
      />
    </span>
  )
}

export function ReactionPickerIcon({
  kind,
  label,
  hovered = false,
  size = 'picker',
  className,
}: ReactionIconProps) {
  const px = ICON_PX[size]
  const staticSrc = FEED_REACTION_ASSETS[kind]

  return (
    <ReactionIconFrame kind={kind} size={size} hovered={hovered} className={className}>
      {size === 'picker' ? (
        <PickerReactionStack kind={kind} hovered={hovered} px={px} />
      ) : (
        <img
          src={staticSrc}
          alt={label}
          width={px}
          height={px}
          draggable={false}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          className="feed-reaction-asset-img"
        />
      )}
    </ReactionIconFrame>
  )
}

export { prefetchReactionAssets } from '@/modules/feed/lib/feed-reaction-assets'
