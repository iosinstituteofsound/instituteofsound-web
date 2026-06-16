import {
  getScrollParent,
  getScrollTop,
  setScrollTop,
  type ScrollContainer,
} from '@/shared/lib/get-scroll-parent'

/** Slow start → fast middle → slow landing. */
function easeInOutCubic(progress: number) {
  return progress < 0.5
    ? 4 * progress ** 3
    : 1 - (-2 * progress + 2) ** 3 / 2
}

function resolveTargetTop(
  element: HTMLElement,
  container: ScrollContainer,
  offset: number,
) {
  if (container === window) {
    return element.getBoundingClientRect().top + window.scrollY - offset
  }

  const containerRect = (container as HTMLElement).getBoundingClientRect()
  return (
    (container as HTMLElement).scrollTop +
    element.getBoundingClientRect().top -
    containerRect.top -
    offset
  )
}

export function animateScrollToElement(
  element: HTMLElement,
  {
    offset = 96,
    duration = 620,
    container,
  }: { offset?: number; duration?: number; container?: ScrollContainer } = {},
) {
  const scrollContainer = container ?? getScrollParent(element)
  const targetTop = resolveTargetTop(element, scrollContainer, offset)
  const start = getScrollTop(scrollContainer)
  const distance = targetTop - start

  if (Math.abs(distance) < 2) return

  const startTime = performance.now()

  const step = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const nextTop = start + distance * easeInOutCubic(progress)

    setScrollTop(scrollContainer, nextTop)

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

export function scrollToSectionId(
  id: string,
  options?: { offset?: number; duration?: number; container?: ScrollContainer },
) {
  const element = document.getElementById(id)
  if (!element) return false
  animateScrollToElement(element, options)
  return true
}
