import { DEFAULT_LAYOUT_CONFIG, type LayoutConfig } from '@/shared/types/layout.types'

export function normalizeLayoutConfig(raw: unknown): LayoutConfig {
  const base = DEFAULT_LAYOUT_CONFIG
  if (!raw || typeof raw !== 'object') return base

  const input = raw as Partial<LayoutConfig>
  return {
    dashboard: {
      ...base.dashboard,
      ...(input.dashboard ?? {}),
      header: { ...base.dashboard.header, ...(input.dashboard?.header ?? {}) },
      sidebar: { ...base.dashboard.sidebar, ...(input.dashboard?.sidebar ?? {}) },
      main: { ...base.dashboard.main, ...(input.dashboard?.main ?? {}) },
    },
    public: {
      ...base.public,
      ...(input.public ?? {}),
      header: {
        ...base.public.header,
        ...(input.public?.header ?? {}),
        navLinks: input.public?.header?.navLinks ?? base.public.header.navLinks,
      },
      footer: {
        ...base.public.footer,
        ...(input.public?.footer ?? {}),
        linkGroups: input.public?.footer?.linkGroups ?? base.public.footer.linkGroups,
      },
    },
  }
}

export const MAIN_PADDING_CLASS: Record<LayoutConfig['dashboard']['main']['padding'], string> = {
  none: 'p-0',
  sm: 'px-5 py-4',
  md: 'px-6 py-7 sm:px-8',
  lg: 'px-8 py-9 sm:px-10',
}

export const MAIN_MAX_WIDTH_CLASS: Record<LayoutConfig['dashboard']['main']['maxWidth'], string> = {
  full: 'max-w-none',
  xl: 'max-w-screen-xl mx-auto w-full',
  '2xl': 'max-w-screen-2xl mx-auto w-full',
}

export const SIDEBAR_WIDTH_CLASS: Record<LayoutConfig['dashboard']['sidebar']['width'], { expanded: string; collapsed: string }> = {
  compact: { expanded: 'w-56', collapsed: 'w-14' },
  default: { expanded: 'w-64', collapsed: 'w-16' },
}
