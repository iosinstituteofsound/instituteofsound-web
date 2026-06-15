import { useRef, type PointerEvent as ReactPointerEvent } from 'react'

const DRAG_THRESHOLD_PX = 56
const TAP_THRESHOLD_PX = 8

interface UseStoryGesturesOptions {
  onNext: () => void
  onPrevious: () => void
  onTap: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
}

export function useStoryGestures({
  onNext,
  onPrevious,
  onTap,
  onDragStart,
  onDragEnd,
}: UseStoryGesturesOptions) {
  const startX = useRef(0)
  const startY = useRef(0)
  const dragging = useRef(false)

  const resetDrag = () => {
    dragging.current = false
    onDragEnd?.()
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    dragging.current = true
    startX.current = event.clientX
    startY.current = event.clientY
    onDragStart?.()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (_event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return

    const deltaX = event.clientX - startX.current
    const deltaY = event.clientY - startY.current
    const mostlyHorizontal = Math.abs(deltaX) > Math.abs(deltaY)

    if (mostlyHorizontal && deltaX <= -DRAG_THRESHOLD_PX) {
      onNext()
    } else if (mostlyHorizontal && deltaX >= DRAG_THRESHOLD_PX) {
      onPrevious()
    } else if (Math.abs(deltaX) <= TAP_THRESHOLD_PX && Math.abs(deltaY) <= TAP_THRESHOLD_PX) {
      onTap()
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    resetDrag()
  }

  const handlePointerCancel = () => {
    resetDrag()
  }

  return {
    gestureProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
  }
}
