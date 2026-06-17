export interface ArticleCanvasEffects {
  presetId: string
  intensity: number
  hidden?: boolean
}

export const DEFAULT_ARTICLE_CANVAS_EFFECTS: ArticleCanvasEffects = {
  presetId: '',
  intensity: 100,
}

export function hasCanvasEffects(effects: ArticleCanvasEffects): boolean {
  return Boolean(effects.presetId.trim() && effects.presetId !== 'none')
}
