import type { LucideIcon } from 'lucide-react'
import { Clapperboard, Crown, Disc3, Ghost, Zap } from 'lucide-react'

export interface Text2dEffectPreset {
  id: string
  label: string
  description: string
  textShadow?: string[]
  webkitTextStroke?: string
  color?: string
  backgroundImage?: string
  backgroundClipText?: boolean
  filter?: string
  transform?: string
  letterSpacing?: string
  textTransform?: string
  fontWeight?: 'normal' | 'bold'
}

export interface Text2dEffectCategory {
  id: string
  label: string
  icon: LucideIcon
  presets: Text2dEffectPreset[]
}

const CINEMATIC: Text2dEffectPreset[] = [
  {
    id: 'blockbuster',
    label: 'Blockbuster',
    description: 'Heavy outline and deep stacked shadow — global premiere energy.',
    fontWeight: 'bold',
    webkitTextStroke: '2px rgba(0,0,0,0.85)',
    textShadow: [
      '3px 3px 0 rgba(0,0,0,0.9)',
      '6px 6px 0 rgba(0,0,0,0.55)',
      '0 0 24px rgba(255,200,80,0.35)',
    ],
  },
  {
    id: 'epic-trailer',
    label: 'Epic Trailer',
    description: 'Gold gradient fill with cinematic bloom.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(180deg, #fff7d6 0%, #fbbf24 45%, #b45309 100%)',
    backgroundClipText: true,
    textShadow: ['0 0 20px rgba(251,191,36,0.55)', '0 4px 12px rgba(0,0,0,0.65)'],
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  {
    id: 'film-noir',
    label: 'Film Noir',
    description: 'High-contrast monochrome drama with hard offset shadow.',
    fontWeight: 'bold',
    color: '#f8fafc',
    textShadow: ['4px 4px 0 #0f172a', '8px 8px 0 rgba(15,23,42,0.45)'],
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  {
    id: 'anamorphic-flare',
    label: 'Anamorphic Flare',
    description: 'Horizontal lens flare glow — sci-fi blockbuster look.',
    textShadow: [
      '0 0 8px rgba(56,189,248,0.8)',
      '0 0 28px rgba(59,130,246,0.45)',
      '-24px 0 48px rgba(56,189,248,0.28)',
      '24px 0 48px rgba(56,189,248,0.28)',
    ],
    filter: 'brightness(1.08) contrast(1.12)',
  },
  {
    id: 'letterbox-drama',
    label: 'Letterbox Drama',
    description: 'Moody vignette depth with soft cinematic shadow.',
    textShadow: ['0 6px 18px rgba(0,0,0,0.75)', '0 0 40px rgba(0,0,0,0.35)'],
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  {
    id: 'imax-title',
    label: 'IMAX Title',
    description: 'Massive depth long shadow for hero-scale headlines.',
    fontWeight: 'bold',
    textShadow: [
      '2px 2px 0 rgba(0,0,0,0.85)',
      '4px 4px 0 rgba(0,0,0,0.75)',
      '6px 6px 0 rgba(0,0,0,0.65)',
      '8px 8px 0 rgba(0,0,0,0.55)',
      '10px 10px 0 rgba(0,0,0,0.45)',
      '12px 12px 0 rgba(0,0,0,0.35)',
    ],
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  {
    id: 'credit-roll',
    label: 'Credit Roll',
    description: 'Elegant end-credits typography with refined glow.',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    textShadow: ['0 2px 8px rgba(0,0,0,0.45)'],
    color: '#e2e8f0',
  },
  {
    id: 'oscar-night',
    label: 'Oscar Night',
    description: 'Luxurious gold shimmer for award-season polish.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(135deg, #fef3c7, #fbbf24, #fef9c3, #d97706)',
    backgroundClipText: true,
    textShadow: ['0 0 16px rgba(251,191,36,0.5)', '0 2px 6px rgba(0,0,0,0.5)'],
    letterSpacing: '0.06em',
  },
]

const NEON: Text2dEffectPreset[] = [
  {
    id: 'neon-sign',
    label: 'Neon Sign',
    description: 'Classic dual-tone neon tube glow.',
    fontWeight: 'bold',
    color: '#fdf2f8',
    textShadow: [
      '0 0 6px #f472b6',
      '0 0 14px #f472b6',
      '0 0 28px #ec4899',
      '0 0 42px rgba(236,72,153,0.55)',
    ],
    letterSpacing: '0.05em',
  },
  {
    id: 'cyber-pulse',
    label: 'Cyber Pulse',
    description: 'Electric cyan stroke with digital pulse glow.',
    fontWeight: 'bold',
    webkitTextStroke: '1px rgba(34,211,238,0.9)',
    color: '#ecfeff',
    textShadow: ['0 0 8px rgba(34,211,238,0.9)', '0 0 22px rgba(59,130,246,0.65)', '0 0 40px rgba(59,130,246,0.35)'],
    filter: 'brightness(1.1) saturate(1.2)',
  },
  {
    id: 'arcade-retro',
    label: 'Arcade Retro',
    description: '80s arcade purple-pink neon stack.',
    fontWeight: 'bold',
    color: '#faf5ff',
    textShadow: [
      '0 0 6px #c084fc',
      '0 0 16px #a855f7',
      '0 0 32px rgba(168,85,247,0.55)',
      '3px 3px 0 rgba(109,40,217,0.8)',
    ],
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  {
    id: 'vaporwave',
    label: 'Vaporwave',
    description: 'Pink-purple gradient with retro sunset glow.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(90deg, #f472b6, #c084fc, #38bdf8)',
    backgroundClipText: true,
    textShadow: ['0 0 18px rgba(236,72,153,0.55)', '0 4px 0 rgba(109,40,217,0.65)'],
    letterSpacing: '0.06em',
  },
  {
    id: 'electric-outline',
    label: 'Electric Outline',
    description: 'Hollow neon outline with electric edge bloom.',
    fontWeight: 'bold',
    color: 'transparent',
    webkitTextStroke: '2px #22d3ee',
    textShadow: ['0 0 10px rgba(34,211,238,0.85)', '0 0 24px rgba(59,130,246,0.55)'],
  },
  {
    id: 'midnight-neon',
    label: 'Midnight Neon',
    description: 'Deep blue neon bloom for night-city vibes.',
    fontWeight: 'bold',
    color: '#dbeafe',
    textShadow: ['0 0 8px #60a5fa', '0 0 20px #3b82f6', '0 0 36px rgba(37,99,235,0.5)'],
  },
  {
    id: 'hot-neon',
    label: 'Hot Neon',
    description: 'Fiery red-orange neon heat.',
    fontWeight: 'bold',
    color: '#fff7ed',
    textShadow: ['0 0 8px #fb923c', '0 0 18px #f97316', '0 0 32px rgba(239,68,68,0.55)'],
    letterSpacing: '0.04em',
  },
]

const LUXURY: Text2dEffectPreset[] = [
  {
    id: 'gold-foil',
    label: 'Gold Foil',
    description: 'Metallic gold foil with editorial shine.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(145deg, #fef3c7 0%, #fbbf24 35%, #b45309 70%, #fef3c7 100%)',
    backgroundClipText: true,
    textShadow: ['0 1px 0 rgba(255,255,255,0.6)', '0 3px 8px rgba(0,0,0,0.45)'],
    letterSpacing: '0.04em',
  },
  {
    id: 'platinum',
    label: 'Platinum',
    description: 'Cool platinum metallic gradient.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(160deg, #f8fafc, #cbd5e1, #94a3b8, #e2e8f0)',
    backgroundClipText: true,
    textShadow: ['0 2px 6px rgba(0,0,0,0.35)'],
  },
  {
    id: 'champagne',
    label: 'Champagne',
    description: 'Warm champagne gloss for luxury editorials.',
    backgroundImage: 'linear-gradient(180deg, #fffbeb, #fde68a, #fcd34d)',
    backgroundClipText: true,
    textShadow: ['0 2px 8px rgba(180,83,9,0.25)'],
    letterSpacing: '0.06em',
  },
  {
    id: 'editorial-luxe',
    label: 'Editorial Luxe',
    description: 'Refined thin stroke — Vogue-level sophistication.',
    webkitTextStroke: '0.5px rgba(255,255,255,0.65)',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    textShadow: ['0 2px 10px rgba(0,0,0,0.35)'],
  },
  {
    id: 'diamond-cut',
    label: 'Diamond Cut',
    description: 'Sharp crystalline highlights on bold type.',
    fontWeight: 'bold',
    color: '#f8fafc',
    textShadow: [
      '1px 1px 0 rgba(255,255,255,0.9)',
      '-1px -1px 0 rgba(148,163,184,0.45)',
      '0 0 16px rgba(186,230,253,0.45)',
    ],
    filter: 'contrast(1.15) brightness(1.05)',
  },
  {
    id: 'black-tie',
    label: 'Black Tie',
    description: 'Inverted elegance — light stroke on dark fill.',
    fontWeight: 'bold',
    color: '#0f172a',
    webkitTextStroke: '1.5px #f8fafc',
    textShadow: ['0 0 12px rgba(255,255,255,0.25)'],
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
]

const THRILLER: Text2dEffectPreset[] = [
  {
    id: 'horror-title',
    label: 'Horror Title',
    description: 'Distressed blood-red glow for horror posters.',
    fontWeight: 'bold',
    color: '#fef2f2',
    textShadow: ['0 0 10px rgba(239,68,68,0.85)', '0 0 28px rgba(185,28,28,0.55)', '0 4px 12px rgba(0,0,0,0.75)'],
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  {
    id: 'cold-thriller',
    label: 'Cold Thriller',
    description: 'Icy minimal shadow — Scandinavian thriller mood.',
    color: '#e2e8f0',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    textShadow: ['0 2px 0 rgba(15,23,42,0.8)', '0 0 20px rgba(148,163,184,0.25)'],
  },
  {
    id: 'slasher-stroke',
    label: 'Slasher Stroke',
    description: 'Thick crimson outline — slasher poster impact.',
    fontWeight: 'bold',
    color: '#1e1e1e',
    webkitTextStroke: '2.5px #dc2626',
    textShadow: ['0 0 14px rgba(220,38,38,0.65)', '3px 3px 0 rgba(0,0,0,0.85)'],
    textTransform: 'uppercase',
  },
  {
    id: 'dystopian',
    label: 'Dystopian',
    description: 'Glitch skew with toxic green undertone.',
    fontWeight: 'bold',
    color: '#d1fae5',
    transform: 'skewX(-3deg)',
    textShadow: ['2px 0 0 rgba(52,211,153,0.65)', '-2px 0 0 rgba(239,68,68,0.45)'],
    filter: 'contrast(1.2) saturate(0.9)',
  },
  {
    id: 'mystery-noir',
    label: 'Mystery Noir',
    description: 'Deep purple shadow haze for mystery thrillers.',
    color: '#f1f5f9',
    textShadow: ['0 4px 16px rgba(88,28,135,0.55)', '0 0 32px rgba(109,40,217,0.35)'],
    letterSpacing: '0.1em',
  },
  {
    id: 'countdown',
    label: 'Countdown',
    description: 'Stark red warning — ticking-clock tension.',
    fontWeight: 'bold',
    color: '#ef4444',
    textShadow: ['0 0 8px rgba(239,68,68,0.8)', '0 0 20px rgba(239,68,68,0.45)'],
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
  },
]

const RETRO: Text2dEffectPreset[] = [
  {
    id: 'chrome-80s',
    label: 'Chrome 80s',
    description: 'Metallic chrome gradient — retro futurism.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(180deg, #f8fafc 0%, #94a3b8 40%, #1e293b 55%, #cbd5e1 100%)',
    backgroundClipText: true,
    textShadow: ['0 3px 0 rgba(15,23,42,0.65)', '0 0 16px rgba(148,163,184,0.35)'],
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  {
    id: 'disco-fever',
    label: 'Disco Fever',
    description: 'Rainbow gradient glow — dance floor energy.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(90deg, #f472b6, #fbbf24, #34d399, #60a5fa, #c084fc)',
    backgroundClipText: true,
    textShadow: ['0 0 16px rgba(236,72,153,0.45)', '0 0 28px rgba(59,130,246,0.35)'],
    letterSpacing: '0.05em',
  },
  {
    id: 'vintage-poster',
    label: 'Vintage Poster',
    description: 'Warm sepia offset — classic travel poster feel.',
    color: '#fef3c7',
    textShadow: ['3px 3px 0 #92400e', '6px 6px 0 rgba(120,53,15,0.45)'],
    letterSpacing: '0.04em',
    filter: 'sepia(0.25)',
  },
  {
    id: 'western-epic',
    label: 'Western Epic',
    description: 'Dusty embossed western title treatment.',
    fontWeight: 'bold',
    color: '#fcd34d',
    textShadow: [
      '2px 2px 0 #78350f',
      '4px 4px 0 rgba(120,53,15,0.65)',
      '0 0 12px rgba(251,191,36,0.35)',
    ],
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  {
    id: 'golden-hollywood',
    label: 'Golden Hollywood',
    description: 'Classic golden-age depth and warmth.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(180deg, #fff7ed, #fbbf24)',
    backgroundClipText: true,
    textShadow: ['0 4px 0 #92400e', '0 8px 16px rgba(0,0,0,0.45)'],
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  {
    id: 'comic-pop',
    label: 'Comic Pop',
    description: 'Ben-Day offset shadows — pop art punch.',
    fontWeight: 'bold',
    color: '#fef08a',
    webkitTextStroke: '2px #0f172a',
    textShadow: ['4px 4px 0 #ef4444', '8px 8px 0 #3b82f6'],
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
]

export const TEXT_2D_EFFECT_CATEGORIES: Text2dEffectCategory[] = [
  { id: 'cinematic', label: 'Cinematic', icon: Clapperboard, presets: CINEMATIC },
  { id: 'neon', label: 'Neon', icon: Zap, presets: NEON },
  { id: 'luxury', label: 'Luxury', icon: Crown, presets: LUXURY },
  { id: 'thriller', label: 'Thriller', icon: Ghost, presets: THRILLER },
  { id: 'retro', label: 'Retro', icon: Disc3, presets: RETRO },
]

export const TEXT_2D_EFFECT_PRESETS: Text2dEffectPreset[] = TEXT_2D_EFFECT_CATEGORIES.flatMap(
  (category) => category.presets,
)

export function findText2dEffectPreset(presetId: string): Text2dEffectPreset | undefined {
  return TEXT_2D_EFFECT_PRESETS.find((preset) => preset.id === presetId)
}

export function getDefaultText2dEffectCategoryId(): string {
  return TEXT_2D_EFFECT_CATEGORIES[0]?.id ?? 'cinematic'
}

function scaleAlphaInColor(color: string, t: number): string {
  const rgbaMatch = color.match(/rgba?\(([^)]+)\)/)
  if (!rgbaMatch) return color
  const parts = rgbaMatch[1].split(',').map((p) => p.trim())
  if (parts.length === 4) {
    parts[3] = String(Number(parts[3]) * t)
    return `rgba(${parts.join(', ')})`
  }
  return color
}

export function scaleTextShadowForIntensity(shadows: string[], intensity: number): string | undefined {
  const t = Math.max(0, Math.min(100, intensity)) / 100
  if (t <= 0 || shadows.length === 0) return undefined

  const scaled = shadows.map((shadow) => {
    let result = shadow.replace(/(\d+(?:\.\d+)?)px/g, (match, num) => `${Number(num) * t}px`)
    result = result.replace(/rgba?\([^)]+\)/g, (color) => scaleAlphaInColor(color, t))
    return result
  })

  return scaled.join(', ')
}

export function scaleFilterForIntensity(filter: string, intensity: number): string | undefined {
  const t = Math.max(0, Math.min(100, intensity)) / 100
  if (t <= 0) return undefined
  if (t >= 1) return filter

  const brightness = 1 + (parseFilterValue(filter, 'brightness') - 1) * t
  const contrast = 1 + (parseFilterValue(filter, 'contrast') - 1) * t
  const saturate = 1 + (parseFilterValue(filter, 'saturate') - 1) * t
  const sepia = parseFilterValue(filter, 'sepia') * t

  const parts: string[] = []
  if (brightness !== 1) parts.push(`brightness(${brightness})`)
  if (contrast !== 1) parts.push(`contrast(${contrast})`)
  if (saturate !== 1) parts.push(`saturate(${saturate})`)
  if (sepia > 0) parts.push(`sepia(${sepia})`)

  return parts.length ? parts.join(' ') : filter
}

function parseFilterValue(filter: string, name: string): number {
  const match = filter.match(new RegExp(`${name}\\(([^)]+)\\)`))
  if (!match) return name === 'sepia' ? 0 : 1
  const raw = match[1].replace('%', '')
  const num = Number(raw)
  if (!Number.isFinite(num)) return name === 'sepia' ? 0 : 1
  return name === 'sepia' ? num / 100 : num
}

export function text2dEffectPreviewStyle(presetId: string): {
  textShadow?: string
  WebkitTextStroke?: string
  color?: string
  backgroundImage?: string
  filter?: string
} {
  const preset = findText2dEffectPreset(presetId)
  if (!preset) return {}

  return {
    textShadow: preset.textShadow?.join(', '),
    WebkitTextStroke: preset.webkitTextStroke,
    color: preset.color,
    backgroundImage: preset.backgroundImage,
    filter: preset.filter,
  }
}
