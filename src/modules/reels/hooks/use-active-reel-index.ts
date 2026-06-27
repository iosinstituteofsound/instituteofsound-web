import { useCallback, useEffect, useRef, useState } from 'react'

interface UseActiveReelIndexOptions {
  itemCount: number
  onNearEnd?: (index: number) => void
  preloadThreshold?: number
}

/** Tracks which reel slide is centered via scroll-snap container intersection. */
export function useActiveReelIndex({
  itemCount,
  onNearEnd,
  preloadThreshold = 3,
}: UseActiveReelIndexOptions) {
  const containerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const setSlideRef = useCallback((index: number, node: HTMLDivElement | null) => {
    slideRefs.current[index] = node
  }, [])

  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, itemCount)
    if (activeIndex >= itemCount && itemCount > 0) {
      setActiveIndex(itemCount - 1)
    }
  }, [activeIndex, itemCount])

  useEffect(() => {
    const container = containerRef.current
    if (!container || itemCount === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = -1
        let bestRatio = 0

        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = slideRefs.current.findIndex((node) => node === entry.target)
          if (index < 0) continue
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio
            bestIndex = index
          }
        }

        if (bestIndex >= 0) {
          setActiveIndex(bestIndex)
          if (onNearEnd && bestIndex >= itemCount - preloadThreshold) {
            onNearEnd(bestIndex)
          }
        }
      },
      { root: container, threshold: [0.5, 0.75, 1] },
    )

    slideRefs.current.forEach((node) => {
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [itemCount, onNearEnd, preloadThreshold])

  const scrollToIndex = useCallback((index: number) => {
    const node = slideRefs.current[index]
    if (!node) return
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const goNext = useCallback(() => {
    if (activeIndex < itemCount - 1) scrollToIndex(activeIndex + 1)
  }, [activeIndex, itemCount, scrollToIndex])

  const goPrev = useCallback(() => {
    if (activeIndex > 0) scrollToIndex(activeIndex - 1)
  }, [activeIndex, scrollToIndex])

  return {
    containerRef,
    setSlideRef,
    activeIndex,
    scrollToIndex,
    goNext,
    goPrev,
    canGoNext: activeIndex < itemCount - 1,
    canGoPrev: activeIndex > 0,
  }
}
