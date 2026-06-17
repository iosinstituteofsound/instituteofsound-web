import type { LucideIcon } from 'lucide-react'
import { Blend, Grid3x3, Sparkles, Stars, Zap } from 'lucide-react'

export interface ArtifactFxFilterValues {
  brightness: number
  contrast: number
  saturate: number
  blur: number
  dropShadow: string
}

export interface ArtifactFxOverlay {
  background: string
  mixBlendMode: string
  opacity: number
}

export interface ArtifactFxMesh {
  background: string
  backgroundSize?: string
  mixBlendMode?: string
  opacity: number
}

export interface ArtifactFxPreset {
  id: string
  label: string
  description: string
  filter?: Partial<ArtifactFxFilterValues>
  overlay?: ArtifactFxOverlay
  mesh?: ArtifactFxMesh
}

export interface ArtifactFxCategory {
  id: string
  label: string
  icon: LucideIcon
  presets: ArtifactFxPreset[]
}

export const NEUTRAL_ARTIFACT_FX_FILTER: ArtifactFxFilterValues = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  blur: 0,
  dropShadow: 'none',
}

const GLOW: ArtifactFxPreset[] = [
  {
    id: 'soft-glow',
    label: 'Soft Glow',
    description: 'Gentle ambient glow around artifact edges.',
    filter: { brightness: 108, saturate: 112, dropShadow: '0 0 12px rgba(255,255,255,0.45), 0 0 28px rgba(255,255,255,0.18)' },
  },
  {
    id: 'warm-glow',
    label: 'Warm Glow',
    description: 'Amber warmth radiating from the pattern.',
    filter: { brightness: 110, saturate: 125, dropShadow: '0 0 14px rgba(251,191,36,0.55), 0 0 32px rgba(234,88,12,0.28)' },
    overlay: {
      background: 'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.22), transparent 68%)',
      mixBlendMode: 'soft-light',
      opacity: 0.55,
    },
  },
  {
    id: 'heavenly-glow',
    label: 'Heavenly Glow',
    description: 'Divine white-gold radiance with lifted luminance.',
    filter: {
      brightness: 118,
      saturate: 108,
      dropShadow: '0 0 18px rgba(255,250,235,0.7), 0 0 40px rgba(255,215,130,0.35), 0 0 64px rgba(255,200,80,0.15)',
    },
    overlay: {
      background: 'radial-gradient(ellipse at 50% 30%, rgba(255,250,220,0.35), transparent 62%)',
      mixBlendMode: 'overlay',
      opacity: 0.65,
    },
  },
  {
    id: 'celestial',
    label: 'Celestial',
    description: 'Cool celestial bloom with starlight shimmer.',
    filter: {
      brightness: 112,
      saturate: 118,
      dropShadow: '0 0 16px rgba(186,230,253,0.6), 0 0 36px rgba(125,211,252,0.32), 0 0 56px rgba(59,130,246,0.18)',
    },
    overlay: {
      background: 'radial-gradient(circle at 40% 35%, rgba(186,230,253,0.28), transparent 58%), radial-gradient(circle at 70% 65%, rgba(147,197,253,0.18), transparent 52%)',
      mixBlendMode: 'screen',
      opacity: 0.6,
    },
  },
  {
    id: 'neon-bloom',
    label: 'Neon Bloom',
    description: 'Electric neon bloom for high-energy layouts.',
    filter: {
      brightness: 105,
      saturate: 145,
      contrast: 112,
      dropShadow: '0 0 10px rgba(236,72,153,0.65), 0 0 24px rgba(168,85,247,0.45), 0 0 42px rgba(59,130,246,0.28)',
    },
  },
  {
    id: 'holy-light',
    label: 'Holy Light',
    description: 'Radiant beam wash from above.',
    filter: { brightness: 122, saturate: 105, dropShadow: '0 0 20px rgba(255,255,255,0.55), 0 -8px 48px rgba(255,250,220,0.35)' },
    overlay: {
      background: 'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,250,220,0.12) 35%, transparent 70%)',
      mixBlendMode: 'soft-light',
      opacity: 0.7,
    },
  },
  {
    id: 'ember-glow',
    label: 'Ember Glow',
    description: 'Deep ember radiance with fiery undertones.',
    filter: { brightness: 108, saturate: 132, dropShadow: '0 0 14px rgba(239,68,68,0.5), 0 0 30px rgba(234,88,12,0.35)' },
    overlay: {
      background: 'radial-gradient(circle at 50% 80%, rgba(239,68,68,0.22), transparent 58%)',
      mixBlendMode: 'overlay',
      opacity: 0.55,
    },
  },
  {
    id: 'moonlit-glow',
    label: 'Moonlit Glow',
    description: 'Cool silvery moonlight halo.',
    filter: { brightness: 110, saturate: 88, contrast: 108, dropShadow: '0 0 16px rgba(203,213,225,0.55), 0 0 36px rgba(148,163,184,0.28)' },
  },
]

