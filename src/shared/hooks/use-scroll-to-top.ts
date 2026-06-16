import { useCallback, useEffect, useState, type RefObject } from 'react'
import { animateScrollToTop } from '@/shared/lib/animate-scroll-to'

type ScrollTarget = HTMLElement | Window

function resolveScrollTarget(containerRef?: RefObject<HTMLElement | null>): ScrollTarget {
  return containerRef?.current ?? window
}

function getScrollTop(target: ScrollTarget) {
  if (target === window) return window.scrollY
  return (target as HTMLElement).scrollTop
}

export function useScrollToTop({
  containerRef,
  threshold = 320,
  duration = 420,
}: {
  containerRef?: RefObject<HTMLElement | null>
  threshold?: number
  duration?: number
} = {}) {
  const [visible, setVisible] = useState(false)
  const [launching, setLaunching] = useState(false)

  useEffect(() => {
    const target = resolveScrollTarget(containerRef)

    const onScroll = () => {
      const current = resolveScrollTarget(containerRef)
      setVisible(getScrollTop(current) > threshold)
    }

    onScroll()
    target.addEventListener('scroll', onScroll, { passive: true })
    return () => target.removeEventListener('scroll', onScroll)
  }, [containerRef, threshold])

  const scrollToTop = useCallback(() => {
    const target = resolveScrollTarget(containerRef)
    setLaunching(true)
    animateScrollToTop(target === window ? window : target, duration)
    window.setTimeout(() => setLaunching(false), duration + 80)
  }, [containerRef, duration])

  return { visible, launching, scrollToTop }
}
