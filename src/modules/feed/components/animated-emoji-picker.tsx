import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Apple,
  Cat,
  Clock,
  Flag,
  Hash,
  Lightbulb,
  MapPin,
  Smile,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react'
import { AnimatedEmoji } from '@/modules/feed/components/animated-emoji-text'
import { loadRecentEmojis, saveRecentEmoji } from '@/modules/feed/lib/animated-emoji'
import {
  catalogEntryForEmoji,
  EMOJI_CATALOG,
  EMOJI_CATEGORY_LABELS,
  type EmojiCategoryId,
  type EmojiEntry,
} from '@/modules/feed/lib/emoji-catalog'
import { cn } from '@/shared/lib/cn'

const PICKER_WIDTH = 340
const PICKER_ESTIMATED_HEIGHT = 380
const VIEWPORT_PADDING = 12
const PICKER_EMOJI_IMAGE_SIZE = 128

export const EMOJI_PICKER_ROOT_SELECTOR = '[data-emoji-picker-root]'
export const EMOJI_TRIGGER_SELECTOR = '[data-emoji-trigger]'

export function isEmojiPickerTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(EMOJI_PICKER_ROOT_SELECTOR))
}

export function isEmojiTriggerTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(EMOJI_TRIGGER_SELECTOR))
}

/** Radix outside events expose the real target on detail.originalEvent. */
export function getRadixOutsideEventTarget(event: {
  target: EventTarget | null
  detail?: { originalEvent?: Event }
}) {
  return event.detail?.originalEvent?.target ?? event.target
}

const CATEGORY_TABS: {
  id: EmojiCategoryId
  icon: typeof Smile
  label: string
}[] = [
  { id: 'recent', icon: Clock, label: 'Recent' },
  { id: 'smileys', icon: Smile, label: 'Smileys' },
  { id: 'animals', icon: Cat, label: 'Animals' },
  { id: 'food', icon: Apple, label: 'Food' },
  { id: 'activities', icon: Trophy, label: 'Activities' },
  { id: 'travel', icon: MapPin, label: 'Travel' },
  { id: 'objects', icon: Lightbulb, label: 'Objects' },
  { id: 'symbols', icon: Hash, label: 'Symbols' },
]

function computePickerPosition(anchor: HTMLElement, panelHeight: number) {
  const rect = anchor.getBoundingClientRect()
  const spaceAbove = rect.top - VIEWPORT_PADDING
  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING
  const openAbove = spaceAbove >= panelHeight || spaceAbove >= spaceBelow

  let top = openAbove ? rect.top - 8 : rect.bottom + 8
  if (openAbove) {
    top = Math.max(VIEWPORT_PADDING, rect.top - panelHeight - 8)
  } else {
    top = Math.min(window.innerHeight - panelHeight - VIEWPORT_PADDING, top)
  }

  let left = rect.right - PICKER_WIDTH
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, window.innerWidth - PICKER_WIDTH - VIEWPORT_PADDING),
  )

  return { top, left }
}

function resolveRecentEntries(recent: string[]): EmojiEntry[] {
  return recent
    .map((emoji) => catalogEntryForEmoji(emoji))
    .filter((entry): entry is EmojiEntry => Boolean(entry))
}

interface PickerEmojiCellProps {
  entry: EmojiEntry
  scrollRoot: HTMLElement | null
  onPick: (entry: EmojiEntry) => void
}

const PickerEmojiCell = memo(function PickerEmojiCell({
  entry,
  scrollRoot,
  onPick,
}: PickerEmojiCellProps) {
  const cellRef = useRef<HTMLButtonElement>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const node = cellRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([observed]) => {
        if (observed?.isIntersecting) {
          setAnimate(true)
          observer.disconnect()
        }
      },
      { root: scrollRoot, rootMargin: '48px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [scrollRoot, entry.slug])

  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onPick(entry)
  }

  return (
    <button
      ref={cellRef}
      type="button"
      title={entry.emoji}
      className="flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-transform hover:scale-110 hover:bg-muted"
      onPointerDown={handlePointerDown}
    >
      {animate ? (
        <AnimatedEmoji
          slug={entry.slug}
          emoji={entry.emoji}
          size="md"
          imageSize={PICKER_EMOJI_IMAGE_SIZE}
          className="pointer-events-none"
        />
      ) : (
        <span className="pointer-events-none select-none leading-none">{entry.emoji}</span>
      )}
    </button>
  )
})

interface AnimatedEmojiPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (emoji: string) => void
  anchorEl: HTMLElement | null
  className?: string
}