const CELESTIAL: ArtifactFxPreset[] = [
  {
    id: 'starfield',
    label: 'Starfield',
    description: 'Scattered star shimmer across the artifact.',
    filter: { brightness: 112, saturate: 115, dropShadow: '0 0 6px rgba(255,255,255,0.5), 0 0 14px rgba(186,230,253,0.3)' },
    overlay: {
      background:
        'radial-gradient(circle at 12% 18%, rgba(255,255,255,0.85) 0 1px, transparent 1.5px), radial-gradient(circle at 78% 32%, rgba(255,255,255,0.7) 0 1px, transparent 1.5px), radial-gradient(circle at 45% 72%, rgba(186,230,253,0.8) 0 1px, transparent 1.5px), radial-gradient(circle at 88% 85%, rgba(255,255,255,0.6) 0 1px, transparent 1.5px)',
      mixBlendMode: 'screen',
      opacity: 0.75,
    },
  },
  {
    id: 'cosmic-dust',
    label: 'Cosmic Dust',
    description: 'Nebula dust particles with soft color drift.',
    filter: { brightness: 108, saturate: 125, dropShadow: '0 0 20px rgba(139,92,246,0.35)' },
    overlay: {
      background: 'radial-gradient(ellipse at 30% 40%, rgba(139,92,246,0.22), transparent 55%), radial-gradient(ellipse at 75% 60%, rgba(59,130,246,0.18), transparent 50%)',
      mixBlendMode: 'color',
      opacity: 0.62,
    },
  },
  {
    id: 'aurora',
    label: 'Aurora',
    description: 'Northern lights wash with flowing color bands.',
    filter: { brightness: 110, saturate: 130, dropShadow: '0 0 24px rgba(52,211,153,0.28)' },
    overlay: {
      background: 'linear-gradient(125deg, rgba(52,211,153,0.22), rgba(59,130,246,0.18), rgba(168,85,247,0.16))',
      mixBlendMode: 'screen',
      opacity: 0.58,
    },
  },
  {
    id: 'nebula-wash',
    label: 'Nebula Wash',
    description: 'Deep space nebula color diffusion.',
    filter: { brightness: 105, saturate: 138, contrast: 110, dropShadow: '0 0 28px rgba(109,40,217,0.32)' },
    overlay: {
      background: 'radial-gradient(circle at 50% 50%, rgba(109,40,217,0.28), rgba(236,72,153,0.14) 45%, transparent 72%)',
      mixBlendMode: 'soft-light',
      opacity: 0.65,
    },
  },
  {
    id: 'divine-rays',
    label: 'Divine Rays',
    description: 'Radiant light rays emanating from center.',
    filter: { brightness: 115, dropShadow: '0 0 18px rgba(255,250,220,0.4)' },
    overlay: {
      background:
        'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,250,220,0.14) 0deg 8deg, transparent 8deg 18deg)',
      mixBlendMode: 'overlay',
      opacity: 0.55,
    },
  },
  {
    id: 'ethereal-mist',
    label: 'Ethereal Mist',
    description: 'Soft mist veil with luminous drift.',
    filter: { brightness: 114, saturate: 95, blur: 1, dropShadow: '0 0 32px rgba(226,232,240,0.35)' },
    overlay: {
      background: 'radial-gradient(ellipse at 50% 100%, rgba(226,232,240,0.28), transparent 65%)',
      mixBlendMode: 'soft-light',
      opacity: 0.6,
    },
  },
  {
    id: 'supernova',
    label: 'Supernova',
    description: 'Explosive radial burst with intense bloom.',
    filter: {
      brightness: 118,
      saturate: 140,
      contrast: 115,
      dropShadow: '0 0 24px rgba(255,255,255,0.55), 0 0 48px rgba(251,191,36,0.35), 0 0 72px rgba(239,68,68,0.2)',
    },
    overlay: {
      background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.28) 0%, rgba(251,191,36,0.12) 28%, transparent 62%)',
      mixBlendMode: 'screen',
      opacity: 0.7,
    },
  },
]

