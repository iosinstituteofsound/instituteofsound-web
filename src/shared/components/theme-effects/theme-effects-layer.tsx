import { LiquidWebGLBackground } from '@/shared/components/theme-effects/liquid-webgl-background'
import { useMyTheme } from '@/shared/hooks/use-badge-theme'
import {
  LIQUID_WEBGL_VARIANT,
  TRANSLUCENT_THEME_SLUG,
} from '@/shared/design-tokens/theme-tokens'

function shouldShowLiquidWebGL(slug?: string, variant?: string) {
  return slug === TRANSLUCENT_THEME_SLUG || variant === LIQUID_WEBGL_VARIANT
}

export function ThemeEffectsLayer() {
  const { data } = useMyTheme()

  const slug = data?.activeTheme?.slug
  const variant = data?.activeTheme?.tokens?.badgeVariant
  const fluidConfig = data?.activeTheme?.tokens?.fluidConfig
  const active = data?.source === 'badge' && shouldShowLiquidWebGL(slug, variant)

  return <LiquidWebGLBackground active={active} fluidConfig={fluidConfig} />
}
