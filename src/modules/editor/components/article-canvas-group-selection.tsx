import { RotateCw, X } from 'lucide-react'
import type { GroupBounds } from '@/modules/editor/lib/canvas-marquee-utils'
import { cn } from '@/shared/lib/cn'

interface ArticleCanvasGroupSelectionProps {
  bounds: GroupBounds
  objectCount: number
  onDelete: () => void
  onMoveStart: (clientX: number, clientY: number) => void
}

export function ArticleCanvasGroupSelection({
  bounds,
  objectCount,
  onDelete,
  onMoveStart,
}: ArticleCanvasGroupSelectionProps) {
  const capturePointer = (event: React.PointerEvent) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  return (
    <div
      className="article-canvas-group-selection"
      style={{
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
      }}
    >
      <div
        className="article-canvas-group-selection__box"
        onPointerDown={(e) => {
          capturePointer(e)
          onMoveStart(e.clientX, e.clientY)
        }}
      />

      <span className="article-canvas-group-selection__label">{objectCount} selected</span>

      <button
        type="button"
        className="article-canvas-selection__rotate article-canvas-group-selection__rotate"
        aria-label="Rotate group"
        tabIndex={-1}
      >
        <RotateCw className="h-3.5 w-3.5 opacity-40" />
      </button>

      <button
        type="button"
        className={cn('article-canvas-selection__close', 'article-canvas-group-selection__close')}
        aria-label="Delete selected"
        onPointerDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onDelete()
        }}
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const).map((handle) => (
        <span
          key={handle}
          className={cn('article-canvas-selection__handle', `article-canvas-selection__handle--${handle}`)}
          aria-hidden
        />
      ))}
    </div>
  )
}