const MESH: ArtifactFxPreset[] = [
  {
    id: 'grid-mesh',
    label: 'Grid Mesh',
    description: 'Classic wire grid overlay.',
    mesh: {
      background:
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 18px), repeating-linear-gradient(90deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 18px)',
      opacity: 0.65,
    },
  },
  {
    id: 'fine-grid',
    label: 'Fine Grid',
    description: 'Tight high-resolution grid mesh.',
    mesh: {
      background:
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 10px), repeating-linear-gradient(90deg, rgba(255,255,255,0.14) 0 1px, transparent 1px 10px)',
      opacity: 0.55,
    },
  },
  {
    id: 'hex-mesh',
    label: 'Hex Mesh',
    description: 'Honeycomb hexagonal mesh pattern.',
    mesh: {
      background: `url("data:image/svg+xml,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path d="M14 1 L26 8.5 L26 19.5 L14 27 L2 19.5 L2 8.5 Z" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.6"/><path d="M14 1 L14 27 M2 8.5 L26 19.5 M26 8.5 L2 19.5" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.4"/></svg>',
      )}")`,
      backgroundSize: '28px 28px',
      mixBlendMode: 'overlay',
      opacity: 0.7,
    },
  },
  {
    id: 'tri-mesh',
    label: 'Tri Mesh',
    description: 'Triangular tessellation mesh.',
    mesh: {
      background: `url("data:image/svg+xml,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 24 L12 0 L24 24 Z" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/><path d="M0 24 L24 24 M12 0 L12 24" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.4"/></svg>',
      )}")`,
      backgroundSize: '24px 24px',
      mixBlendMode: 'overlay',
      opacity: 0.65,
    },
  },
  {
    id: 'diamond-mesh',
    label: 'Diamond Mesh',
    description: 'Diamond lattice wireframe overlay.',
    mesh: {
      background: `url("data:image/svg+xml,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M0 10 L10 0 L20 10 L10 20 Z" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.5"/></svg>',
      )}")`,
      backgroundSize: '20px 20px',
      mixBlendMode: 'overlay',
      opacity: 0.68,
    },
  },
  {
    id: 'warp-mesh',
    label: 'Warp Mesh',
    description: 'Distorted perspective warp grid.',
    mesh: {
      background: `url("data:image/svg+xml,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M0 20 Q20 8 40 20 M0 20 Q20 32 40 20 M20 0 Q32 20 20 40 M20 0 Q8 20 20 40" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="0.5"/></svg>',
      )}")`,
      backgroundSize: '40px 40px',
      mixBlendMode: 'soft-light',
      opacity: 0.6,
    },
  },
  {
    id: 'circuit-mesh',
    label: 'Circuit Mesh',
    description: 'Tech circuit trace mesh overlay.',
    mesh: {
      background: `url("data:image/svg+xml,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M0 8 H12 V4 H20 V8 H32 M0 24 H10 V20 H22 V24 H32" fill="none" stroke="rgba(96,165,250,0.35)" stroke-width="0.6"/><circle cx="12" cy="8" r="1.5" fill="rgba(96,165,250,0.5)"/><circle cx="20" cy="24" r="1.5" fill="rgba(96,165,250,0.5)"/></svg>',
      )}")`,
      backgroundSize: '32px 32px',
      mixBlendMode: 'screen',
      opacity: 0.72,
    },
  },
  {
    id: 'organic-mesh',
    label: 'Organic Mesh',
    description: 'Flowing organic contour mesh lines.',
    mesh: {
      background: `url("data:image/svg+xml,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M0 24 Q12 8 24 24 T48 24 M0 32 Q16 16 32 32 T64 32" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="0.5"/></svg>',
      )}")`,
      backgroundSize: '48px 48px',
      mixBlendMode: 'overlay',
      opacity: 0.58,
    },
  },
  {
    id: 'radial-mesh',
    label: 'Radial Mesh',
    description: 'Radial spoke mesh emanating from center.',
    mesh: {
      background:
        'repeating-conic-gradient(from 0deg at 50% 50%, rgba(255,255,255,0.14) 0deg 2deg, transparent 2deg 12deg), repeating-radial-gradient(circle at 50% 50%, transparent 0 14px, rgba(255,255,255,0.1) 14px 15px)',
      mixBlendMode: 'overlay',
      opacity: 0.62,
    },
  },
  {
    id: 'isometric-mesh',
    label: 'Isometric Mesh',
    description: '3D isometric cube wireframe mesh.',
    mesh: {
      background: `url("data:image/svg+xml,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><path d="M18 4 L32 12 V24 L18 32 L4 24 V12 Z" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="0.5"/><path d="M18 4 V32 M4 12 L32 24 M32 12 L4 24" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="0.4"/></svg>',
      )}")`,
      backgroundSize: '36px 36px',
      mixBlendMode: 'overlay',
      opacity: 0.68,
    },
  },
]

