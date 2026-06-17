import { RotateCw, X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

const HANDLES: { id: ResizeHandle; className: string }[] = [
  { id: 'nw', className: 'article-canvas-selection__handle--nw' },
  { id: 'n', className: 'article-canvas-selection__handle--n' },
  { id: 'ne', className: 'article-canvas-selection__handle--ne' },
  { id: 'e', className: 'article-canvas-selection__handle--e' },
  { id: 'se', className: 'article-canvas-selection__handle--se' },
  { id: 's', className: 'article-canvas-selection__handle--s' },
  { id: 'sw', className: 'article-canvas-selection__handle--sw' },
  { id: 'w', className: 'article-canvas-selection__handle--w' },
]

interface ArticleCanvasSelectionProps {
  onDelete: () => void
  onMoveStart: (clientX: number, clientY: number) => void
  onResizeStart: (handle: ResizeHandle, clientX: number, clientY: number) => void
  onRotateStart: (clientX: number, clientY: number) => void
}

export function ArticleCanvasSelection({
  onDelete,
  onMoveStart,
  onResizeStart,
  onRotateStart,
}: ArticleCanvasSelectionProps) {
  const capturePointer = (event: React.PointerEvent) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  return (
    <div className="article-canvas-selection" aria-hidden>
      <div className="article-canvas-selection__box" />

      {(['top', 'right', 'bottom', 'left'] as const).map((edge) => (
        <div
          key={edge}
          className={cn('article-canvas-selection__edge', `article-canvas-selection__edge--${edge}`)}
          onPointerDown={(e) => {
            capturePointer(e)
            onMoveStart(e.clientX, e.clientY)
          }}
        />
      ))}

      {HANDLES.map((handle) => (
        <button
          key={handle.id}
          type="button"
          aria-label={`Resize ${handle.id}`}
          className={cn('article-canvas-selection__handle', handle.className)}
          onPointerDown={(e) => {
            capturePointer(e)
            onResizeStart(handle.id, e.clientX, e.clientY)
          }}
        />
      ))}

      <button
        type="button"
        className="article-canvas-selection__rotate"
        aria-label="Rotate"
        onPointerDown={(e) => {
          capturePointer(e)
          onRotateStart(e.clientX, e.clientY)
        }}
      >
        <RotateCw className="h-3 w-3" strokeWidth={2.25} />
      </button>

      <button
        type="button"
        className="article-canvas-selection__close"
        aria-label="Delete block"
        onPointerDown={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onDelete()
        }}
      >
        <X className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  )
}
