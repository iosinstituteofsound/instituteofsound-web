export interface FluidSimulationConfig {
  SIM_RESOLUTION?: number
  DYE_RESOLUTION?: number
  DENSITY_DISSIPATION?: number
  VELOCITY_DISSIPATION?: number
  PRESSURE?: number
  PRESSURE_ITERATIONS?: number
  CURL?: number
  SPLAT_RADIUS?: number
  SPLAT_FORCE?: number
  SHADING?: boolean
  COLORFUL?: boolean
  COLOR_UPDATE_SPEED?: number
  BLOOM?: boolean
  BLOOM_ITERATIONS?: number
  BLOOM_RESOLUTION?: number
  BLOOM_INTENSITY?: number
  BLOOM_THRESHOLD?: number
  BLOOM_SOFT_KNEE?: number
  SUNRAYS?: boolean
  SUNRAYS_RESOLUTION?: number
  SUNRAYS_WEIGHT?: number
  TRANSPARENT?: boolean
  PAUSED?: boolean
  COLOR_HUE_MIN?: number
  COLOR_HUE_MAX?: number
  COLOR_INTENSITY?: number
  INITIAL_SPLAT_COUNT?: number
}

export interface FluidSimulationHandle {
  destroy: () => void
}

export function createWebGLFluidSimulation(
  canvas: HTMLCanvasElement,
  userConfig?: FluidSimulationConfig,
): FluidSimulationHandle
