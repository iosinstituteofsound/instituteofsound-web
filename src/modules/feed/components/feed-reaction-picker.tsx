import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import {
  prefetchReactionAssets,
  ReactionPickerIcon,
} from '@/modules/feed/components/feed-reaction-icons'
import { FEED_REACTION_OPTIONS } from '@/modules/feed/lib/feed-reactions'
import {
  playReactionSound,
  resetReactionSoundSession,
  unlockReactionSounds,
} from '@/modules/feed/lib/feed-reaction-sounds'
import type { FeedReactionKind } from '@/modules/feed/types/feed.types'
import { cn } from '@/shared/lib/cn'
import './feed-reaction-picker.css'

const VIEWPORT_PADDING = 12
const PICKER_GAP = 12
const PICKER_ESTIMATED_WIDTH = 340
const PICKER_ESTIMATED_HEIGHT = 60

interface FeedReactionPickerProps {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  myReaction: FeedReactionKind | null
  disabled?: boolean
  onSelect: (kind: FeedReactionKind) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

function computePickerPosition(anchor: HTMLElement, panelWidth: number, panelHeight: number) {
  const anchorRect = anchor.getBoundingClientRect()
  const width = panelWidth || PICKER_ESTIMATED_WIDTH
  const height = panelHeight || PICKER_ESTIMATED_HEIGHT

  // Facebook-style: bar grows to the right from the like button, not centered on it.
  let left = anchorRect.left - 6
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - width - VIEWPORT_PADDING),
  )

  const top = Math.max(VIEWPORT_PADDING, anchorRect.top - height - PICKER_GAP)

  return { top, left }
}

export function FeedReactionPicker({
  open,
  anchorRef,
  myReaction,
  disabled = false,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: FeedReactionPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [hoveredKind, setHoveredKind] = useState<FeedReactionKind | null>(null)

  useEffect(() => {
    if (!open) {
      setHoveredKind(null)
      resetReactionSoundSession()
      return
    }
    unlockReactionSounds()
    prefetchReactionAssets(FEED_REACTION_OPTIONS.map((r) => r.kind))
  }, [open])

  useEffect(() => {
    if (!open || !hoveredKind) return
    void playReactionSound(hoveredKind)
  }, [open, hoveredKind])

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }

    const updatePosition = () => {
      if (!anchorRef.current) return
      const panel = panelRef.current
      const width = panel?.getBoundingClientRect().width ?? PICKER_ESTIMATED_WIDTH
      const height = panel?.getBoundingClientRect().height ?? PICKER_ESTIMATED_HEIGHT
      setPosition(computePickerPosition(anchorRef.current, width, height))
    }

    updatePosition()

    const panel = panelRef.current
    const resizeObserver =
      panel && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updatePosition)
        : null
    if (panel) resizeObserver?.observe(panel)

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, anchorRef])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={panelRef}
      className={cn('feed-reaction-picker', position && 'feed-reaction-picker--ready')}
      role="menu"
      aria-label="Choose reaction"
      style={
        position
          ? { top: position.top, left: position.left }
          : { top: -9999, left: -9999, visibility: 'hidden' as const }
      }
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {FEED_REACTION_OPTIONS.map((reaction) => {
        const hovered = hoveredKind === reaction.kind

        return (
          <button
            key={reaction.kind}
            type="button"
            role="menuitem"
            className={cn(
              'feed-reaction-picker-btn',
              myReaction === reaction.kind && 'feed-reaction-picker-btn-active',
              hovered && 'feed-reaction-picker-btn-hovered',
            )}
            aria-label={reaction.label}
            disabled={disabled}
            onMouseEnter={() => setHoveredKind(reaction.kind)}
            onMouseLeave={() => setHoveredKind((current) => (current === reaction.kind ? null : current))}
            onFocus={() => setHoveredKind(reaction.kind)}
            onBlur={() => setHoveredKind((current) => (current === reaction.kind ? null : current))}
            onClick={() => {
              void playReactionSound(reaction.kind)
              onSelect(reaction.kind)
            }}
          >
            <ReactionPickerIcon
              kind={reaction.kind}
              label={reaction.label}
              hovered={hovered}
            />
            {hovered ? <span className="feed-reaction-picker-label">{reaction.label}</span> : null}
          </button>
        )
      })}
    </div>,
    document.body,
  )
}
