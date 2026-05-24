import { ALL_TOOLS } from '@/lib/tools/registry'
import type { NavLink } from '@/types'

const PHASE_SECTION: Record<1 | 2 | 3, string> = {
  1: 'Phase 1 · Creative',
  2: 'Phase 2 · Audio lab',
  3: 'Phase 3 · Theory + writing',
}

/** All toolkit routes for nav — hub + every live tool. */
export function buildToolkitNavLinks(): NavLink[] {
  return [
    {
      label: 'Toolkit Hub',
      href: '/tools',
      group: 'toolkit',
      highlight: true,
    },
    ...ALL_TOOLS.map((tool) => ({
      label: tool.title,
      href: tool.path,
      group: 'toolkit' as const,
      section: PHASE_SECTION[tool.phase],
    })),
  ]
}

export function mergeNavWithToolkit(links: NavLink[]): NavLink[] {
  const rest = links.filter((l) => l.group !== 'toolkit')
  return [...rest, ...buildToolkitNavLinks()]
}
