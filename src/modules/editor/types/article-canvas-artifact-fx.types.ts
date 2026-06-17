export interface ArticleCanvasArtifactFx {
  presetId: string
  intensity: number
  hidden?: boolean
}

export const DEFAULT_ARTICLE_CANVAS_ARTIFACT_FX: ArticleCanvasArtifactFx = {
  presetId: '',
  intensity: 100,
}

export function hasCanvasArtifactFx(fx: ArticleCanvasArtifactFx): boolean {
  return Boolean(fx.presetId.trim() && fx.presetId !== 'none')
}
