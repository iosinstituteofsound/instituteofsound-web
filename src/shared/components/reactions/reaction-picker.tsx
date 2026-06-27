import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { prefetchReactionAssets, ReactionPickerIcon } from '@/shared/components/reactions/reaction-picker-icon'
import { REACTION_OPTIONS } from '@/shared/lib/reactions/reaction-options'
import type { ReactionKind } from '@/shared/lib/reactions/reaction-options'
import {
  playReactionSound,
  resetReactionSoundSession,
  unlockReactionSounds,
} from '@/shared/lib/reactions/reaction-sounds'
import { cn } from '@/shared/lib/cn'
import './reaction-picker.css'

const VIEWPORT_PADDING = 12
const PICKER_GAP = 12
const PICKER_ESTIMATED_WIDTH = 340
const PICKER_ESTIMATED_HEIGHT = 60
const COMPACT_PICKER_ESTIMATED_WIDTH = 228
const COMPACT_PICKER_ESTIMATED_HEIGHT = 44

export type ReactionPickerSize = 'default' | 'compact'

interface ReactionPickerProps {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  myReaction?: ReactionKind | null
  disabled?: boolean
  size?: ReactionPickerSize
  enableSounds?: boolean
  onSelect: (kind: ReactionKind) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

function computePickerPosition(
  anchor: HTMLElement,
  panelWidth: number,
  panelHeight: number,
  size: ReactionPickerSize,
) {
  const anchorRect = anchor.getBoundingClientRect()
  const fallbackWidth = size === 'compact' ? COMPACT_PICKER_ESTIMATED_WIDTH : PICKER_ESTIMATED_WIDTH
  const fallbackHeight = size === 'compact' ? COMPACT_PICKER_ESTIMATED_HEIGHT : PICKER_ESTIMATED_HEIGHT
  const width = panelWidth || fallbackWidth
  const height = panelHeight || fallbackHeight

  let left = anchorRect.left - (size === 'compact' ? 4 : 6)
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - width - VIEWPORT_PADDING),
  )

  const top = Math.max(VIEWPORT_PADDING, anchorRect.top - height - (size === 'compact' ? 8 : PICKER_GAP))

  return { top, left }
}

export function ReactionPicker({
  open,
  anchorRef,
  myReaction = null,
  disabled = false,
  size = 'default',
  enableSounds = true,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: ReactionPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const [hoveredKind, setHoveredKind] = useState<ReactionKind | null>(null)
  const iconSize = size === 'compact' ? 'compact' : 'picker'

  useEffect(() => {
    if (!open) {
      setHoveredKind(null)
      resetReactionSoundSession()
      return
    }
    if (enableSounds) unlockReactionSounds()
    prefetchReactionAssets(REACTION_OPTIONS.map((reaction) => reaction.kind))
  }, [open, enableSounds])

  useEffect(() => {
    if (!open || !hoveredKind || !enableSounds) return
    void playReactionSound(hoveredKind)
  }, [open, hoveredKind, enableSounds])

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null)
      return
    }

    const updatePosition = () => {
      if (!anchorRef.current) return
      const panel = panelRef.current
      const width = panel?.getBoundingClientRect().width ?? (size === 'compact' ? COMPACT_PICKER_ESTIMATED_WIDTH : PICKER_ESTIMATED_WIDTH)
      const height = panel?.getBoundingClientRect().height ?? (size === 'compact' ? COMPACT_PICKER_ESTIMATED_HEIGHT : PICKER_ESTIMATED_HEIGHT)
      setPosition(computePickerPosition(anchorRef.current, width, height, size))
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
  }, [open, anchorRef, size])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      ref={panelRef}
      className={cn(
        'feed-reaction-picker',
        size === 'compact' && 'feed-reaction-picker--compact',
        position && 'feed-reaction-picker--ready',
      )}
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
      {REACTION_OPTIONS.map((reaction) => {
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
              if (enableSounds) void playReactionSound(reaction.kind)
              onSelect(reaction.kind)
            }}
          >
            <ReactionPickerIcon
              kind={reaction.kind}
              label={reaction.label}
              hovered={hovered}
              size={iconSize}
            />
            {hovered ? (
              <span className={cn('feed-reaction-picker-label', size === 'compact' && 'feed-reaction-picker-label--compact')}>
                {reaction.label}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>,
    document.body,
  )
}
