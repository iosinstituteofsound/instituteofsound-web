import { SIDEBAR_NAV } from '@/lib/nav/sidebar'

export type SearchItem = {
  id: string
  label: string
  href: string
  group: string
  keywords: string
}

const QUICK: SearchItem[] = [
  { id: 'home', label: 'Home', href: '/', group: 'Quick', keywords: 'index start' },
  { id: 'submit', label: 'Submit Music', href: '/submissions', group: 'Quick', keywords: 'artist upload' },
  { id: 'join', label: 'Join / Register', href: '/register', group: 'Quick', keywords: 'signup google' },
  { id: 'login', label: 'Sign In', href: '/login', group: 'Quick', keywords: 'auth' },
]

export function buildSearchItems(): SearchItem[] {
  const fromNav: SearchItem[] = SIDEBAR_NAV.flatMap((section) =>
    section.items.map((item) => ({
      id: `${section.title}-${item.label}`,
      label: item.label,
      href: item.href,
      group: section.title,
      keywords: `${section.title} ${item.label}`.toLowerCase(),
    })),
  )
  return [...QUICK, ...fromNav]
}

export function filterSearchItems(items: SearchItem[], query: string): SearchItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return items.slice(0, 12)
  return items
    .filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        item.keywords.includes(q) ||
        item.href.toLowerCase().includes(q),
    )
    .slice(0, 14)
}