const ETHEREAL: ArtifactFxPreset[] = [
  {
    id: 'dream-haze',
    label: 'Dream Haze',
    description: 'Soft dreamy haze with gentle blur.',
    filter: { brightness: 112, saturate: 90, blur: 2, dropShadow: '0 0 24px rgba(226,232,240,0.35)' },
    overlay: {
      background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18), transparent 70%)',
      mixBlendMode: 'soft-light',
      opacity: 0.55,
    },
  },
  {
    id: 'phantom-fade',
    label: 'Phantom Fade',
    description: 'Ghostly fade with spectral edges.',
    filter: { brightness: 108, saturate: 75, contrast: 92, blur: 1.5, dropShadow: '0 0 18px rgba(203,213,225,0.4)' },
  },
  {
    id: 'spirit-veil',
    label: 'Spirit Veil',
    description: 'Translucent spirit veil wash.',
    filter: { brightness: 115, saturate: 88, blur: 1 },
    overlay: {
      background: 'linear-gradient(160deg, rgba(255,255,255,0.2), rgba(186,230,253,0.12))',
      mixBlendMode: 'soft-light',
      opacity: 0.5,
    },
  },
  {
    id: 'frost-veil',
    label: 'Frost Veil',
    description: 'Icy frost crystalline overlay.',
    filter: { brightness: 112, saturate: 82, contrast: 108, dropShadow: '0 0 16px rgba(186,230,253,0.35)' },
    overlay: {
      background: 'linear-gradient(180deg, rgba(224,242,254,0.22), transparent 60%)',
      mixBlendMode: 'overlay',
      opacity: 0.55,
    },
  },
  {
    id: 'sacred-aura',
    label: 'Sacred Aura',
    description: 'Sacred golden aura with soft bloom.',
    filter: { brightness: 116, saturate: 110, dropShadow: '0 0 20px rgba(255,215,130,0.45), 0 0 40px rgba(255,200,80,0.2)' },
    overlay: {
      background: 'radial-gradient(circle at 50% 50%, rgba(255,215,130,0.2), transparent 65%)',
      mixBlendMode: 'overlay',
      opacity: 0.6,
    },
  },
  {
    id: 'void-shimmer',
    label: 'Void Shimmer',
    description: 'Dark void shimmer with subtle edge light.',
    filter: { brightness: 95, contrast: 118, saturate: 110, dropShadow: '0 0 14px rgba(139,92,246,0.4)' },
    overlay: {
      background: 'radial-gradient(circle at 50% 50%, rgba(109,40,217,0.18), transparent 68%)',
      mixBlendMode: 'color',
      opacity: 0.5,
    },
  },
]

