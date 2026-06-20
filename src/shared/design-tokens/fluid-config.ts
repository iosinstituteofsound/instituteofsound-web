import type { FluidSimulationConfig } from '@/shared/components/theme-effects/pavel-fluid-simulation.js'

export interface ThemeFluidConfig {
  simResolution?: number
  dyeResolution?: number
  densityDissipation?: number
  velocityDissipation?: number
  pressure?: number
  pressureIterations?: number
  curl?: number
  splatRadius?: number
  splatForce?: number
  shading?: boolean
  colorful?: boolean
  colorUpdateSpeed?: number
  bloom?: boolean
  bloomIntensity?: number
  bloomThreshold?: number
  sunrays?: boolean
  sunraysWeight?: number
  transparent?: boolean
  /** Fluid dye hue range (0–1 HSV). Violet ≈ 0.72, cyan ≈ 0.55 */
  colorHueMin?: number
  colorHueMax?: number
  /** Dye brightness multiplier — lower = softer ambient background */
  colorIntensity?: number
  /** Gentle ambient blobs on load (0 = none) */
  initialSplatCount?: number
}

export const FLUID_CONFIG_FIELDS: Array<{
  key: keyof ThemeFluidConfig
  label: string
  description: string
  type: 'range' | 'select' | 'switch'
  min?: number
  max?: number
  step?: number
  options?: Array<{ label: string; value: number }>
  group: 'simulation' | 'motion' | 'visual' | 'palette'
}> = [
  {
    key: 'simResolution',
    label: 'Simulation detail',
    description: 'Higher = smoother liquid, uses more GPU',
    type: 'select',
    group: 'simulation',
    options: [
      { label: 'Light (64)', value: 64 },
      { label: 'Balanced (128)', value: 128 },
      { label: 'High (256)', value: 256 },
    ],
  },
  {
    key: 'dyeResolution',
    label: 'Color detail',
    description: 'Sharpness of the fluid colors',
    type: 'select',
    group: 'simulation',
    options: [
      { label: 'Light (512)', value: 512 },
      { label: 'Balanced (1024)', value: 1024 },
    ],
  },
  {
    key: 'pressureIterations',
    label: 'Flow smoothness',
    description: 'How silky the liquid feels when you move the pointer',
    type: 'range',
    min: 8,
    max: 28,
    step: 1,
    group: 'simulation',
  },
  {
    key: 'densityDissipation',
    label: 'Trail length',
    description: 'Lower = longer color trails behind the pointer',
    type: 'range',
    min: 0.96,
    max: 1,
    step: 0.002,
    group: 'motion',
  },
  {
    key: 'velocityDissipation',
    label: 'Motion decay',
    description: 'How quickly liquid stops moving after a swipe',
    type: 'range',
    min: 0.96,
    max: 1,
    step: 0.002,
    group: 'motion',
  },
  {
    key: 'curl',
    label: 'Swirl amount',
    description: 'Gentle eddies vs chaotic turbulence',
    type: 'range',
    min: 0,
    max: 40,
    step: 1,
    group: 'motion',
  },
  {
    key: 'splatRadius',
    label: 'Pointer brush size',
    description: 'How wide the liquid spreads under your cursor',
    type: 'range',
    min: 0.08,
    max: 0.35,
    step: 0.01,
    group: 'motion',
  },
  {
    key: 'splatForce',
    label: 'Pointer push strength',
    description: 'How strongly the liquid reacts to movement',
    type: 'range',
    min: 2000,
    max: 8000,
    step: 200,
    group: 'motion',
  },
  {
    key: 'colorUpdateSpeed',
    label: 'Color drift speed',
    description: 'How fast fluid hues slowly shift over time',
    type: 'range',
    min: 1,
    max: 12,
    step: 1,
    group: 'palette',
  },
  {
    key: 'colorHueMin',
    label: 'Hue range start',
    description: 'Start of the fluid color palette (violet → cyan)',
    type: 'range',
    min: 0.5,
    max: 0.85,
    step: 0.01,
    group: 'palette',
  },
  {
    key: 'colorHueMax',
    label: 'Hue range end',
    description: 'End of the fluid color palette',
    type: 'range',
    min: 0.55,
    max: 0.92,
    step: 0.01,
    group: 'palette',
  },
  {
    key: 'colorIntensity',
    label: 'Color brightness',
    description: 'Keep low so UI text stays readable',
    type: 'range',
    min: 0.04,
    max: 0.2,
    step: 0.01,
    group: 'palette',
  },
  {
    key: 'initialSplatCount',
    label: 'Ambient blobs on load',
    description: 'Soft starter color pools when theme activates',
    type: 'range',
    min: 0,
    max: 6,
    step: 1,
    group: 'palette',
  },
  {
    key: 'bloomIntensity',
    label: 'Glow strength',
    description: 'Soft luminous halo around bright fluid',
    type: 'range',
    min: 0.15,
    max: 1.2,
    step: 0.05,
    group: 'visual',
  },
  {
    key: 'bloomThreshold',
    label: 'Glow threshold',
    description: 'Only the brightest fluid areas glow',
    type: 'range',
    min: 0.4,
    max: 0.9,
    step: 0.05,
    group: 'visual',
  },
  {
    key: 'sunraysWeight',
    label: 'Light rays',
    description: 'Subtle radial rays from fluid highlights',
    type: 'range',
    min: 0.2,
    max: 0.85,
    step: 0.05,
    group: 'visual',
  },
  {
    key: 'shading',
    label: 'Depth shading',
    description: 'Gives the liquid a 3D glossy surface',
    type: 'switch',
    group: 'visual',
  },
  {
    key: 'colorful',
    label: 'Living colors',
    description: 'Fluid hues slowly shift while you use the app',
    type: 'switch',
    group: 'visual',
  },
  {
    key: 'bloom',
    label: 'Bloom glow',
    description: 'Ethereal glow on bright fluid areas',
    type: 'switch',
    group: 'visual',
  },
  {
    key: 'sunrays',
    label: 'Sunrays',
    description: 'Light beams — turn off on slower devices',
    type: 'switch',
    group: 'visual',
  },
  {
    key: 'transparent',
    label: 'Glass UI mode',
    description: 'Let the liquid show through frosted panels',
    type: 'switch',
    group: 'visual',
  },
]

