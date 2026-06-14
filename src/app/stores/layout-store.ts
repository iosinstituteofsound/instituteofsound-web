import { create } from 'zustand'
import { DEFAULT_LAYOUT_CONFIG, type LayoutConfig } from '@/shared/types/layout.types'
import { normalizeLayoutConfig } from '@/shared/lib/layout-config'
import type { LayoutSummary } from '@/shared/types/auth.types'

interface LayoutState {
  activeLayout: LayoutSummary | null
  dashboardConfig: LayoutConfig['dashboard']
  publicConfig: LayoutConfig['public']
  hydrateActiveLayout: (layout?: LayoutSummary | null) => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
  activeLayout: null,
  dashboardConfig: DEFAULT_LAYOUT_CONFIG.dashboard,
  publicConfig: DEFAULT_LAYOUT_CONFIG.public,
  hydrateActiveLayout: (layout) => {
    const config = normalizeLayoutConfig(layout?.config)
    set({
      activeLayout: layout ?? null,
      dashboardConfig: config.dashboard,
      publicConfig: layout?.config?.public.enabled ? config.public : DEFAULT_LAYOUT_CONFIG.public,
    })
  },
}))

/** Logged-in users use their role layout's public config; guests use the static default. */
export function resolvePublicConfig(activeLayout: { config?: LayoutConfig } | null | undefined) {
  const activeConfig = normalizeLayoutConfig(activeLayout?.config)
  if (activeLayout && activeConfig.public.enabled) return activeConfig.public
  return DEFAULT_LAYOUT_CONFIG.public
}
