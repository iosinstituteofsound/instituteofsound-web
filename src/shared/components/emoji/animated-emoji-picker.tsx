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
import {
  loadRecentEmojis,
  pickerAnimatedEmojiUrl,
  pickerStaticEmojiUrl,
  saveRecentEmoji,
} from '@/shared/lib/emoji/animated-emoji'
import {
  catalogEntryForEmoji,
  EMOJI_CATALOG,
  EMOJI_CATEGORY_LABELS,
  type EmojiCategoryId,
  type EmojiEntry,
} from '@/shared/lib/emoji/emoji-catalog'
import { isEmojiTriggerTarget } from '@/shared/components/emoji/emoji-picker-utils'
import { cn } from '@/shared/lib/cn'

const PICKER_WIDTH = 340
const PICKER_ESTIMATED_HEIGHT = 380
const VIEWPORT_PADDING = 12

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
  onPick: (entry: EmojiEntry) => void
}

const PickerEmojiCell = memo(function PickerEmojiCell({
  entry,
  onPick,
}: PickerEmojiCellProps) {
  const cellRef = useRef<HTMLButtonElement>(null)
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const [staticFailed, setStaticFailed] = useState(false)
  const [animatedFailed, setAnimatedFailed] = useState(false)
  const [playKey, setPlayKey] = useState(0)

  const staticSrc = pickerStaticEmojiUrl(entry.slug)
  const animatedSrc = pickerAnimatedEmojiUrl(entry.slug)

  useEffect(() => {
    const node = cellRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([observed]) => {
        if (observed?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '64px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [entry.slug])

  useEffect(() => {
    if (!visible || animatedFailed) return
    const preload = new Image()
    preload.src = animatedSrc
  }, [visible, animatedSrc, animatedFailed])

  const handlePointerDown = (event: React.PointerEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onPick(entry)
  }

  const handleMouseEnter = () => {
    setHovered(true)
    if (!animatedFailed) setPlayKey((key) => key + 1)
  }

  const showAnimated = hovered && !animatedFailed

  return (
    <button
      ref={cellRef}
      type="button"
      aria-label={entry.emoji}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-150',
        hovered && 'bg-muted',
      )}
      onPointerDown={handlePointerDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      onFocus={handleMouseEnter}
      onBlur={() => setHovered(false)}
    >
      {!visible ? (
        <span className="pointer-events-none text-[26px] leading-none opacity-50">{entry.emoji}</span>
      ) : showAnimated ? (
        <img
          key={playKey}
          src={animatedSrc}
          alt=""
          aria-hidden
          decoding="async"
          draggable={false}
          className="pointer-events-none h-9 w-9 object-contain scale-110"
          onError={() => setAnimatedFailed(true)}
        />
      ) : !staticFailed ? (
        <img
          src={staticSrc}
          alt=""
          aria-hidden
          decoding="async"
          draggable={false}
          className="pointer-events-none h-9 w-9 object-contain"
          onError={() => setStaticFailed(true)}
        />
      ) : (
        <span className="pointer-events-none text-[26px] leading-none">{entry.emoji}</span>
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
        'pointer-events-auto fixed z-[9999] flex w-[min(calc(100vw-24px),340px)] flex-col overflow-hidden rounded-2xl border border-border/60 bg-popover shadow-[0_20px_50px_rgba(0,0,0,0.45)]',
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

      <div className="max-h-[min(280px,40vh)] overflow-y-auto px-2 py-2">
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
              <PickerEmojiCell key={`${category}-${entry.slug}`} entry={entry} onPick={handlePick} />
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
