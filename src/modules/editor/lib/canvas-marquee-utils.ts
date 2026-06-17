export interface PixelRect {
  left: number
  top: number
  right: number
  bottom: number
}

export function normalizeMarqueeRect(x1: number, y1: number, x2: number, y2: number): PixelRect {
  return {
    left: Math.min(x1, x2),
    top: Math.min(y1, y2),
    right: Math.max(x1, x2),
    bottom: Math.max(y1, y2),
  }
}

export function rectsIntersect(a: PixelRect, b: PixelRect): boolean {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom)
}

export function domRectToPixelRect(rect: DOMRect): PixelRect {
  return {
    left: rect.left,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
  }
}

export function getBlockIdsInMarquee(board: HTMLElement, marquee: PixelRect): string[] {
  const ids: string[] = []
  board.querySelectorAll<HTMLElement>('[data-block-id]').forEach((el) => {
    const blockRect = domRectToPixelRect(el.getBoundingClientRect())
    if (rectsIntersect(blockRect, marquee)) {
      const id = el.dataset.blockId
      if (id) ids.push(id)
    }
  })
  return ids
}

export interface GroupBounds {
  left: number
  top: number
  width: number
  height: number
}

export function computeGroupBounds(board: HTMLElement, blockIds: string[]): GroupBounds | null {
  const boardRect = board.getBoundingClientRect()
  let minLeft = Infinity
  let minTop = Infinity
  let maxRight = -Infinity
  let maxBottom = -Infinity

  for (const blockId of blockIds) {
    const el = board.querySelector<HTMLElement>(`[data-block-id="${blockId}"]`)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    minLeft = Math.min(minLeft, rect.left)
    minTop = Math.min(minTop, rect.top)
    maxRight = Math.max(maxRight, rect.right)
    maxBottom = Math.max(maxBottom, rect.bottom)
  }

  if (minLeft === Infinity) return null

  return {
    left: minLeft - boardRect.left,
    top: minTop - boardRect.top,
    width: maxRight - minLeft,
    height: maxBottom - minTop,
  }
}
