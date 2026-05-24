import type { NavGroupId, NavLink } from '@/types'

export const NAV_GROUP_ORDER: NavGroupId[] = ['discover', 'desk', 'toolkit', 'academy', 'access']

export const NAV_GROUP_LABELS: Record<NavGroupId, string> = {
  discover: 'Discover',
  desk: 'Editorial',
  toolkit: 'Toolkit',
  academy: 'Academy',
  access: 'Access',
}

export interface NavLinkGroup {
  id: NavGroupId
  label: string
  links: NavLink[]
}

export function groupNavLinks(links: NavLink[]): NavLinkGroup[] {
  const buckets = new Map<NavGroupId, NavLink[]>()
  for (const link of links) {
    const id = link.group ?? 'desk'
    const arr = buckets.get(id) ?? []
    arr.push(link)
    buckets.set(id, arr)
  }
  return NAV_GROUP_ORDER.filter((id) => buckets.has(id)).map((id) => ({
    id,
    label: NAV_GROUP_LABELS[id],
    links: buckets.get(id)!,
  }))
}
