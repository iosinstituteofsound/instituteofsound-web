import { cssFontFamilyForName, systemFontFamilyFromId } from '@/modules/editor/lib/system-font-catalog'

export interface ArticleFontOption {
  id: string
  label: string
  family: string
  category: 'serif' | 'sans' | 'display'
}

export const ARTICLE_FONT_LIBRARY: ArticleFontOption[] = [
  {
    id: 'editorial-serif',
    label: 'Editorial Serif',
    family: 'Georgia, "Times New Roman", serif',
    category: 'serif',
  },
  {
    id: 'classic-serif',
    label: 'Classic Serif',
    family: '"Palatino Linotype", Palatino, serif',
    category: 'serif',
  },
  {
    id: 'inter-sans',
    label: 'Inter Sans',
    family: 'var(--font-sans)',
    category: 'sans',
  },
  {
    id: 'grotesk-sans',
    label: 'Grotesk Sans',
    family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    category: 'sans',
  },
  {
    id: 'mono-code',
    label: 'Mono',
    family: 'var(--font-mono)',
    category: 'display',
  },
  {
    id: 'display-tight',
    label: 'Display Tight',
    family: '"Arial Black", "Helvetica Neue", sans-serif',
    category: 'display',
  },
]

export function getFontLabel(id: string): string {
  const system = systemFontFamilyFromId(id)
  if (system) return system
  return ARTICLE_FONT_LIBRARY.find((font) => font.id === id)?.label ?? id
}

export function resolveFontFamily(id: string): string {
  const system = systemFontFamilyFromId(id)
  if (system) return cssFontFamilyForName(system)
  return ARTICLE_FONT_LIBRARY.find((font) => font.id === id)?.family ?? ARTICLE_FONT_LIBRARY[0]!.family
}
