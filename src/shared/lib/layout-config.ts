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
  sm: 'px-0 py-3 md:px-5 md:py-4',
  md: 'px-0 py-4 md:px-6 md:py-7 lg:px-8',
  lg: 'px-0 py-5 md:px-8 md:py-9 lg:px-10',
}

export const MAIN_MAX_WIDTH_CLASS: Record<LayoutConfig['dashboard']['main']['maxWidth'], string> = {
  full: 'max-w-none',
  xl: 'max-w-screen-xl mx-auto w-full',
  '2xl': 'max-w-screen-2xl mx-auto w-full',
}

export const SIDEBAR_WIDTH_CLASS: Record<LayoutConfig['dashboard']['sidebar']['width'], { expanded: string; collapsed: string }> = {
  compact: { expanded: 'w-56', collapsed: 'w-[4.5rem]' },
  default: { expanded: 'w-64', collapsed: 'w-[4.5rem]' },
}

/** Matches centered feed / home column width */
export const FEED_COLUMN_MAX_WIDTH_PX = 680

export const FEED_COLUMN_CLASS = 'feed-page mx-auto w-full max-w-[680px]'
