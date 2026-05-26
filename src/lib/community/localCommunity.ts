import type { CommunityBadgeSlug } from '@/lib/community/badges'
import { badgeDefBySlug } from '@/lib/community/badges'

const GENRE_KEY = 'ios_community_genre_slug'
const BADGES_KEY = 'ios_community_badges'

export interface LocalEarnedBadge {
  slug: CommunityBadgeSlug
  name: string
  description: string
  earnedAt: string
}

export function localGetGenreSlug(): string | null {
  try {
    return localStorage.getItem(GENRE_KEY)
  } catch {
    return null
  }
}

export function localSetGenreSlug(slug: string): void {
  try {
    localStorage.setItem(GENRE_KEY, slug)
  } catch {
    /* private mode */
  }
}

function readBadges(): CommunityBadgeSlug[] {
  try {
    const raw = localStorage.getItem(BADGES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as CommunityBadgeSlug[]) : []
  } catch {
    return []
  }
}

function writeBadges(slugs: CommunityBadgeSlug[]): void {
  try {
    localStorage.setItem(BADGES_KEY, JSON.stringify(slugs))
  } catch {
    /* ignore */
  }
}

export function localGrantBadge(slug: CommunityBadgeSlug): boolean {
  const current = readBadges()
  if (current.includes(slug)) return false
  writeBadges([...current, slug])
  return true
}

export function localListBadges(): LocalEarnedBadge[] {
  return readBadges()
    .map((slug) => {
      const def = badgeDefBySlug(slug)
      if (!def) return null
      return {
        slug,
        name: def.name,
        description: def.description,
        earnedAt: new Date(0).toISOString(),
      }
    })
    .filter((b): b is LocalEarnedBadge => b !== null)
}
