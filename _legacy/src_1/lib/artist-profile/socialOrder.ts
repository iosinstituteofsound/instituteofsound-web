import type { ArtistSocialLinks } from './types'

export type SocialLinkKey =
  | 'website'
  | 'spotify'
  | 'youtube'
  | 'instagram'
  | 'facebook'
  | 'bandcamp'

export const DEFAULT_SOCIAL_LINK_ORDER: SocialLinkKey[] = [
  'website',
  'spotify',
  'youtube',
  'instagram',
  'facebook',
  'bandcamp',
]

const VALID_KEYS = new Set<string>(DEFAULT_SOCIAL_LINK_ORDER)

export const SOCIAL_LINK_META: Record<
  SocialLinkKey,
  { label: string; short: string }
> = {
  website: { label: 'Website', short: 'WEB' },
  spotify: { label: 'Spotify', short: 'SP' },
  youtube: { label: 'YouTube', short: 'YT' },
  instagram: { label: 'Instagram', short: 'IG' },
  facebook: { label: 'Facebook', short: 'FB' },
  bandcamp: { label: 'Bandcamp', short: 'BC' },
}

export function normalizeSocialLinkOrder(order?: string[] | null): SocialLinkKey[] {
  if (!order?.length) return [...DEFAULT_SOCIAL_LINK_ORDER]
  const seen = new Set<SocialLinkKey>()
  const result: SocialLinkKey[] = []
  for (const raw of order) {
    if (!VALID_KEYS.has(raw)) continue
    const key = raw as SocialLinkKey
    if (seen.has(key)) continue
    seen.add(key)
    result.push(key)
  }
  for (const key of DEFAULT_SOCIAL_LINK_ORDER) {
    if (!seen.has(key)) result.push(key)
  }
  return result
}

export function resolveSocialHref(
  social: ArtistSocialLinks,
  key: SocialLinkKey
): string | undefined {
  if (key === 'website') return social.website?.trim() || undefined
  return social[key]?.trim() || undefined
}

export interface OrderedSocialLink {
  key: SocialLinkKey
  href: string
  label: string
  short: string
}

export function getOrderedSocialLinks(
  social: ArtistSocialLinks,
  order?: string[] | null
): OrderedSocialLink[] {
  const keys = normalizeSocialLinkOrder(order)
  const items: OrderedSocialLink[] = []
  for (const key of keys) {
    const href = resolveSocialHref(social, key)
    if (!href) continue
    const meta = SOCIAL_LINK_META[key]
    items.push({ key, href, label: meta.label, short: meta.short })
  }
  return items
}

export function moveSocialLinkOrder(
  order: SocialLinkKey[],
  key: SocialLinkKey,
  direction: 'up' | 'down'
): SocialLinkKey[] {
  const idx = order.indexOf(key)
  if (idx < 0) return order
  const swap = direction === 'up' ? idx - 1 : idx + 1
  if (swap < 0 || swap >= order.length) return order
  const next = [...order]
  ;[next[idx], next[swap]] = [next[swap], next[idx]]
  return next
}

/** Apply drag reorder for links that are currently filled in */
export function reorderActiveSocialLinks(
  fullOrder: SocialLinkKey[],
  activeKeysInNewOrder: SocialLinkKey[]
): SocialLinkKey[] {
  const activeSet = new Set(activeKeysInNewOrder)
  const inactive = fullOrder.filter((k) => !activeSet.has(k))
  return [...activeKeysInNewOrder, ...inactive]
}

export function reorderSocialLinkByDrag(
  activeKeys: SocialLinkKey[],
  draggedKey: SocialLinkKey,
  targetKey: SocialLinkKey
): SocialLinkKey[] {
  if (draggedKey === targetKey) return activeKeys
  const from = activeKeys.indexOf(draggedKey)
  const to = activeKeys.indexOf(targetKey)
  if (from < 0 || to < 0) return activeKeys
  const next = [...activeKeys]
  next.splice(from, 1)
  next.splice(to, 0, draggedKey)
  return next
}
