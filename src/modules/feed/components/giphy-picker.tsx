import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Search, X } from 'lucide-react'
import { searchGifs, trendingGifs, type GiphyGif } from '@/modules/feed/api/giphy.api'
import { cn } from '@/shared/lib/cn'

const PICKER_WIDTH = 340
const PICKER_HEIGHT = 420
const VIEWPORT_PADDING = 12

export const GIPHY_PICKER_ROOT_SELECTOR = '[data-giphy-picker-root]'
export const GIPHY_TRIGGER_SELECTOR = '[data-giphy-trigger]'

export function isGiphyPickerTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(GIPHY_PICKER_ROOT_SELECTOR))
}

export function isGiphyTriggerTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(GIPHY_TRIGGER_SELECTOR))
}

function computePickerPosition(
  anchor: HTMLElement,
  panelHeight: number,
  container?: HTMLElement | null,
) {
  const anchorRect = anchor.getBoundingClientRect()
  const bounds = container
    ? container.getBoundingClientRect()
    : {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }

  const localTop = anchorRect.top - bounds.top
  const localBottom = anchorRect.bottom - bounds.top
  const localRight = anchorRect.right - bounds.left

  const spaceAbove = localTop - VIEWPORT_PADDING
  const spaceBelow = bounds.height - localBottom - VIEWPORT_PADDING
  const openAbove = spaceAbove >= panelHeight || spaceAbove >= spaceBelow

  let top = openAbove ? localTop - panelHeight - 8 : localBottom + 8
  if (openAbove) {
    top = Math.max(VIEWPORT_PADDING, top)
  } else {
    top = Math.min(bounds.height - panelHeight - VIEWPORT_PADDING, top)
  }

  let left = localRight - PICKER_WIDTH
  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, bounds.width - PICKER_WIDTH - VIEWPORT_PADDING),
  )

  return { top, left, strategy: container ? ('absolute' as const) : ('fixed' as const) }
}

interface GiphyPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (gif: GiphyGif) => void
  anchorEl: HTMLElement | null
  /** Portal inside a modal so Radix focus/pointer traps do not block interaction. */
  portalContainer?: HTMLElement | null
}

export function GiphyPicker({
  open,
  onOpenChange,
  onSelect,
  anchorEl,
  portalContainer = null,
}: GiphyPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<GiphyGif[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [position, setPosition] = useState<{
    top: number
    left: number
    strategy: 'fixed' | 'absolute'
  } | null>(null)
  const requestId = useRef(0)

  const syncPosition = useCallback(() => {
    if (!anchorEl) return
    const height = panelRef.current?.offsetHeight ?? PICKER_HEIGHT
    setPosition(computePickerPosition(anchorEl, height, portalContainer))
  }, [anchorEl, portalContainer])

  useLayoutEffect(() => {
    if (!open || !anchorEl) {
      setPosition(null)
      return
    }
    syncPosition()
  }, [open, anchorEl, syncPosition])

  useEffect(() => {
    if (!open || !anchorEl) return

    let frame = 0
    const schedulePosition = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(syncPosition)
    }

    const handleScroll = (event: Event) => {
      const target = event.target
      if (target instanceof Node && panelRef.current?.contains(target)) return
      schedulePosition()
    }

    window.addEventListener('resize', schedulePosition)
    window.addEventListener('scroll', handleScroll, true)
    portalContainer?.addEventListener('scroll', handleScroll, true)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', schedulePosition)
      window.removeEventListener('scroll', handleScroll, true)
      portalContainer?.removeEventListener('scroll', handleScroll, true)
    }
  }, [open, anchorEl, syncPosition, portalContainer])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (panelRef.current?.contains(target)) return
      if (anchorEl?.contains(target)) return
      if (isGiphyTriggerTarget(target)) return
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

  useEffect(() => {
    if (!open) {
      setQuery('')
      setItems([])
      setError(null)
      return
    }

    const timer = window.setTimeout(() => searchRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return

    const trimmed = query.trim()
    const currentRequest = ++requestId.current
    setLoading(true)
    setError(null)

    const load = (promise: Promise<GiphyGif[]>) => {
      void promise
        .then((next) => {
          if (requestId.current !== currentRequest) return
          setItems(next)
        })
        .catch(() => {
          if (requestId.current !== currentRequest) return
          setError('Could not load GIFs')
          setItems([])
        })
        .finally(() => {
          if (requestId.current === currentRequest) setLoading(false)
        })
    }

    if (!trimmed) {
      load(trendingGifs(20))
      return
    }

    const timer = window.setTimeout(() => {
      load(searchGifs(trimmed, 20))
    }, 300)

    return () => window.clearTimeout(timer)
  }, [open, query])

  if (!open || !anchorEl) return null

  const panelPosition =
    position ?? computePickerPosition(anchorEl, PICKER_HEIGHT, portalContainer)
  const portalTarget = portalContainer ?? document.body

  return createPortal(
    <div
      ref={panelRef}
      data-giphy-picker-root
      style={{
        top: panelPosition.top,
        left: panelPosition.left,
        width: PICKER_WIDTH,
        height: PICKER_HEIGHT,
        position: panelPosition.strategy,
      }}
      className={cn(
        'pointer-events-auto z-[9999] flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-popover text-popover-foreground shadow-[0_20px_50px_rgba(0,0,0,0.45)]',
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={searchRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search GIPHY"
          className="pointer-events-auto min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          aria-label="Close GIF picker"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 touch-pan-y">
        {loading && items.length === 0 ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error && items.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">{error}</p>
        ) : items.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">No GIFs found</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {items.map((gif) => (
              <button
                key={gif.id}
                type="button"
                aria-label={gif.title}
                className="overflow-hidden rounded-lg bg-muted/40 transition hover:ring-2 hover:ring-primary/40"
                onClick={() => {
                  onSelect(gif)
                  onOpenChange(false)
                }}
              >
                <img
                  src={gif.previewUrl}
                  alt={gif.title}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="aspect-square w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Powered by GIPHY
      </div>
    </div>,
    portalTarget,
  )
}

interface GiphyTriggerButtonProps {
  active?: boolean
  className?: string
  onClick: (anchor: HTMLElement) => void
}

export function GiphyTriggerButton({ active = false, className, onClick }: GiphyTriggerButtonProps) {
  return (
    <button
      type="button"
      data-giphy-trigger
      aria-label="GIF"
      className={cn(className, active && 'bg-primary/10 text-foreground')}
      onClick={(event) => onClick(event.currentTarget)}
    >
      <span className="text-xs font-bold">GIF</span>
    </button>
  )
}