/** Generic defaults — tuned for demo/playground use */
export const DEFAULT_FLUID_CONFIG: ThemeFluidConfig = {
  simResolution: 128,
  dyeResolution: 1024,
  densityDissipation: 0.985,
  velocityDissipation: 0.985,
  pressure: 0.8,
  pressureIterations: 20,
  curl: 28,
  splatRadius: 0.28,
  splatForce: 6500,
  shading: true,
  colorful: true,
  colorUpdateSpeed: 10,
  bloom: true,
  bloomIntensity: 0.8,
  bloomThreshold: 0.6,
  sunrays: true,
  sunraysWeight: 1,
  transparent: true,
  colorHueMin: 0.72,
  colorHueMax: 0.88,
  colorIntensity: 0.15,
  initialSplatCount: 4,
}

/**
 * Translucent theme preset — calm ambient liquid that supports UI readability.
 * Fluid stays in violet→cyan family to match glass tokens.
 */
export const TRANSLUCENT_FLUID_CONFIG: ThemeFluidConfig = {
  simResolution: 128,
  dyeResolution: 512,
  densityDissipation: 0.993,
  velocityDissipation: 0.992,
  pressure: 0.85,
  pressureIterations: 18,
  curl: 16,
  splatRadius: 0.16,
  splatForce: 3800,
  shading: true,
  colorful: true,
  colorUpdateSpeed: 3,
  bloom: true,
  bloomIntensity: 0.42,
  bloomThreshold: 0.78,
  sunrays: true,
  sunraysWeight: 0.48,
  transparent: true,
  colorHueMin: 0.68,
  colorHueMax: 0.82,
  colorIntensity: 0.085,
  initialSplatCount: 2,
}

const FLUID_CONFIG_KEYS = Object.keys(DEFAULT_FLUID_CONFIG) as Array<keyof ThemeFluidConfig>

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function readNumber(value: unknown, fallback: number, min?: number, max?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  if (min !== undefined && max !== undefined) return clampNumber(value, min, max)
  return value
}

function readBoolean(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback
}

