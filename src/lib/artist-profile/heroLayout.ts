export type HeroLayout = 'full' | 'split' | 'logo' | 'compact'

export const DEFAULT_HERO_LAYOUT: HeroLayout = 'full'

export const HERO_LAYOUT_PRESETS: {
  id: HeroLayout
  label: string
  description: string
}[] = [
  {
    id: 'full',
    label: 'Cinematic full',
    description: 'Full-screen banner or video — name + portrait (default).',
  },
  {
    id: 'split',
    label: 'Split stage',
    description: 'Editorial split — copy left, large portrait right.',
  },
  {
    id: 'logo',
    label: 'Logo mark',
    description: 'Logo or avatar as the hero — minimal type, brand-first.',
  },
  {
    id: 'compact',
    label: 'Compact strip',
    description: 'Shorter hero — fast scan, more content above the fold.',
  },
]

export function isValidHeroLayout(value: string): value is HeroLayout {
  return HERO_LAYOUT_PRESETS.some((p) => p.id === value)
}

export function resolveHeroLayout(layout?: string | null): HeroLayout {
  if (layout && isValidHeroLayout(layout)) return layout
  return DEFAULT_HERO_LAYOUT
}

export function heroLayoutClass(layout: HeroLayout): string {
  return `artist-site-hero-layout-${layout}`
}
