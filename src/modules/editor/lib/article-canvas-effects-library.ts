import type { LucideIcon } from 'lucide-react'
import { Aperture, Clapperboard, Newspaper, Palette, Sparkles } from 'lucide-react'

export interface CanvasEffectFilterValues {
  brightness: number
  contrast: number
  saturate: number
  sepia: number
  hueRotate: number
  grayscale: number
}

export interface CanvasEffectOverlay {
  background: string
  mixBlendMode: string
  opacity: number
}

export interface CanvasEffectPreset {
  id: string
  label: string
  description: string
  filter: CanvasEffectFilterValues
  overlay?: CanvasEffectOverlay
}

export interface CanvasEffectCategory {
  id: string
  label: string
  icon: LucideIcon
  presets: CanvasEffectPreset[]
}

export const NEUTRAL_EFFECT_FILTER: CanvasEffectFilterValues = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  sepia: 0,
  hueRotate: 0,
  grayscale: 0,
}

const POLISH: CanvasEffectPreset[] = [
  {
    id: 'studio-clean',
    label: 'Studio Clean',
    description: 'Bright, balanced polish for crisp editorial reads.',
    filter: { brightness: 106, contrast: 108, saturate: 106, sepia: 0, hueRotate: 0, grayscale: 0 },
  },
  {
    id: 'crisp-polish',
    label: 'Crisp Polish',
    description: 'Sharper contrast with subtle color lift.',
    filter: { brightness: 102, contrast: 118, saturate: 112, sepia: 0, hueRotate: 0, grayscale: 0 },
  },
  {
    id: 'soft-matte',
    label: 'Soft Matte',
    description: 'Gentle matte finish — easy on the eyes.',
    filter: { brightness: 108, contrast: 92, saturate: 88, sepia: 0, hueRotate: 0, grayscale: 0 },
  },
  {
    id: 'clarity-boost',
    label: 'Clarity Boost',
    description: 'Punchy contrast for headline-driven layouts.',
    filter: { brightness: 100, contrast: 124, saturate: 110, sepia: 0, hueRotate: 0, grayscale: 0 },
  },
]

const CINEMATIC: CanvasEffectPreset[] = [
  {
    id: 'cinematic-teal',
    label: 'Cinematic Teal',
    description: 'Teal shadows with lifted highlights — film-grade mood.',
    filter: { brightness: 96, contrast: 112, saturate: 88, sepia: 0, hueRotate: -8, grayscale: 0 },
    overlay: {
      background: 'radial-gradient(ellipse at 50% 100%, rgba(14,116,144,0.28), transparent 62%)',
      mixBlendMode: 'soft-light',
      opacity: 0.55,
    },
  },
  {
    id: 'blockbuster',
    label: 'Blockbuster',
    description: 'High-impact contrast and saturated hero energy.',
    filter: { brightness: 94, contrast: 128, saturate: 118, sepia: 0, hueRotate: 0, grayscale: 0 },
  },
  {
    id: 'noir-frame',
    label: 'Noir Frame',
    description: 'Moody monochrome with deep shadows.',
    filter: { brightness: 92, contrast: 132, saturate: 70, sepia: 0, hueRotate: 0, grayscale: 55 },
    overlay: {
      background: 'radial-gradient(circle at 50% 50%, transparent 42%, rgba(0,0,0,0.45) 100%)',
      mixBlendMode: 'multiply',
      opacity: 0.7,
    },
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    description: 'Warm sunset wash for emotional storytelling.',
    filter: { brightness: 106, contrast: 108, saturate: 118, sepia: 18, hueRotate: 8, grayscale: 0 },
    overlay: {
      background: 'linear-gradient(145deg, rgba(251,191,36,0.18), rgba(234,88,12,0.12))',
      mixBlendMode: 'overlay',
      opacity: 0.65,
    },
  },
]

const EDITORIAL: CanvasEffectPreset[] = [
  {
    id: 'magazine-cover',
    label: 'Magazine Cover',
    description: 'Bold cover-story contrast and color pop.',
    filter: { brightness: 102, contrast: 120, saturate: 128, sepia: 0, hueRotate: 0, grayscale: 0 },
  },
  {
    id: 'feature-story',
    label: 'Feature Story',
    description: 'Long-read warmth with refined contrast.',
    filter: { brightness: 104, contrast: 112, saturate: 108, sepia: 10, hueRotate: 4, grayscale: 0 },
  },
  {
    id: 'wire-dispatch',
    label: 'Wire Dispatch',
    description: 'Neutral newsroom clarity — factual and clean.',
    filter: { brightness: 104, contrast: 106, saturate: 96, sepia: 0, hueRotate: 0, grayscale: 0 },
  },
  {
    id: 'high-gloss',
    label: 'High Gloss',
    description: 'Glossy print finish with vivid saturation.',
    filter: { brightness: 100, contrast: 122, saturate: 136, sepia: 0, hueRotate: 0, grayscale: 0 },
  },
]

const VINTAGE: CanvasEffectPreset[] = [
  {
    id: 'newsprint',
    label: 'Newsprint',
    description: 'Muted paper tone with soft ink contrast.',
    filter: { brightness: 108, contrast: 90, saturate: 82, sepia: 28, hueRotate: 0, grayscale: 22 },
  },
  {
    id: 'faded-film',
    label: 'Faded Film',
    description: 'Washed analog fade with nostalgic grain feel.',
    filter: { brightness: 110, contrast: 86, saturate: 78, sepia: 32, hueRotate: 0, grayscale: 0 },
    overlay: {
      background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 3px)',
      mixBlendMode: 'overlay',
      opacity: 0.45,
    },
  },
  {
    id: 'polaroid',
    label: 'Polaroid',
    description: 'Soft vintage warmth with lifted mids.',
    filter: { brightness: 112, contrast: 94, saturate: 92, sepia: 22, hueRotate: 6, grayscale: 0 },
    overlay: {
      background: 'radial-gradient(circle at 50% 35%, rgba(255,250,235,0.2), transparent 58%)',
      mixBlendMode: 'soft-light',
      opacity: 0.6,
    },
  },
  {
    id: 'letterpress',
    label: 'Letterpress',
    description: 'Ink-on-paper texture with restrained tones.',
    filter: { brightness: 104, contrast: 116, saturate: 72, sepia: 12, hueRotate: 0, grayscale: 38 },
  },
]

