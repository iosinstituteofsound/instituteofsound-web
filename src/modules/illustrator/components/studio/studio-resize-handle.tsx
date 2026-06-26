import { useCallback, useRef } from 'react'
import { cn } from '@/shared/lib/cn'

type StudioResizeHandleProps = {
  edge: 'n' | 'e' | 's' | 'w'
  onDelta: (delta: number) => void
  onStart?: () => void
  onEnd?: () => void
  className?: string
}

const EDGE_CLASS: Record<StudioResizeHandleProps['edge'], string> = {
  n: 'mas-resize-handle--n',
  e: 'mas-resize-handle--e',
  s: 'mas-resize-handle--s',
  w: 'mas-resize-handle--w',
}

export function StudioResizeHandle({ edge, onDelta, onStart, onEnd, className }: StudioResizeHandleProps) {
  const activeRef = useRef(false)
  const lastRef = useRef(0)

  const axis = edge === 'n' || edge === 's' ? 'y' : 'x'

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      activeRef.current = true
      lastRef.current = axis === 'x' ? e.clientX : e.clientY
      onStart?.()
      e.currentTarget.setPointerCapture(e.pointerId)
      e.currentTarget.classList.add('mas-resize-handle--active')
    },
    [axis, onStart],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeRef.current || !e.currentTarget.hasPointerCapture(e.pointerId)) return
      const current = axis === 'x' ? e.clientX : e.clientY
      const delta = current - lastRef.current
      lastRef.current = current

      if (edge === 'e' || edge === 's') onDelta(delta)
      else onDelta(-delta)
    },
    [axis, edge, onDelta],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!activeRef.current) return
      activeRef.current = false
      e.currentTarget.releasePointerCapture(e.pointerId)
      e.currentTarget.classList.remove('mas-resize-handle--active')
      onEnd?.()
    },
    [onEnd],
  )

  return (
    <div
      role="separator"
      aria-orientation={axis === 'x' ? 'vertical' : 'horizontal'}
      className={cn('mas-resize-handle', EDGE_CLASS[edge], className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  )
}
