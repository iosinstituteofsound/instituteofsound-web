import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { messengerCallController } from '@/modules/messenger/lib/messenger-call-controller'
import { useMessengerCallStore } from '@/modules/messenger/store/messenger-call-store'
import type { PipCorner } from '@/modules/messenger/types/call.types'

const PIP_WIDTH = 160
const PIP_HEIGHT = 112
const EDGE_PADDING = 16
const HIDE_THRESHOLD = 48

function cornerToPosition(corner: PipCorner, containerWidth: number, containerHeight: number) {
  const maxX = containerWidth - PIP_WIDTH - EDGE_PADDING
  const maxY = containerHeight - PIP_HEIGHT - EDGE_PADDING
  switch (corner) {
    case 'topLeft':
      return { x: EDGE_PADDING, y: EDGE_PADDING }
    case 'bottomLeft':
      return { x: EDGE_PADDING, y: maxY }
    case 'bottomRight':
      return { x: maxX, y: maxY }
    default:
      return { x: maxX, y: EDGE_PADDING }
  }
}

function nearestCorner(x: number, y: number, containerWidth: number, containerHeight: number): PipCorner {
  const midX = containerWidth / 2
  const midY = containerHeight / 2
  const isLeft = x + PIP_WIDTH / 2 < midX
  const isTop = y + PIP_HEIGHT / 2 < midY
  if (isTop && isLeft) return 'topLeft'
  if (isTop && !isLeft) return 'topRight'
  if (!isTop && isLeft) return 'bottomLeft'
  return 'bottomRight'
}

function isOffScreen(x: number, y: number, containerWidth: number, containerHeight: number): boolean {
  return (
    x < -HIDE_THRESHOLD ||
    y < -HIDE_THRESHOLD ||
    x > containerWidth - PIP_WIDTH + HIDE_THRESHOLD ||
    y > containerHeight - PIP_HEIGHT + HIDE_THRESHOLD
  )
}

export function useCallVideoLayout(containerRef: RefObject<HTMLElement | null>) {
  const pipCorner = useMessengerCallStore((s) => s.pipCorner)
  const isPipHidden = useMessengerCallStore((s) => s.isPipHidden)
  const primaryVideoFeed = useMessengerCallStore((s) => s.primaryVideoFeed)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const dragStart = useRef({ x: 0, y: 0, pointerX: 0, pointerY: 0 })
  const isDragging = useRef(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return undefined
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [containerRef])

  useEffect(() => {
    setDragOffset({ x: 0, y: 0 })
  }, [pipCorner, containerSize.width, containerSize.height])

  const basePosition = cornerToPosition(pipCorner, containerSize.width, containerSize.height)

  const swapVideoFeed = useCallback(() => {
    if (isDragging.current) return
    messengerCallController.swapVideoFeed()
  }, [])

  const setPipCorner = useCallback((corner: PipCorner) => {
    messengerCallController.setPipCorner(corner)
  }, [])

  const setPipHidden = useCallback((hidden: boolean) => {
    messengerCallController.setPipHidden(hidden)
  }, [])

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      isDragging.current = false
      dragStart.current = {
        x: basePosition.x + dragOffset.x,
        y: basePosition.y + dragOffset.y,
        pointerX: event.clientX,
        pointerY: event.clientY,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [basePosition.x, basePosition.y, dragOffset.x, dragOffset.y],
  )

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const deltaX = event.clientX - dragStart.current.pointerX
    const deltaY = event.clientY - dragStart.current.pointerY
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      isDragging.current = true
    }
    setDragOffset({ x: deltaX, y: deltaY })
  }, [])

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const x = dragStart.current.x + (event.clientX - dragStart.current.pointerX)
      const y = dragStart.current.y + (event.clientY - dragStart.current.pointerY)

      if (isOffScreen(x, y, containerSize.width, containerSize.height)) {
        setPipHidden(true)
        setDragOffset({ x: 0, y: 0 })
        isDragging.current = false
        return
      }

      if (isDragging.current) {
        setPipCorner(nearestCorner(x, y, containerSize.width, containerSize.height))
      } else {
        swapVideoFeed()
      }

      setDragOffset({ x: 0, y: 0 })
      isDragging.current = false
    },
    [containerSize.height, containerSize.width, setPipCorner, setPipHidden, swapVideoFeed],
  )

  const pipPosition = {
    left: basePosition.x + dragOffset.x,
    top: basePosition.y + dragOffset.y,
  }

  return {
    primaryVideoFeed,
    isPipHidden,
    pipWidth: PIP_WIDTH,
    pipHeight: PIP_HEIGHT,
    pipPosition,
    pipPointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
    },
    restorePip: () => setPipHidden(false),
  }
}
