import type { ResizeHandle } from '@/modules/editor/components/article-canvas-selection'
import type { CanvasBlockLayout } from '@/modules/editor/types/article-canvas.types'

export interface TextResizeResult {
  layout: Partial<CanvasBlockLayout>
  fontSize?: number
}

export function computeTextBlockResize(params: {
  handle: ResizeHandle
  startLayout: CanvasBlockLayout
  startFontSize: number
  dx: number
  dy: number
  preserveAspectRatio: boolean
}): TextResizeResult {
  const { handle, startLayout, startFontSize, dx, dy, preserveAspectRatio } = params

  const isLeft = handle === 'w' || handle === 'nw' || handle === 'sw'
  const isRight = handle === 'e' || handle === 'ne' || handle === 'se'
  const isTop = handle === 'n' || handle === 'nw' || handle === 'ne'
  const isBottom = handle === 's' || handle === 'sw' || handle === 'se'

  let nextX = startLayout.x
  let nextWidth = startLayout.width
  let nextFontSize = startFontSize

  if (isRight) nextWidth = startLayout.width + dx
  if (isLeft) {
    nextWidth = startLayout.width - dx
    nextX = startLayout.x + dx
  }

  if (isTop) nextFontSize = Math.round(startFontSize - dy * 2)
  if (isBottom) nextFontSize = Math.round(startFontSize + dy * 2)

  nextWidth = Math.min(92, Math.max(12, nextWidth))
  nextX = Math.min(90, Math.max(2, nextX))
  nextFontSize = Math.min(400, Math.max(8, nextFontSize))

  if (preserveAspectRatio && startLayout.width > 0 && startFontSize > 0) {
    if (isLeft || isRight) {
      const scale = nextWidth / startLayout.width
      nextFontSize = Math.min(400, Math.max(8, Math.round(startFontSize * scale)))
    } else if (isTop || isBottom) {
      const scale = nextFontSize / startFontSize
      nextWidth = Math.min(92, Math.max(12, Math.round(startLayout.width * scale)))
      nextX = Math.min(90, Math.max(2, startLayout.x + (startLayout.width - nextWidth) / 2))
    }
  }

  const layout: Partial<CanvasBlockLayout> = { x: nextX, width: nextWidth }
  if (isLeft || isRight) layout.sizing = 'fixed'

  const result: TextResizeResult = { layout }
  if (nextFontSize !== startFontSize) {
    result.fontSize = nextFontSize
  }

  return result
}
