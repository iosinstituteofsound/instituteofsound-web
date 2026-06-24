import type { ResizeHandle } from '@/modules/editor/components/article-canvas-selection'
import type { CanvasBlockLayout } from '@/modules/editor/types/article-canvas.types'

export interface TextResizeResult {
  layout: Partial<CanvasBlockLayout>
  fontSize?: number
  scaleX?: number
  scaleY?: number
}

const FONT_SIZE_PER_BOARD_PERCENT = 2
const SCALE_PER_BOARD_PERCENT = 2

function clampWidth(width: number): number {
  return Math.min(92, Math.max(12, width))
}

function clampX(x: number): number {
  return Math.min(90, Math.max(2, x))
}

function clampFontSize(fontSize: number): number {
  return Math.min(400, Math.max(8, Math.round(fontSize)))
}

function clampScale(scale: number): number {
  return Math.min(400, Math.max(25, Math.round(scale)))
}

function handleFlags(handle: ResizeHandle) {
  return {
    isLeft: handle === 'w' || handle === 'nw' || handle === 'sw',
    isRight: handle === 'e' || handle === 'ne' || handle === 'se',
    isTop: handle === 'n' || handle === 'nw' || handle === 'ne',
    isBottom: handle === 's' || handle === 'sw' || handle === 'se',
  }
}

export function computeTextBlockResize(params: {
  handle: ResizeHandle
  startLayout: CanvasBlockLayout
  startFontSize: number
  startScaleX: number
  startScaleY: number
  dx: number
  dy: number
  preserveAspectRatio: boolean
}): TextResizeResult {
  const { handle, startLayout, startFontSize, startScaleX, startScaleY, dx, dy, preserveAspectRatio } = params
  const { isLeft, isRight, isTop, isBottom } = handleFlags(handle)

  let nextX = startLayout.x
  let nextWidth = startLayout.width
  let nextFontSize = startFontSize
  let nextScaleX = startScaleX
  let nextScaleY = startScaleY

  if (preserveAspectRatio) {
    const widthAfterDrag = startLayout.width + (isRight ? dx : 0) + (isLeft ? -dx : 0)
    const fontAfterDrag =
      startFontSize +
      (isBottom ? dy * FONT_SIZE_PER_BOARD_PERCENT : 0) +
      (isTop ? -dy * FONT_SIZE_PER_BOARD_PERCENT : 0)

    const scaleW = widthAfterDrag / startLayout.width
    const scaleH = fontAfterDrag / startFontSize

    let uniform = 1
    if ((isLeft || isRight) && (isTop || isBottom)) {
      uniform = Math.abs(scaleW - 1) >= Math.abs(scaleH - 1) ? scaleW : scaleH
    } else if (isLeft || isRight) {
      uniform = scaleW
    } else if (isTop || isBottom) {
      uniform = scaleH
    }

    uniform = Math.max(0.05, uniform)

    nextWidth = clampWidth(startLayout.width * uniform)
    nextFontSize = clampFontSize(startFontSize * uniform)
    nextScaleX = 100
    nextScaleY = 100

    if (isLeft) {
      nextX = clampX(startLayout.x + startLayout.width - nextWidth)
    } else if ((isTop || isBottom) && !isLeft && !isRight) {
      nextX = clampX(startLayout.x + (startLayout.width - nextWidth) / 2)
    } else {
      nextX = clampX(startLayout.x)
    }
  } else {
    if (isRight) nextScaleX = clampScale(startScaleX + dx * SCALE_PER_BOARD_PERCENT)
    if (isLeft) nextScaleX = clampScale(startScaleX - dx * SCALE_PER_BOARD_PERCENT)
    if (isTop) nextScaleY = clampScale(startScaleY - dy * SCALE_PER_BOARD_PERCENT)
    if (isBottom) nextScaleY = clampScale(startScaleY + dy * SCALE_PER_BOARD_PERCENT)
    nextWidth = startLayout.width
    nextX = startLayout.x
  }

  const layout: Partial<CanvasBlockLayout> = { x: nextX, width: nextWidth, sizing: 'fixed' }

  const result: TextResizeResult = { layout }
  if (nextFontSize !== startFontSize) {
    result.fontSize = nextFontSize
  }
  if (nextScaleX !== startScaleX || (preserveAspectRatio && startScaleX !== 100)) {
    result.scaleX = nextScaleX
  }
  if (nextScaleY !== startScaleY || (preserveAspectRatio && startScaleY !== 100)) {
    result.scaleY = nextScaleY
  }

  return result
}
