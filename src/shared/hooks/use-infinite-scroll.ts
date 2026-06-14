import { useEffect, useRef, type RefObject } from 'react'

interface UseInfiniteScrollOptions {
  enabled?: boolean
  rootMargin?: string
  threshold?: number
}

export function useInfiniteScroll(
  loadMore: () => void,
  { enabled = true, rootMargin = '240px 0px', threshold = 0 }: UseInfiniteScrollOptions = {},
): RefObject<HTMLDivElement | null> {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadMoreRef = useRef(loadMore)

  loadMoreRef.current = loadMore

  useEffect(() => {
    if (!enabled) return

    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreRef.current()
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [enabled, rootMargin, threshold])

  return sentinelRef
}
