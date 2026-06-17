import type { LucideIcon } from 'lucide-react'
import { Box, Clapperboard, Crown, Layers3, Zap } from 'lucide-react'
import { scaleFilterForIntensity, scaleTextShadowForIntensity } from '@/modules/editor/lib/article-text-2d-effects-library'

export interface Text3dEffectPreset {
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
  transformOrigin?: string
  transformStyle?: 'preserve-3d'
  letterSpacing?: string
  textTransform?: string
  fontWeight?: 'normal' | 'bold'
}

export interface Text3dEffectCategory {
  id: string
  label: string
  icon: LucideIcon
  presets: Text3dEffectPreset[]
}

function extrusionShadows(
  depth: number,
  color: string,
  angleDeg = 135,
  startAlpha = 0.92,
): string[] {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  return Array.from({ length: depth }, (_, i) => {
    const step = i + 1
    const alpha = startAlpha - (i / depth) * 0.55
    const match = color.match(/rgba?\(([^)]+)\)/)
    if (match) {
      const parts = match[1].split(',').map((p) => p.trim())
      if (parts.length === 3) {
        return `${(cos * step).toFixed(1)}px ${(sin * step).toFixed(1)}px 0 rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha.toFixed(2)})`
      }
      if (parts.length === 4) {
        return `${(cos * step).toFixed(1)}px ${(sin * step).toFixed(1)}px 0 rgba(${parts.join(', ')})`
      }
    }
    return `${(cos * step).toFixed(1)}px ${(sin * step).toFixed(1)}px 0 ${color}`
  })
}

function isometricShadows(depth: number, light = '#e2e8f0', dark = '#0f172a'): string[] {
  const shadows: string[] = []
  for (let i = 1; i <= depth; i++) {
    shadows.push(`${i}px ${i}px 0 ${dark}`)
    shadows.push(`${-i}px ${i}px 0 color-mix(in oklch, ${dark} 75%, transparent)`)
  }
  shadows.push(`0 0 12px color-mix(in oklch, ${light} 35%, transparent)`)
  return shadows
}

