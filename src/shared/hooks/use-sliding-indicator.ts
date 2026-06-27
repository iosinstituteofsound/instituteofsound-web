import { useLayoutEffect, useState, type RefObject } from 'react'

export type IndicatorStyle = {
  left: number
  top: number
  width: number
  height: number
}

const EMPTY_INDICATOR: IndicatorStyle = { left: 0, top: 0, width: 0, height: 0 }

function measureIndicator(container: HTMLElement, activeKey: string): IndicatorStyle {
  const activeElement = container.querySelector<HTMLElement>(
    `[data-indicator-key="${CSS.escape(activeKey)}"]`,
  )
  if (!activeElement) return EMPTY_INDICATOR

  return {
    left: activeElement.offsetLeft,
    top: activeElement.offsetTop,
    width: activeElement.offsetWidth,
    height: activeElement.offsetHeight,
  }
}

export function useSlidingIndicator(
  containerRef: RefObject<HTMLElement | null>,
  activeKey: string,
  enabled = true,
) {
  const [indicator, setIndicator] = useState<IndicatorStyle>(EMPTY_INDICATOR)

  useLayoutEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    setIndicator(measureIndicator(container, activeKey))
  }, [activeKey, containerRef, enabled])

  useLayoutEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    const update = () => setIndicator(measureIndicator(container, activeKey))

    const observer = new ResizeObserver(update)
    observer.observe(container)
    Array.from(container.querySelectorAll('[data-indicator-key]')).forEach((element) => {
      observer.observe(element)
    })

    container.addEventListener('scroll', update, { passive: true })

    return () => {
      observer.disconnect()
      container.removeEventListener('scroll', update)
    }
  }, [activeKey, containerRef, enabled])

  return indicator
}
