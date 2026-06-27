import { useEffect, useState, type ReactNode } from 'react'
import { animatedEmojiUrl } from '@/shared/lib/emoji/animated-emoji'
import { REACTION_ASSETS } from '@/shared/lib/reactions/reaction-assets'
import { reactionMeta } from '@/shared/lib/reactions/reaction-options'
import type { ReactionKind } from '@/shared/lib/reactions/reaction-options'
import { cn } from '@/shared/lib/cn'
import './reaction-picker-icon.css'

export type ReactionIconSize = 'picker' | 'inline' | 'compact'

const ICON_PX: Record<ReactionIconSize, number> = {
  picker: 48,
  inline: 20,
  compact: 32,
}

interface ReactionIconProps {
  kind: ReactionKind
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
  kind: ReactionKind
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
        size === 'compact' && 'feed-reaction-picker-icon--compact',
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
  kind: ReactionKind
  hovered: boolean
  px: number
}) {
  const staticSrc = REACTION_ASSETS[kind]
  const animatedSrc = animatedEmojiUrl(reactionMeta(kind).notoSlug)
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
  const staticSrc = REACTION_ASSETS[kind]

  return (
    <ReactionIconFrame kind={kind} size={size} hovered={hovered} className={className}>
      {size === 'picker' || size === 'compact' ? (
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

export { prefetchReactionAssets } from '@/shared/lib/reactions/reaction-assets'
