import { useEffect, useMemo, useRef } from 'react'
import { cn } from '@/shared/lib/cn'
import { createWebGLFluidSimulation } from '@/shared/components/theme-effects/pavel-fluid-simulation.js'
import {
  fluidConfigToSimulationConfig,
  TRANSLUCENT_FLUID_CONFIG,
  type ThemeFluidConfig,
} from '@/shared/design-tokens/fluid-config'

interface LiquidWebGLBackgroundProps {
  active?: boolean
  className?: string
  fluidConfig?: ThemeFluidConfig
}

export function LiquidWebGLBackground({
  active = true,
  className,
  fluidConfig,
}: LiquidWebGLBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const configKey = useMemo(() => JSON.stringify(fluidConfig ?? {}), [fluidConfig])

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const isMobile = /Mobi|Android/i.test(navigator.userAgent)
    const simulation = createWebGLFluidSimulation(
      canvas,
      fluidConfigToSimulationConfig(fluidConfig, {
        isMobile,
        preset: TRANSLUCENT_FLUID_CONFIG,
      }),
    )

    return () => {
      simulation.destroy()
    }
  }, [active, configKey])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn('liquid-webgl-bg', className)}
    />
  )
}