const DEPTH: Text3dEffectPreset[] = [
  {
    id: 'deep-extrude',
    label: 'Deep Extrude',
    description: 'Massive Z-depth extrusion — hero title punch.',
    fontWeight: 'bold',
    color: '#f8fafc',
    textShadow: [
      ...extrusionShadows(14, 'rgba(15,23,42,1)', 135),
      '0 12px 28px rgba(0,0,0,0.45)',
    ],
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  {
    id: 'block-depth',
    label: 'Block Depth',
    description: 'Solid block extrusion with crisp edges.',
    fontWeight: 'bold',
    textShadow: extrusionShadows(10, 'rgba(30,41,59,0.95)', 120),
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  {
    id: 'tunnel-depth',
    label: 'Tunnel Depth',
    description: 'Infinite tunnel recession into darkness.',
    fontWeight: 'bold',
    color: '#f1f5f9',
    textShadow: [
      ...extrusionShadows(16, 'rgba(15,23,42,0.9)', 90),
      '0 0 40px rgba(15,23,42,0.55)',
    ],
  },
  {
    id: 'stacked-layers',
    label: 'Stacked Layers',
    description: 'Multi-plane stacked depth layers.',
    fontWeight: 'bold',
    textShadow: [
      '1px 1px 0 #64748b',
      '2px 2px 0 #475569',
      '3px 3px 0 #334155',
      '4px 4px 0 #1e293b',
      '5px 5px 0 #0f172a',
      '6px 6px 0 #020617',
      '0 8px 20px rgba(0,0,0,0.5)',
    ],
  },
  {
    id: 'abyss-drop',
    label: 'Abyss Drop',
    description: 'Vertical plunge into deep shadow abyss.',
    fontWeight: 'bold',
    color: '#e2e8f0',
    textShadow: extrusionShadows(12, 'rgba(0,0,0,0.85)', 90),
    transform: 'perspective(500px) rotateX(18deg)',
    transformOrigin: 'center bottom',
  },
  {
    id: 'monolith',
    label: 'Monolith',
    description: 'Stone monolith weight and gravity.',
    fontWeight: 'bold',
    color: '#cbd5e1',
    textShadow: [
      ...extrusionShadows(8, 'rgba(51,65,85,0.9)', 125),
      '0 16px 32px rgba(0,0,0,0.55)',
    ],
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
]

const PERSPECTIVE: Text3dEffectPreset[] = [
  {
    id: 'hero-tilt',
    label: 'Hero Tilt',
    description: 'Forward hero camera tilt — blockbuster poster angle.',
    fontWeight: 'bold',
    color: '#f8fafc',
    textShadow: extrusionShadows(6, 'rgba(0,0,0,0.8)', 135),
    transform: 'perspective(600px) rotateX(22deg)',
    transformOrigin: 'center bottom',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  {
    id: 'low-angle',
    label: 'Low Angle',
    description: 'Dramatic low-angle power shot.',
    fontWeight: 'bold',
    textShadow: [
      ...extrusionShadows(8, 'rgba(15,23,42,0.88)', 140),
      '0 20px 40px rgba(0,0,0,0.4)',
    ],
    transform: 'perspective(500px) rotateX(28deg) scale(1.02)',
    transformOrigin: 'center bottom',
    textTransform: 'uppercase',
  },
  {
    id: 'isometric-3d',
    label: 'Isometric 3D',
    description: 'Clean isometric projection — tech editorial.',
    fontWeight: 'bold',
    color: '#e2e8f0',
    textShadow: isometricShadows(7),
    transform: 'perspective(700px) rotateX(18deg) rotateY(-12deg)',
    transformOrigin: 'center center',
  },
  {
    id: 'floating-tilt',
    label: 'Floating Tilt',
    description: 'Levitating text with soft ground shadow.',
    fontWeight: 'bold',
    color: '#f8fafc',
    textShadow: [
      '0 1px 0 rgba(255,255,255,0.4)',
      ...extrusionShadows(5, 'rgba(30,41,59,0.7)', 135),
      '0 24px 36px rgba(0,0,0,0.35)',
    ],
    transform: 'perspective(550px) rotateX(14deg) translateZ(0)',
    transformOrigin: 'center center',
  },
  {
    id: 'birds-eye',
    label: "Bird's Eye",
    description: 'Top-down perspective depth.',
    fontWeight: 'bold',
    color: '#f1f5f9',
    textShadow: extrusionShadows(9, 'rgba(0,0,0,0.75)', 45),
    transform: 'perspective(600px) rotateX(-16deg)',
    transformOrigin: 'center top',
  },
  {
    id: 'dutch-angle',
    label: 'Dutch Angle',
    description: 'Tension-building dutch tilt with depth.',
    fontWeight: 'bold',
    textShadow: extrusionShadows(7, 'rgba(15,23,42,0.85)', 130),
    transform: 'perspective(500px) rotateX(12deg) rotateZ(-4deg)',
    transformOrigin: 'center center',
  },
]

const CHROME: Text3dEffectPreset[] = [
  {
    id: 'chrome-block',
    label: 'Chrome Block',
    description: 'Polished chrome extrusion — luxury automotive.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(180deg, #fff 0%, #94a3b8 35%, #1e293b 50%, #cbd5e1 100%)',
    backgroundClipText: true,
    textShadow: [
      '0 1px 0 rgba(255,255,255,0.9)',
      ...extrusionShadows(6, 'rgba(15,23,42,0.85)', 135),
      '0 10px 24px rgba(0,0,0,0.45)',
    ],
    filter: 'contrast(1.15) brightness(1.05)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  {
    id: 'gold-monolith',
    label: 'Gold Monolith',
    description: '3D gold bar extrusion — premium awards.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(180deg, #fef3c7, #fbbf24 40%, #b45309 55%, #fde68a)',
    backgroundClipText: true,
    textShadow: [
      '0 1px 0 rgba(255,250,220,0.8)',
      ...extrusionShadows(8, 'rgba(120,53,15,0.9)', 135),
      '0 12px 28px rgba(180,83,9,0.35)',
    ],
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  {
    id: 'silver-edge',
    label: 'Silver Edge',
    description: 'Razor silver edges with cold depth.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(160deg, #f8fafc, #94a3b8, #475569)',
    backgroundClipText: true,
    textShadow: [
      '1px 1px 0 rgba(255,255,255,0.7)',
      ...extrusionShadows(7, 'rgba(30,41,59,0.88)', 130),
    ],
  },
  {
    id: 'glass-prism',
    label: 'Glass Prism',
    description: 'Translucent glass prism refraction depth.',
    fontWeight: 'bold',
    color: 'rgba(248,250,252,0.92)',
    webkitTextStroke: '0.5px rgba(255,255,255,0.5)',
    textShadow: [
      '0 0 12px rgba(186,230,253,0.45)',
      ...extrusionShadows(5, 'rgba(59,130,246,0.35)', 135),
      '0 8px 20px rgba(0,0,0,0.3)',
    ],
    filter: 'brightness(1.08) saturate(1.1)',
    transform: 'perspective(600px) rotateX(10deg)',
    transformOrigin: 'center center',
  },
  {
    id: 'copper-forge',
    label: 'Copper Forge',
    description: 'Forged copper industrial 3D metal.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(180deg, #fed7aa, #ea580c 45%, #7c2d12)',
    backgroundClipText: true,
    textShadow: extrusionShadows(9, 'rgba(67,20,7,0.9)', 135),
    letterSpacing: '0.04em',
  },
  {
    id: 'diamond-facet',
    label: 'Diamond Facet',
    description: 'Faceted gem highlights with sharp depth.',
    fontWeight: 'bold',
    color: '#f8fafc',
    textShadow: [
      '1px 1px 0 rgba(255,255,255,0.95)',
      '-1px -1px 0 rgba(148,163,184,0.5)',
      ...extrusionShadows(6, 'rgba(51,65,85,0.8)', 125),
      '0 0 16px rgba(186,230,253,0.35)',
    ],
    filter: 'contrast(1.2)',
  },
]

const CINEMATIC: Text3dEffectPreset[] = [
  {
    id: 'blockbuster-3d',
    label: 'Blockbuster 3D',
    description: 'Summer blockbuster title extrusion.',
    fontWeight: 'bold',
    color: '#fef3c7',
    webkitTextStroke: '1.5px rgba(0,0,0,0.85)',
    textShadow: [
      ...extrusionShadows(10, 'rgba(0,0,0,0.92)', 135),
      '0 0 24px rgba(251,191,36,0.3)',
    ],
    transform: 'perspective(550px) rotateX(16deg)',
    transformOrigin: 'center bottom',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  {
    id: 'imax-extrude',
    label: 'IMAX Extrude',
    description: 'Giant screen IMAX scale depth.',
    fontWeight: 'bold',
    color: '#f8fafc',
    textShadow: [
      ...extrusionShadows(14, 'rgba(0,0,0,0.9)', 135),
      '0 20px 48px rgba(0,0,0,0.55)',
    ],
    transform: 'perspective(700px) rotateX(20deg) scale(1.03)',
    transformOrigin: 'center bottom',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  {
    id: 'noir-depth',
    label: 'Noir Depth',
    description: 'Film noir hard-shadow extrusion.',
    fontWeight: 'bold',
    color: '#f1f5f9',
    textShadow: extrusionShadows(8, 'rgba(0,0,0,0.95)', 120),
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  {
    id: 'epic-trailer-3d',
    label: 'Epic Trailer 3D',
    description: 'Epic trailer gold depth with camera tilt.',
    fontWeight: 'bold',
    backgroundImage: 'linear-gradient(180deg, #fff7d6, #fbbf24, #92400e)',
    backgroundClipText: true,
    textShadow: [
      ...extrusionShadows(9, 'rgba(69,26,3,0.9)', 135),
      '0 16px 36px rgba(0,0,0,0.5)',
    ],
    transform: 'perspective(600px) rotateX(18deg)',
    transformOrigin: 'center bottom',
    textTransform: 'uppercase',
  },
  {
    id: 'action-impact',
    label: 'Action Impact',
    description: 'High-velocity action title slam depth.',
    fontWeight: 'bold',
    color: '#fef2f2',
    textShadow: [
      ...extrusionShadows(7, 'rgba(127,29,29,0.9)', 140),
      '0 0 20px rgba(239,68,68,0.35)',
      '0 12px 24px rgba(0,0,0,0.5)',
    ],
    transform: 'perspective(500px) rotateX(14deg) skewX(-2deg)',
    transformOrigin: 'center bottom',
    textTransform: 'uppercase',
  },
  {
    id: 'sci-fi-depth',
    label: 'Sci-Fi Depth',
    description: 'Futuristic cyan depth extrusion.',
    fontWeight: 'bold',
    color: '#ecfeff',
    textShadow: [
      ...extrusionShadows(8, 'rgba(8,47,73,0.9)', 135),
      '0 0 18px rgba(34,211,238,0.45)',
      '0 0 36px rgba(59,130,246,0.25)',
    ],
    transform: 'perspective(550px) rotateX(12deg)',
    transformOrigin: 'center center',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
]

const NEON_3D: Text3dEffectPreset[] = [
  {
    id: 'neon-extrude',
    label: 'Neon Extrude',
    description: 'Neon tube 3D extrusion with bloom.',
    fontWeight: 'bold',
    color: '#fdf2f8',
    textShadow: [
      '0 0 8px rgba(236,72,153,0.9)',
      '0 0 20px rgba(236,72,153,0.55)',
      ...extrusionShadows(6, 'rgba(190,24,93,0.85)', 135),
    ],
    letterSpacing: '0.05em',
  },
  {
    id: 'cyber-depth',
    label: 'Cyber Depth',
    description: 'Cyberpunk electric depth stack.',
    fontWeight: 'bold',
    color: '#ecfeff',
    textShadow: [
      '0 0 10px rgba(34,211,238,0.85)',
      ...extrusionShadows(8, 'rgba(30,58,138,0.9)', 130),
      '0 0 32px rgba(59,130,246,0.35)',
    ],
    transform: 'perspective(500px) rotateX(10deg) rotateY(-6deg)',
    transformOrigin: 'center center',
  },
  {
    id: 'plasma-block',
    label: 'Plasma Block',
    description: 'Plasma energy 3D block glow.',
    fontWeight: 'bold',
    color: '#faf5ff',
    textShadow: [
      '0 0 12px rgba(168,85,247,0.7)',
      ...extrusionShadows(7, 'rgba(88,28,135,0.88)', 135),
      '0 0 28px rgba(236,72,153,0.3)',
    ],
    filter: 'brightness(1.1) saturate(1.2)',
  },
  {
    id: 'arcade-3d',
    label: 'Arcade 3D',
    description: 'Retro arcade cabinet 3D lettering.',
    fontWeight: 'bold',
    color: '#fef08a',
    webkitTextStroke: '2px #0f172a',
    textShadow: [
      '3px 3px 0 #ef4444',
      '6px 6px 0 #3b82f6',
      ...extrusionShadows(5, 'rgba(15,23,42,0.9)', 135),
    ],
    transform: 'perspective(500px) rotateX(16deg)',
    transformOrigin: 'center bottom',
    textTransform: 'uppercase',
  },
  {
    id: 'laser-extrude',
    label: 'Laser Extrude',
    description: 'Laser-cut green depth extrusion.',
    fontWeight: 'bold',
    color: '#d1fae5',
    textShadow: [
      '0 0 8px rgba(52,211,153,0.8)',
      ...extrusionShadows(9, 'rgba(6,78,59,0.9)', 135),
    ],
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  {
    id: 'hologram-3d',
    label: 'Hologram 3D',
    description: 'Holographic floating 3D projection.',
    fontWeight: 'bold',
    color: 'rgba(224,242,254,0.9)',
    textShadow: [
      '0 0 10px rgba(56,189,248,0.6)',
      ...extrusionShadows(6, 'rgba(14,116,144,0.55)', 135),
      '0 16px 32px rgba(59,130,246,0.25)',
    ],
    transform: 'perspective(600px) rotateX(8deg)',
    transformOrigin: 'center center',
    filter: 'brightness(1.12) saturate(1.15)',
  },
]

export const TEXT_3D_EFFECT_CATEGORIES: Text3dEffectCategory[] = [
  { id: 'depth', label: 'Depth', icon: Layers3, presets: DEPTH },
  { id: 'perspective', label: 'Perspective', icon: Box, presets: PERSPECTIVE },
  { id: 'chrome', label: 'Chrome', icon: Crown, presets: CHROME },
  { id: 'cinematic', label: 'Cinematic', icon: Clapperboard, presets: CINEMATIC },
  { id: 'neon3d', label: 'Neon 3D', icon: Zap, presets: NEON_3D },
]

export const TEXT_3D_EFFECT_PRESETS: Text3dEffectPreset[] = TEXT_3D_EFFECT_CATEGORIES.flatMap(
  (category) => category.presets,
)

export function findText3dEffectPreset(presetId: string): Text3dEffectPreset | undefined {
  return TEXT_3D_EFFECT_PRESETS.find((preset) => preset.id === presetId)
}

export function getDefaultText3dEffectCategoryId(): string {
  return TEXT_3D_EFFECT_CATEGORIES[0]?.id ?? 'depth'
}

export function text3dEffectPreviewStyle(presetId: string): {
  textShadow?: string
  WebkitTextStroke?: string
  color?: string
  backgroundImage?: string
  filter?: string
  transform?: string
} {
  const preset = findText3dEffectPreset(presetId)
  if (!preset) return {}

  return {
    textShadow: preset.textShadow?.join(', '),
    WebkitTextStroke: preset.webkitTextStroke,
    color: preset.color,
    backgroundImage: preset.backgroundImage,
    filter: preset.filter,
    transform: preset.transform,
  }
}

export function resolveText3dEffectCss(
  preset: Text3dEffectPreset,
  intensity: number,
): {
  textShadow?: string
  WebkitTextStroke?: string
  color?: string
  backgroundImage?: string
  WebkitBackgroundClip?: 'text'
  backgroundClip?: 'text'
  filter?: string
  transform?: string
  transformOrigin?: string
  transformStyle?: 'preserve-3d'
  letterSpacing?: string
  textTransform?: string
  fontWeight?: 'normal' | 'bold'
} {
  const css: ReturnType<typeof resolveText3dEffectCss> = {}

  if (preset.textShadow) {
    const scaled = scaleTextShadowForIntensity(preset.textShadow, intensity)
    if (scaled) css.textShadow = scaled
  }

  if (preset.webkitTextStroke) css.WebkitTextStroke = preset.webkitTextStroke

  if (preset.backgroundImage && preset.backgroundClipText) {
    css.backgroundImage = preset.backgroundImage
    css.WebkitBackgroundClip = 'text'
    css.backgroundClip = 'text'
    css.color = 'transparent'
  } else if (preset.color) {
    css.color = preset.color
  }

  if (preset.filter) {
    const scaled = scaleFilterForIntensity(preset.filter, intensity)
    if (scaled) css.filter = scaled
  }

  if (preset.transform) css.transform = preset.transform
  if (preset.transformOrigin) css.transformOrigin = preset.transformOrigin
  if (preset.transformStyle) css.transformStyle = preset.transformStyle
  if (preset.letterSpacing) css.letterSpacing = preset.letterSpacing
  if (preset.textTransform) css.textTransform = preset.textTransform
  if (preset.fontWeight) css.fontWeight = preset.fontWeight

  return css
}
