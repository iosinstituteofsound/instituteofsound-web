export type CanvasBackgroundFit = 'cover' | 'contain' | 'tile'

export interface ArticleCanvasBackground {
  imageUrl: string
  colorToken: string
  customColor: string
  fit: CanvasBackgroundFit
  hidden?: boolean
}

export const DEFAULT_ARTICLE_CANVAS_BACKGROUND: ArticleCanvasBackground = {
  imageUrl: '',
  colorToken: '',
  customColor: '',
  fit: 'cover',
}

export interface ArticleSurfaceToken {
  id: string
  label: string
  cssVar: string
}

/** Theme surface colors for article canvas background */
export const ARTICLE_SURFACE_TOKENS: ArticleSurfaceToken[] = [
  { id: 'background', label: 'Default', cssVar: '--background' },
  { id: 'card', label: 'Card', cssVar: '--card' },
  { id: 'muted', label: 'Muted', cssVar: '--muted' },
  { id: 'primary', label: 'Accent', cssVar: '--primary' },
]

export function surfaceTokenToCss(tokenId: string): string {
  const token = ARTICLE_SURFACE_TOKENS.find((item) => item.id === tokenId)
  return token ? `var(${token.cssVar})` : 'var(--background)'
}

export function hasCustomCanvasBackground(bg: ArticleCanvasBackground): boolean {
  return Boolean(bg.imageUrl.trim() || bg.colorToken.trim() || bg.customColor.trim())
}

export function hasCustomCanvasBackgroundColor(bg: ArticleCanvasBackground): boolean {
  return Boolean(bg.colorToken.trim() || bg.customColor.trim())
}
