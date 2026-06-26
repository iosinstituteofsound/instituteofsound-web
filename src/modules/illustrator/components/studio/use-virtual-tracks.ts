import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo } from 'react'

export const TIMELINE_TRACK_HEIGHT = 28
export const TIMELINE_TRACK_PADDING = 8
export const TIMELINE_TRACK_OVERSCAN = 8

export function timelineTrackTop(index: number) {
  return TIMELINE_TRACK_PADDING + index * TIMELINE_TRACK_HEIGHT
}

export function timelineTrackIndexFromY(scrollTop: number, clientY: number, areaTop: number) {
  const y = clientY - areaTop + scrollTop - TIMELINE_TRACK_PADDING
  return Math.max(0, Math.floor(y / TIMELINE_TRACK_HEIGHT))
}

export function timelineTracksTotalHeight(trackCount: number) {
  return Math.max(88, trackCount * TIMELINE_TRACK_HEIGHT + TIMELINE_TRACK_PADDING * 2)
}

export function useVirtualTracks(trackCount: number, scrollElement: HTMLElement | null) {
  const virtualizer = useVirtualizer({
    count: trackCount,
    getScrollElement: () => scrollElement,
    estimateSize: () => TIMELINE_TRACK_HEIGHT,
    overscan: TIMELINE_TRACK_OVERSCAN,
    paddingStart: TIMELINE_TRACK_PADDING,
    paddingEnd: TIMELINE_TRACK_PADDING,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalHeight = useMemo(() => timelineTracksTotalHeight(trackCount), [trackCount])
  const visibleTrackIndices = useMemo(() => new Set(virtualItems.map((item) => item.index)), [virtualItems])

  return {
    virtualizer,
    virtualItems,
    totalHeight,
    visibleTrackIndices,
    scrollTop: virtualizer.scrollOffset,
  }
}