export function AnimatedEmojiPicker({
  open,
  onOpenChange,
  onSelect,
  anchorEl,
  className,
}: AnimatedEmojiPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null)
  const [category, setCategory] = useState<EmojiCategoryId>('smileys')
  const [recent, setRecent] = useState<string[]>([])
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (open) setRecent(loadRecentEmojis())
  }, [open])

  const syncPosition = useCallback(() => {
    if (!anchorEl) return
    const height = panelRef.current?.offsetHeight ?? PICKER_ESTIMATED_HEIGHT
    setPosition(computePickerPosition(anchorEl, height))
  }, [anchorEl])

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setPosition(null)
      return
    }
    syncPosition()
  }, [open, anchorEl, category, recent.length, syncPosition])

  useEffect(() => {
    if (!open || !anchorEl) return

    let frame = 0
    const schedulePosition = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(syncPosition)
    }

    window.addEventListener('resize', schedulePosition)
    window.addEventListener('scroll', schedulePosition, true)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', schedulePosition)
      window.removeEventListener('scroll', schedulePosition, true)
    }
  }, [open, anchorEl, syncPosition])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (panelRef.current?.contains(target)) return
      if (anchorEl?.contains(target)) return
      if (isEmojiTriggerTarget(target)) return
      onOpenChange(false)
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onOpenChange, anchorEl])

  const entries: EmojiEntry[] = useMemo(() => {
    if (category === 'recent') return resolveRecentEntries(recent)
    return EMOJI_CATALOG[category]
  }, [category, recent])

  const handlePick = useCallback(
    (entry: EmojiEntry) => {
      saveRecentEmoji(entry.emoji)
      setRecent(loadRecentEmojis())
      onSelect(entry.emoji)
    },
    [onSelect],
  )

  if (!open || !anchorEl) return null

  const panelPosition = position ?? computePickerPosition(anchorEl, PICKER_ESTIMATED_HEIGHT)

  return createPortal(
    <div
      ref={panelRef}
      data-emoji-picker-root
      style={{ top: panelPosition.top, left: panelPosition.left }}
      onPointerDown={(event) => event.stopPropagation()}
      className={cn(
        'pointer-events-auto fixed z-[9999] flex w-[min(calc(100vw-24px),340px)] flex-col overflow-hidden rounded-xl border bg-popover shadow-2xl',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <p className="text-sm font-semibold">Animated emoji</p>
        </div>
        <button
          type="button"
          className="rounded-full p-1 text-muted-foreground hover:bg-muted"
          onClick={() => onOpenChange(false)}
          aria-label="Close emoji picker"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={setScrollRoot} className="max-h-[min(280px,40vh)] overflow-y-auto px-2 py-2">
        <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">
          {EMOJI_CATEGORY_LABELS[category]}
        </p>

        {category === 'recent' && entries.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            Pick emojis — they&apos;ll animate in your post
          </p>
        ) : (
          <div className="grid grid-cols-8 gap-0.5">
            {entries.map((entry) => (
              <PickerEmojiCell
                key={`${category}-${entry.slug}`}
                entry={entry}
                scrollRoot={scrollRoot}
                onPick={handlePick}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-1 py-1">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon
          const active = category === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              title={tab.label}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setCategory(tab.id)
              }}
              className={cn(
                'relative flex h-9 flex-1 items-center justify-center rounded-md transition-colors',
                active
                  ? 'text-primary after:absolute after:bottom-0 after:h-0.5 after:w-6 after:rounded-full after:bg-primary'
                  : 'text-muted-foreground hover:bg-muted',
              )}
            >
              <Icon className="h-4 w-4" />
              {active ? <span className="sr-only">{tab.label}</span> : null}
            </button>
          )
        })}
        <button type="button" className="flex h-9 w-9 items-center justify-center text-muted-foreground" disabled>
          <Flag className="h-4 w-4 opacity-40" />
        </button>
      </div>
    </div>,
    document.body,
  )
}

interface EmojiTriggerButtonProps {
  onClick: (anchor: HTMLElement) => void
  active?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function EmojiTriggerButton({ onClick, active, className, size = 'md' }: EmojiTriggerButtonProps) {
  return (
    <button
      type="button"
      data-emoji-trigger
      onClick={(event) => onClick(event.currentTarget)}
      aria-label="Open animated emoji picker"
      aria-expanded={active}
      className={cn(
        'rounded-full transition-colors hover:bg-muted',
        size === 'md' ? 'p-1.5' : 'p-1',
        active && 'bg-amber-500/15 text-amber-500',
        className,
      )}
    >
      <Smile className={cn('h-6 w-6', active ? 'text-amber-500' : 'text-muted-foreground')} />
    </button>
  )
}
