import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import type { CrewLeaderboardEntry } from '@/lib/community/crewTypes'
import type { TribeWarStanding } from '@/lib/community/wireEvents'

export const DISCOVER_TRIBE_SHOWCASE: TribeWarStanding[] = [
  {
    genreSlug: 'metal',
    genreName: 'Metal',
    totalDb: 16170,
    activeMembers: 42,
    championDb: 4200,
    seasonLabel: 'May 2026',
  },
  {
    genreSlug: 'ambient',
    genreName: 'Ambient',
    totalDb: 0,
    activeMembers: 8,
    championDb: 0,
    seasonLabel: 'May 2026',
  },
  {
    genreSlug: 'bedroom-pop',
    genreName: 'Bedroom pop',
    totalDb: 0,
    activeMembers: 6,
    championDb: 0,
    seasonLabel: 'May 2026',
  },
  {
    genreSlug: 'dnb',
    genreName: 'DnB',
    totalDb: 0,
    activeMembers: 11,
    championDb: 0,
    seasonLabel: 'May 2026',
  },
  {
    genreSlug: 'electronic',
    genreName: 'Electronic',
    totalDb: 0,
    activeMembers: 18,
    championDb: 0,
    seasonLabel: 'May 2026',
  },
  {
    genreSlug: 'experimental',
    genreName: 'Experimental',
    totalDb: 0,
    activeMembers: 5,
    championDb: 0,
    seasonLabel: 'May 2026',
  },
]

export const DISCOVER_SPIN_SHOWCASE: CommunityFeedPost = {
  id: 'discover-spin-showcase',
  kind: 'spin',
  trackTitle: 'Sifar - Roko Na',
  body: 'Sifar - Roko Na',
  createdAt: new Date().toISOString(),
  userId: 'discover-ios',
  displayName: 'Institute Of Sound',
  handle: 'ios',
  rank: 'Operator',
  status: 'visible',
  reactions: { fire: 12, headphones: 8, bolt: 4 },
  commentCount: 2,
}

export const DISCOVER_CREW_SHOWCASE: CrewLeaderboardEntry[] = [
  {
    crewId: 'discover-crew-ios',
    name: 'IOS Signal',
    slug: 'ios-signal',
    tagline: 'Wire operators',
    inviteCode: 'IOS',
    memberCount: 24,
    weeklyDb: 16170,
  },
]

export const DISCOVER_CREW_HERO_IMAGE =
  'https://images.unsplash.com/photo-1614732414400-4899c250f4b8?auto=format&fit=crop&w=900&q=85'

export function mergeDiscoverTribes(api: TribeWarStanding[]): TribeWarStanding[] {
  if (api.length >= 4) return api.slice(0, 6)
  if (api.length > 0) {
    const merged = [...api]
    for (const row of DISCOVER_TRIBE_SHOWCASE) {
      if (merged.length >= 6) break
      if (!merged.some((t) => t.genreSlug === row.genreSlug)) merged.push(row)
    }
    return merged.slice(0, 6)
  }
  return DISCOVER_TRIBE_SHOWCASE
}

export function mergeDiscoverCrews(api: CrewLeaderboardEntry[]): CrewLeaderboardEntry[] {
  if (api.length >= 1) return api.slice(0, 5)
  return DISCOVER_CREW_SHOWCASE
}

export function spinReactionTotal(post: CommunityFeedPost): number {
  const r = post.reactions
  return r.fire + r.headphones + r.bolt
}

export function mergeDiscoverSpins(api: CommunityFeedPost[]): CommunityFeedPost[] {
  const sorted = [...api].sort(
    (a, b) =>
      spinReactionTotal(b) +
      (b.commentCount ?? 0) * 2 -
      (spinReactionTotal(a) + (a.commentCount ?? 0) * 2)
  )
  if (sorted.length >= 1) return sorted.slice(0, 8)
  return [DISCOVER_SPIN_SHOWCASE]
}

export function tribeBarPercent(totalDb: number, leaderDb: number): number {
  if (leaderDb <= 0) return 0
  return Math.max(4, Math.round((totalDb / leaderDb) * 100))
}
