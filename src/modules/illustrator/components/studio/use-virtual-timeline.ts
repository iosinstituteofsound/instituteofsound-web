import { useCallback, useEffect, useMemo, useState } from 'react'

const DEFAULT_PIXELS_PER_FRAME = 3
const DEFAULT_TOTAL_FRAMES = 100_000

export function useVirtualTimeline(totalFrames = DEFAULT_TOTAL_FRAMES, pixelsPerFrame = DEFAULT_PIXELS_PER_FRAME) {
  const [trackEl, setTrackEl] = useState<HTMLDivElement | null>(null)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(960)

  const contentWidth = Math.max(viewportWidth, totalFrames * pixelsPerFrame)

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollLeft / pixelsPerFrame) - 4)
    const count = Math.ceil(viewportWidth / pixelsPerFrame) + 8
    const end = Math.min(totalFrames - 1, start + count)
    return { start, end }
  }, [pixelsPerFrame, scrollLeft, totalFrames, viewportWidth])

  const onTrackScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(event.currentTarget.scrollLeft)
  }, [])

  useEffect(() => {
    if (!trackEl) return
    const measure = () => setViewportWidth(trackEl.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(trackEl)
    return () => observer.disconnect()
  }, [trackEl])

  const frameToX = useCallback((frame: number) => frame * pixelsPerFrame, [pixelsPerFrame])

  const xToFrame = useCallback(
    (x: number) => Math.max(0, Math.min(totalFrames - 1, Math.round(x / pixelsPerFrame))),
    [pixelsPerFrame, totalFrames],
  )

  return {
    setTrackEl,
    onTrackScroll,
    scrollLeft,
    contentWidth,
    pixelsPerFrame,
    totalFrames,
    visibleRange,
    frameToX,
    xToFrame,
  }
}
