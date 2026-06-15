import { useEffect, useState, type RefObject } from 'react'

function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  if (!node) return null

  let parent = node.parentElement
  while (parent) {
    const { overflowY } = getComputedStyle(parent)
    if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
      return parent
    }
    parent = parent.parentElement
  }

  return document.documentElement
}

function readScrollTop(scrollParent: HTMLElement): number {
  if (scrollParent === document.documentElement) {
    return window.scrollY
  }
  return scrollParent.scrollTop
}

interface UseScrollCollapseOptions {
  /** Scroll distance (px) over which progress goes from 0 → 1 */
  distance?: number
}

export function useScrollCollapse(
  anchorRef: RefObject<HTMLElement | null>,
  { distance = 96 }: UseScrollCollapseOptions = {},
): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return

    const scrollParent = getScrollParent(anchor)
    if (!scrollParent) return

    let frame = 0

    const update = () => {
      frame = 0
      const top = readScrollTop(scrollParent)
      const next = distance <= 0 ? (top > 0 ? 1 : 0) : Math.min(1, Math.max(0, top / distance))
      setProgress((current) => (Math.abs(current - next) < 0.001 ? current : next))
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    scrollParent.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      scrollParent.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [anchorRef, distance])

  return progress
}
