export interface ArticleColorToken {
  id: string
  label: string
  cssVar: string
}

/** Theme semantic colors only — publish pe article theme inhe use karega */
export const ARTICLE_COLOR_TOKENS: ArticleColorToken[] = [
  { id: 'foreground', label: 'Text', cssVar: '--foreground' },
  { id: 'primary', label: 'Accent', cssVar: '--primary' },
  { id: 'muted-foreground', label: 'Muted', cssVar: '--muted-foreground' },
  { id: 'card-foreground', label: 'Card text', cssVar: '--card-foreground' },
  { id: 'secondary-foreground', label: 'Secondary', cssVar: '--secondary-foreground' },
  { id: 'destructive', label: 'Alert', cssVar: '--destructive' },
]

export function colorTokenToCss(tokenId: string): string {
  const token = ARTICLE_COLOR_TOKENS.find((item) => item.id === tokenId)
  return token ? `var(${token.cssVar})` : 'var(--foreground)'
}