const ENERGY: ArtifactFxPreset[] = [
  {
    id: 'plasma-surge',
    label: 'Plasma Surge',
    description: 'High-energy plasma pulse glow.',
    filter: {
      brightness: 108,
      saturate: 150,
      contrast: 115,
      dropShadow: '0 0 12px rgba(168,85,247,0.6), 0 0 28px rgba(59,130,246,0.4), 0 0 44px rgba(236,72,153,0.28)',
    },
  },
  {
    id: 'electric-pulse',
    label: 'Electric Pulse',
    description: 'Sharp electric cyan pulse edges.',
    filter: { brightness: 105, saturate: 135, dropShadow: '0 0 8px rgba(34,211,238,0.7), 0 0 20px rgba(59,130,246,0.45)' },
    mesh: {
      background: `url("data:image/svg+xml,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M4 12 L8 8 L6 14 H10 L8 20 L16 10 L12 14 H16 Z" fill="none" stroke="rgba(34,211,238,0.35)" stroke-width="0.5"/></svg>',
      )}")`,
      backgroundSize: '24px 24px',
      mixBlendMode: 'screen',
      opacity: 0.45,
    },
  },
  {
    id: 'solar-flare',
    label: 'Solar Flare',
    description: 'Intense solar flare radiance.',
    filter: { brightness: 120, saturate: 128, dropShadow: '0 0 24px rgba(251,191,36,0.55), 0 0 48px rgba(239,68,68,0.28)' },
    overlay: {
      background: 'radial-gradient(circle at 50% 40%, rgba(251,191,36,0.3), transparent 58%)',
      mixBlendMode: 'overlay',
      opacity: 0.65,
    },
  },
  {
    id: 'laser-grid',
    label: 'Laser Grid',
    description: 'Neon laser grid energy field.',
    filter: { brightness: 102, saturate: 140, dropShadow: '0 0 10px rgba(52,211,153,0.5)' },
    mesh: {
      background:
        'repeating-linear-gradient(0deg, rgba(52,211,153,0.25) 0 1px, transparent 1px 16px), repeating-linear-gradient(90deg, rgba(52,211,153,0.25) 0 1px, transparent 1px 16px)',
      mixBlendMode: 'screen',
      opacity: 0.55,
    },
  },
  {
    id: 'quantum-field',
    label: 'Quantum Field',
    description: 'Quantum particle field shimmer.',
    filter: { brightness: 110, saturate: 125, dropShadow: '0 0 16px rgba(139,92,246,0.4)' },
    overlay: {
      background:
        'radial-gradient(circle at 20% 30%, rgba(139,92,246,0.2) 0 2px, transparent 3px), radial-gradient(circle at 70% 55%, rgba(59,130,246,0.18) 0 2px, transparent 3px), radial-gradient(circle at 45% 80%, rgba(236,72,153,0.15) 0 2px, transparent 3px)',
      mixBlendMode: 'screen',
      opacity: 0.7,
    },
  },
  {
    id: 'arc-lightning',
    label: 'Arc Lightning',
    description: 'Crackling arc lightning edges.',
    filter: { brightness: 108, saturate: 130, contrast: 118, dropShadow: '0 0 6px rgba(255,255,255,0.7), 0 0 16px rgba(186,230,253,0.5), 0 0 28px rgba(59,130,246,0.35)' },
  },
]

export const ARTIFACT_FX_CATEGORIES: ArtifactFxCategory[] = [
  { id: 'glow', label: 'Glow', icon: Sparkles, presets: GLOW },
  { id: 'celestial', label: 'Celestial', icon: Stars, presets: CELESTIAL },
  { id: 'mesh', label: 'Mesh', icon: Grid3x3, presets: MESH },
  { id: 'ethereal', label: 'Ethereal', icon: Blend, presets: ETHEREAL },
  { id: 'energy', label: 'Energy', icon: Zap, presets: ENERGY },
]