export function normalizeFluidConfig(
  raw?: unknown,
  preset: ThemeFluidConfig = DEFAULT_FLUID_CONFIG,
): ThemeFluidConfig {
  const input = (raw ?? {}) as Record<string, unknown>
  const defaults = preset

  const hueMin = readNumber(input.colorHueMin, defaults.colorHueMin!, 0.5, 0.92)
  const hueMax = readNumber(input.colorHueMax, defaults.colorHueMax!, 0.5, 0.92)

  return {
    simResolution: readNumber(input.simResolution, defaults.simResolution!, 32, 256),
    dyeResolution: readNumber(input.dyeResolution, defaults.dyeResolution!, 256, 1024),
    densityDissipation: readNumber(input.densityDissipation, defaults.densityDissipation!, 0.9, 1),
    velocityDissipation: readNumber(input.velocityDissipation, defaults.velocityDissipation!, 0.9, 1),
    pressure: readNumber(input.pressure, defaults.pressure!, 0, 1),
    pressureIterations: readNumber(input.pressureIterations, defaults.pressureIterations!, 5, 30),
    curl: readNumber(input.curl, defaults.curl!, 0, 50),
    splatRadius: readNumber(input.splatRadius, defaults.splatRadius!, 0.05, 0.5),
    splatForce: readNumber(input.splatForce, defaults.splatForce!, 1000, 10000),
    shading: readBoolean(input.shading, defaults.shading!),
    colorful: readBoolean(input.colorful, defaults.colorful!),
    colorUpdateSpeed: readNumber(input.colorUpdateSpeed, defaults.colorUpdateSpeed!, 1, 20),
    bloom: readBoolean(input.bloom, defaults.bloom!),
    bloomIntensity: readNumber(input.bloomIntensity, defaults.bloomIntensity!, 0.1, 2),
    bloomThreshold: readNumber(input.bloomThreshold, defaults.bloomThreshold!, 0, 1),
    sunrays: readBoolean(input.sunrays, defaults.sunrays!),
    sunraysWeight: readNumber(input.sunraysWeight, defaults.sunraysWeight!, 0.3, 1),
    transparent: readBoolean(input.transparent, defaults.transparent!),
    colorHueMin: Math.min(hueMin, hueMax),
    colorHueMax: Math.max(hueMin, hueMax),
    colorIntensity: readNumber(input.colorIntensity, defaults.colorIntensity!, 0.04, 0.2),
    initialSplatCount: readNumber(input.initialSplatCount, defaults.initialSplatCount!, 0, 8),
  }
}

export function cloneFluidConfig(
  config?: ThemeFluidConfig,
  preset?: ThemeFluidConfig,
): ThemeFluidConfig {
  return normalizeFluidConfig(config, preset)
}

export function fluidConfigToSimulationConfig(
  config?: ThemeFluidConfig,
  options?: { isMobile?: boolean; preset?: ThemeFluidConfig },
): FluidSimulationConfig {
  const resolved = normalizeFluidConfig(config, options?.preset)
  const isMobile = options?.isMobile ?? false

  return {
    SIM_RESOLUTION: isMobile ? Math.min(resolved.simResolution!, 64) : resolved.simResolution,
    DYE_RESOLUTION: isMobile ? Math.min(resolved.dyeResolution!, 512) : resolved.dyeResolution,
    DENSITY_DISSIPATION: resolved.densityDissipation,
    VELOCITY_DISSIPATION: resolved.velocityDissipation,
    PRESSURE: resolved.pressure,
    PRESSURE_ITERATIONS: resolved.pressureIterations,
    CURL: resolved.curl,
    SPLAT_RADIUS: resolved.splatRadius,
    SPLAT_FORCE: resolved.splatForce,
    SHADING: resolved.shading,
    COLORFUL: resolved.colorful,
    COLOR_UPDATE_SPEED: resolved.colorUpdateSpeed,
    BLOOM: resolved.bloom,
    BLOOM_INTENSITY: resolved.bloomIntensity,
    BLOOM_THRESHOLD: resolved.bloomThreshold,
    SUNRAYS: isMobile ? false : resolved.sunrays,
    SUNRAYS_WEIGHT: resolved.sunraysWeight,
    TRANSPARENT: resolved.transparent,
    COLOR_HUE_MIN: resolved.colorHueMin,
    COLOR_HUE_MAX: resolved.colorHueMax,
    COLOR_INTENSITY: resolved.colorIntensity,
    INITIAL_SPLAT_COUNT: resolved.initialSplatCount,
  }
}

export function hasFluidConfigOverrides(raw?: unknown) {
  if (!raw || typeof raw !== 'object') return false
  return FLUID_CONFIG_KEYS.some((key) => key in (raw as Record<string, unknown>))
}
