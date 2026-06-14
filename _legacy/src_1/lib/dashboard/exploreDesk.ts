import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import type { LeaderboardEntry } from '@/lib/community/service'
import { editorialExcerpt } from '@/lib/editorial/richText'
import { formatPlayCount, type DiscoverPremiereCard } from '@/lib/discovery/premieres'
import { SCENE_GENRES } from '@/lib/discovery/sceneRegistry'
import type { CoverStory } from '@/types'
import type { ExploreRecentEntry } from '@/lib/dashboard/exploreRecentStorage'

export const EXPLORE_PHOTO_VARIANTS = [1, 2, 3, 4] as const

export type ExploreTrendingRow = {
  key: string
  title: string
  artist: string
  plays: string
  art: string
  href: string
}

export type ExploreEditorialPick = {
  title: string
  lede: string
  href: string
  image?: string
}

export type ExploreNowPlaying = {
  title: string
  artist: string
  href: string
}

export function recentFromPremieres(cards: DiscoverPremiereCard[]): ExploreRecentEntry[] {
  return cards.slice(0, 4).map((card, i) => ({
    key: card.trackId,
    title: card.trackTitle,
    meta: `${card.artistName} · ${card.genreLabel}`,
    href: card.releaseSlug ? `/release/${card.releaseSlug}` : `/artist/${card.artistSlug}`,
    tone: EXPLORE_PHOTO_VARIANTS[i % EXPLORE_PHOTO_VARIANTS.length],
    openedAt: card.trackCreatedAt,
  }))
}

export function mergeRecentEntries(
  stored: ExploreRecentEntry[],
  fallback: ExploreRecentEntry[],
  limit = 4,
): ExploreRecentEntry[] {
  const seen = new Set<string>()
  const merged: ExploreRecentEntry[] = []
  for (const row of [...stored, ...fallback]) {
    if (seen.has(row.key)) continue
    seen.add(row.key)
    merged.push(row)
    if (merged.length >= limit) break
  }
  return merged
}

export function trendingFromPremieres(cards: DiscoverPremiereCard[]): ExploreTrendingRow[] {
  return [...cards]
    .sort((a, b) => b.playCount - a.playCount || b.trackCreatedAt.localeCompare(a.trackCreatedAt))
    .slice(0, 4)
    .map((card, i) => ({
      key: card.trackId,
      title: card.trackTitle,
      artist: card.artistName,
      plays: formatPlayCount(card.playCount),
      art: `me-trend-art--${EXPLORE_PHOTO_VARIANTS[i % EXPLORE_PHOTO_VARIANTS.length]}`,
      href: card.releaseSlug ? `/release/${card.releaseSlug}` : `/artist/${card.artistSlug}`,
    }))
}

export function trendingFromLeaderboard(entries: LeaderboardEntry[]): ExploreTrendingRow[] {
  return entries.slice(0, 4).map((entry, i) => ({
    key: entry.userId,
    title: entry.name,
    artist: entry.rank,
    plays: `${entry.weeklyDb.toLocaleString()} dB`,
    art: `me-trend-art--${EXPLORE_PHOTO_VARIANTS[i % EXPLORE_PHOTO_VARIANTS.length]}`,
    href: `/member/${entry.handle}`,
  }))
}

export function editorialPickFromCover(cover: CoverStory | null): ExploreEditorialPick | null {
  if (!cover) return null
  return {
    title: cover.headline,
    lede: cover.dek,
    href: `/feature/${cover.slug}`,
    image: cover.image,
  }
}

export function editorialPickFromDraft(input: {
  title: string
  body: string
  slug: string
  coverImageUrl?: string
}): ExploreEditorialPick {
  return {
    title: input.title,
    lede: editorialExcerpt(input.body, 140),
    href: `/feature/${input.slug}`,
    image: input.coverImageUrl,
  }
}

export function genreBarsFromFeed(posts: CommunityFeedPost[]) {
  const counts = new Map<string, number>()
  for (const post of posts) {
    const slug = post.primaryGenreSlug?.trim()
    if (!slug) continue
    counts.set(slug, (counts.get(slug) ?? 0) + 1)
  }

  const total = [...counts.values()].reduce((sum, n) => sum + n, 0)
  if (total <= 0) {
    return SCENE_GENRES.slice(0, 4).map((genre) => ({
      name: genre.label,
      pct: Math.round(100 / Math.min(4, SCENE_GENRES.length)),
    }))
  }

  const labelFor = (slug: string) =>
    SCENE_GENRES.find((g) => g.slug === slug)?.label ??
    slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => ({
      name: labelFor(slug),
      pct: Math.round((count / total) * 100),
    }))
}

export function nowPlayingFromTrending(rows: ExploreTrendingRow[]): ExploreNowPlaying | null {
  const top = rows[0]
  if (!top) return null
  return { title: top.title, artist: top.artist, href: top.href }
}

export function cardRecentEntry(input: {
  to: string
  title: string
  lede: string
  tone: number
}): Omit<ExploreRecentEntry, 'openedAt'> {
  return {
    key: input.to,
    title: input.title,
    meta: input.lede,
    href: input.to,
    tone: input.tone,
  }
}
