import {
  canvasArtifactFxFilterStyle,
  canvasArtifactFxMeshStyle,
  canvasArtifactFxOverlayStyle,
  readCanvasArtifactFx,
} from '@/modules/editor/lib/canvas-artifact-fx-utils'
import { canvasArtifactToStyle } from '@/modules/editor/lib/canvas-artifact-utils'
import type { ArticleCanvasArtifact } from '@/modules/editor/types/article-canvas-artifact.types'
import { hasCanvasArtifact } from '@/modules/editor/types/article-canvas-artifact.types'
import type { Data } from '@measured/puck'
import { cn } from '@/shared/lib/cn'

interface ArticleCanvasArtifactLayerProps {
  artifact: ArticleCanvasArtifact
  data?: Data
  className?: string
}

export function ArticleCanvasArtifactLayer({ artifact, data, className }: ArticleCanvasArtifactLayerProps) {
  if (!hasCanvasArtifact(artifact) || artifact.hidden) return null

  const fx = data ? readCanvasArtifactFx(data) : { presetId: '', intensity: 100 }
  const patternStyle = canvasArtifactToStyle(artifact)
  const fxFilterStyle = canvasArtifactFxFilterStyle(fx)
  const overlayStyle = canvasArtifactFxOverlayStyle(fx)
  const meshStyle = canvasArtifactFxMeshStyle(fx)

  return (
    <div
      className={cn('article-canvas-artifact-layer pointer-events-none absolute inset-0', className)}
      style={{ zIndex: artifact.zIndex ?? 0 }}
      aria-hidden
    >
      <div
        className="article-canvas-artifact-layer__pattern absolute inset-0"
        style={{ ...patternStyle, ...fxFilterStyle }}
      />
      {overlayStyle.background ? (
        <div
          className="article-canvas-artifact-layer__overlay pointer-events-none absolute inset-0"
          style={overlayStyle}
        />
      ) : null}
      {meshStyle.background ? (
        <div
          className="article-canvas-artifact-layer__mesh pointer-events-none absolute inset-0"
          style={meshStyle}
        />
      ) : null}
    </div>
  )
}
