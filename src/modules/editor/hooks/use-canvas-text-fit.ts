import { useLayoutEffect, useMemo, useState } from 'react'
import {
  getBlockTextSample,
  measureTextInk,
  primaryFontFamilyForMeasure,
} from '@/modules/editor/lib/canvas-text-metrics'
import type { CanvasBlockStyle } from '@/modules/editor/types/article-canvas.types'

export function useCanvasTextFit(
  type: string,
  props: Record<string, unknown>,
  style: CanvasBlockStyle,
  enabled: boolean,
) {
  const text = getBlockTextSample(type, props)
  const [fontRevision, setFontRevision] = useState(0)

  useLayoutEffect(() => {
    if (!enabled || typeof document === 'undefined') return

    let cancelled = false
    const family = primaryFontFamilyForMeasure(style.fontFamilyId)
    const spec = `${style.fontStyle} ${style.fontWeight} ${style.fontSize}px "${family}"`

    document.fonts?.load(spec).then(() => {
      if (!cancelled) setFontRevision((value) => value + 1)
    })

    return () => {
      cancelled = true
    }
  }, [enabled, style.fontFamilyId, style.fontSize, style.fontWeight, style.fontStyle])

  return useMemo(() => {
    if (!enabled) return null
    return measureTextInk(
      text,
      style.fontSize,
      style.fontWeight,
      style.fontStyle,
      style.fontFamilyId,
    )
  }, [
    enabled,
    text,
    style.fontSize,
    style.fontWeight,
    style.fontStyle,
    style.fontFamilyId,
    fontRevision,
  ])
}
