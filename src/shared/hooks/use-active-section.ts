import { useEffect, useRef, useState } from 'react'
import {
  resolveScrollContainerForIds,
  type ScrollContainer,
} from '@/shared/lib/get-scroll-parent'

export function useActiveSection(
  sectionIds: string[],
  {
    offsetRatio = 0.35,
    offsetPx,
    disabled = false,
  }: {
    /** Viewport height fraction used as the active-section line (0–1). */
    offsetRatio?: number
    /** Fixed pixel offset from top (takes precedence over offsetRatio). */
    offsetPx?: number
    disabled?: boolean
  } = {},
) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null)
  const lockedIdRef = useRef<string | null>(null)
  const lockTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (disabled || sectionIds.length === 0) {
      setActiveId(null)
      return
    }

    const resolveActive = () => {
      if (lockedIdRef.current) {
        setActiveId(lockedIdRef.current)
        return
      }

      const offset = offsetPx ?? window.innerHeight * offsetRatio
      let current = sectionIds[0] ?? null

      for (const id of sectionIds) {
        const element = document.getElementById(id)
        if (!element) continue
        if (element.getBoundingClientRect().top <= offset) {
          current = id
        }
      }

      setActiveId(current)
    }

    const containers = new Set<ScrollContainer>()
    const onScroll = () => resolveActive()

    const bindContainers = () => {
      const primary = resolveScrollContainerForIds(sectionIds)
      if (!containers.has(primary)) {
        primary.addEventListener('scroll', onScroll, { passive: true })
        containers.add(primary)
      }

      if (primary !== window && !containers.has(window)) {
        window.addEventListener('scroll', onScroll, { passive: true })
        containers.add(window)
      }
    }

    bindContainers()
    resolveActive()
    window.addEventListener('resize', resolveActive)

    return () => {
      for (const container of containers) {
        container.removeEventListener('scroll', onScroll)
      }
      window.removeEventListener('resize', resolveActive)
    }
  }, [disabled, offsetPx, offsetRatio, sectionIds.join('|')])

  const lockActive = (id: string, durationMs = 720) => {
    lockedIdRef.current = id
    setActiveId(id)

    if (lockTimerRef.current) {
      window.clearTimeout(lockTimerRef.current)
    }

    lockTimerRef.current = window.setTimeout(() => {
      lockedIdRef.current = null
      lockTimerRef.current = null
    }, durationMs)
  }

  useEffect(() => {
    return () => {
      if (lockTimerRef.current) {
        window.clearTimeout(lockTimerRef.current)
      }
    }
  }, [])

  return { activeId, lockActive }
}
