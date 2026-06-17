export interface CanvasArtifactTransform {
  rotate: number
  scale: number
  effectSize: number
  offsetX: number
  offsetY: number
}

export interface ArticleCanvasArtifact {
  categoryId: string
  designId: string
  transform: CanvasArtifactTransform
  hidden?: boolean
  zIndex?: number
}

export const DEFAULT_CANVAS_ARTIFACT_TRANSFORM: CanvasArtifactTransform = {
  rotate: 0,
  scale: 100,
  effectSize: 100,
  offsetX: 0,
  offsetY: 0,
}

export const DEFAULT_ARTICLE_CANVAS_ARTIFACT: ArticleCanvasArtifact = {
  categoryId: '',
  designId: '',
  transform: { ...DEFAULT_CANVAS_ARTIFACT_TRANSFORM },
}

export function hasCanvasArtifact(artifact: ArticleCanvasArtifact): boolean {
  return Boolean(artifact.categoryId.trim() && artifact.designId.trim())
}