export const ARTIFACT_FX_PRESETS: ArtifactFxPreset[] = ARTIFACT_FX_CATEGORIES.flatMap(
  (category) => category.presets,
)

export function findArtifactFxPreset(presetId: string): ArtifactFxPreset | undefined {
  return ARTIFACT_FX_PRESETS.find((preset) => preset.id === presetId)
}

export function findArtifactFxCategory(categoryId: string): ArtifactFxCategory | undefined {
  return ARTIFACT_FX_CATEGORIES.find((category) => category.id === categoryId)
}

export function getDefaultArtifactFxCategoryId(): string {
  return ARTIFACT_FX_CATEGORIES[0]?.id ?? 'glow'
}

function lerpValue(from: number, to: number, intensity: number): number {
  const t = Math.max(0, Math.min(100, intensity)) / 100
  return from + (to - from) * t
}

export function resolveArtifactFxFilter(
  preset: ArtifactFxPreset,
  intensity: number,
): ArtifactFxFilterValues {
  const neutral = NEUTRAL_ARTIFACT_FX_FILTER
  const target = preset.filter ?? {}
  return {
    brightness: lerpValue(neutral.brightness, target.brightness ?? neutral.brightness, intensity),
    contrast: lerpValue(neutral.contrast, target.contrast ?? neutral.contrast, intensity),
    saturate: lerpValue(neutral.saturate, target.saturate ?? neutral.saturate, intensity),
    blur: lerpValue(neutral.blur, target.blur ?? neutral.blur, intensity),
    dropShadow:
      intensity > 0 && target.dropShadow
        ? target.dropShadow
        : neutral.dropShadow,
  }
}

export function artifactFxFilterToCss(filter: ArtifactFxFilterValues): string {
  const parts: string[] = []
  if (filter.brightness !== 100) parts.push(`brightness(${filter.brightness}%)`)
  if (filter.contrast !== 100) parts.push(`contrast(${filter.contrast}%)`)
  if (filter.saturate !== 100) parts.push(`saturate(${filter.saturate}%)`)
  if (filter.blur > 0) parts.push(`blur(${filter.blur}px)`)
  if (filter.dropShadow && filter.dropShadow !== 'none') {
    const shadows = filter.dropShadow.split(/,(?![^(]*\))/)
    for (const shadow of shadows) {
      const trimmed = shadow.trim()
      if (trimmed) parts.push(`drop-shadow(${trimmed})`)
    }
  }
  return parts.length ? parts.join(' ') : 'none'
}

export function artifactFxPresetToOverlayStyle(
  presetId: string,
  intensity: number,
): { background: string; mixBlendMode: string; opacity: number } | undefined {
  const preset = findArtifactFxPreset(presetId)
  if (!preset?.overlay) return undefined
  const t = Math.max(0, Math.min(100, intensity)) / 100
  return {
    background: preset.overlay.background,
    mixBlendMode: preset.overlay.mixBlendMode,
    opacity: preset.overlay.opacity * t,
  }
}

export function artifactFxPresetToMeshStyle(
  presetId: string,
  intensity: number,
): { background: string; backgroundSize?: string; mixBlendMode?: string; opacity: number } | undefined {
  const preset = findArtifactFxPreset(presetId)
  if (!preset?.mesh) return undefined
  const t = Math.max(0, Math.min(100, intensity)) / 100
  return {
    background: preset.mesh.background,
    backgroundSize: preset.mesh.backgroundSize,
    mixBlendMode: preset.mesh.mixBlendMode,
    opacity: preset.mesh.opacity * t,
  }
}

export function artifactFxPreviewThumbStyle(presetId: string): { filter?: string; background?: string } {
  const preset = findArtifactFxPreset(presetId)
  if (!preset) return {}
  const filter = resolveArtifactFxFilter(preset, 100)
  const cssFilter = artifactFxFilterToCss(filter)
  const overlay = preset.overlay
  return {
    filter: cssFilter !== 'none' ? cssFilter : undefined,
    background: overlay?.background,
  }
}
