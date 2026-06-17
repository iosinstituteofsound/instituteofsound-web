import {
  canvasEffectsOverlayStyle,
} from '@/modules/editor/lib/canvas-effects-utils'
import type { ArticleCanvasEffects } from '@/modules/editor/types/article-canvas-effects.types'
import { hasCanvasEffects } from '@/modules/editor/types/article-canvas-effects.types'
import { cn } from '@/shared/lib/cn'

interface ArticleCanvasEffectsOverlayProps {
  effects: ArticleCanvasEffects
  className?: string
}

export function ArticleCanvasEffectsOverlay({ effects, className }: ArticleCanvasEffectsOverlayProps) {
  if (!hasCanvasEffects(effects) || effects.hidden) return null
  const style = canvasEffectsOverlayStyle(effects)
  if (!style.background) return null

  return (
    <div
      className={cn('article-canvas-effects-overlay pointer-events-none absolute inset-0 z-[2]', className)}
      style={style}
      aria-hidden
    />
  )
}
