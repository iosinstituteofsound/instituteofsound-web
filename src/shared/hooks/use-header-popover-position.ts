import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react'

export type HeaderPopoverPositionOptions = {
  width?: number
  maxHeight?: number
  gap?: number
  minHeight?: number
  viewportPadding?: number
}

export function useHeaderPopoverPosition(
  open: boolean,
  triggerRef: RefObject<HTMLButtonElement | null>,
  {
    width = 360,
    maxHeight = 560,
    gap = 8,
    minHeight = 200,
    viewportPadding = 12,
  }: HeaderPopoverPositionOptions = {},
) {
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({})

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return

    const updatePosition = () => {
      const rect = triggerRef.current!.getBoundingClientRect()
      const panelWidth = Math.min(width, window.innerWidth - viewportPadding * 2)
      const right = Math.max(viewportPadding, window.innerWidth - rect.right)
      const top = rect.bottom + gap
      const availableHeight = window.innerHeight - top - viewportPadding

      setPanelStyle({
        top,
        right,
        width: panelWidth,
        maxHeight: Math.max(minHeight, Math.min(maxHeight, availableHeight)),
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [gap, maxHeight, minHeight, open, triggerRef, viewportPadding, width])

  return panelStyle
}