const CREATIVE: CanvasEffectPreset[] = [
  {
    id: 'neon-pop',
    label: 'Neon Pop',
    description: 'Electric saturation for music and culture pieces.',
    filter: { brightness: 100, contrast: 116, saturate: 152, sepia: 0, hueRotate: 6, grayscale: 0 },
  },
  {
    id: 'cool-indigo',
    label: 'Cool Indigo',
    description: 'Indigo wash — modern review and tech editorial.',
    filter: { brightness: 98, contrast: 110, saturate: 92, sepia: 0, hueRotate: -14, grayscale: 0 },
    overlay: {
      background: 'linear-gradient(160deg, rgba(67,56,202,0.16), rgba(14,165,233,0.1))',
      mixBlendMode: 'color',
      opacity: 0.55,
    },
  },
  {
    id: 'warm-ember',
    label: 'Warm Ember',
    description: 'Amber glow for intimate profiles and essays.',
    filter: { brightness: 104, contrast: 112, saturate: 128, sepia: 16, hueRotate: 10, grayscale: 0 },
    overlay: {
      background: 'radial-gradient(circle at 20% 80%, rgba(234,88,12,0.2), transparent 55%)',
      mixBlendMode: 'overlay',
      opacity: 0.5,
    },
  },
  {
    id: 'duotone-slate',
    label: 'Duotone Slate',
    description: 'Slate duotone for art-forward layouts.',
    filter: { brightness: 98, contrast: 118, saturate: 68, sepia: 8, hueRotate: 0, grayscale: 72 },
    overlay: {
      background: 'linear-gradient(135deg, rgba(30,41,59,0.22), rgba(109,40,217,0.16))',
      mixBlendMode: 'color',
      opacity: 0.62,
    },
  },
]

export const CANVAS_EFFECT_CATEGORIES: CanvasEffectCategory[] = [
  { id: 'polish', label: 'Polish', icon: Sparkles, presets: POLISH },
  { id: 'cinematic', label: 'Cinematic', icon: Clapperboard, presets: CINEMATIC },
  { id: 'editorial', label: 'Editorial', icon: Newspaper, presets: EDITORIAL },
  { id: 'vintage', label: 'Vintage', icon: Aperture, presets: VINTAGE },
  { id: 'creative', label: 'Creative', icon: Palette, presets: CREATIVE },
]

export const CANVAS_EFFECT_PRESETS: CanvasEffectPreset[] = CANVAS_EFFECT_CATEGORIES.flatMap(
  (category) => category.presets,
)

export function findCanvasEffectPreset(presetId: string): CanvasEffectPreset | undefined {
  return CANVAS_EFFECT_PRESETS.find((preset) => preset.id === presetId)
}

export function findCanvasEffectCategory(categoryId: string): CanvasEffectCategory | undefined {
  return CANVAS_EFFECT_CATEGORIES.find((category) => category.id === categoryId)
}

export function getDefaultCanvasEffectCategoryId(): string {
  return CANVAS_EFFECT_CATEGORIES[0]?.id ?? 'polish'
}

function lerpValue(from: number, to: number, intensity: number): number {
  const t = Math.max(0, Math.min(100, intensity)) / 100
  return from + (to - from) * t
}

export function resolveCanvasEffectFilter(
  preset: CanvasEffectPreset,
  intensity: number,
): CanvasEffectFilterValues {
  const neutral = NEUTRAL_EFFECT_FILTER
  const target = preset.filter
  return {
    brightness: lerpValue(neutral.brightness, target.brightness, intensity),
    contrast: lerpValue(neutral.contrast, target.contrast, intensity),
    saturate: lerpValue(neutral.saturate, target.saturate, intensity),
    sepia: lerpValue(neutral.sepia, target.sepia, intensity),
    hueRotate: lerpValue(neutral.hueRotate, target.hueRotate, intensity),
    grayscale: lerpValue(neutral.grayscale, target.grayscale, intensity),
  }
}

export function canvasEffectFilterToCss(filter: CanvasEffectFilterValues): string {
  return [
    `brightness(${filter.brightness}%)`,
    `contrast(${filter.contrast}%)`,
    `saturate(${filter.saturate}%)`,
    `sepia(${filter.sepia}%)`,
    `hue-rotate(${filter.hueRotate}deg)`,
    `grayscale(${filter.grayscale}%)`,
  ].join(' ')
}

export function canvasEffectPresetToFilterCss(presetId: string, intensity: number): string | undefined {
  const preset = findCanvasEffectPreset(presetId)
  if (!preset) return undefined
  return canvasEffectFilterToCss(resolveCanvasEffectFilter(preset, intensity))
}

export function canvasEffectPresetToOverlayStyle(
  presetId: string,
  intensity: number,
): { background: string; mixBlendMode: string; opacity: number } | undefined {
  const preset = findCanvasEffectPreset(presetId)
  if (!preset?.overlay) return undefined
  const t = Math.max(0, Math.min(100, intensity)) / 100
  return {
    background: preset.overlay.background,
    mixBlendMode: preset.overlay.mixBlendMode,
    opacity: preset.overlay.opacity * t,
  }
}
