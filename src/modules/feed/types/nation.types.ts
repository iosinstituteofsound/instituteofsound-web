import type { NationRankLevel, NationRankTier } from '@/modules/feed/lib/nation-rank-meta'

export interface NationHubDto {
  networkScore: {
    value: number
    cap: number
    weeklyTrendPct: number
    sparkline: number[]
  }
  dbScore: {
    value: number
    weeklyDelta: number
    sparkline: number[]
  }
  rank: {
    tier: NationRankTier
    tierLabel: string
    levelLabel: NationRankLevel
    percentile: number
    rank: number | null
  }
  /** Network XP — Rank / Nation prestige source. */
  lifetimeEarned?: number
  genreWar?: {
    leaderGenre: string
    leaderLabel: string
    standings: Array<{ genreSlug: string; label: string; seasonScore: number }>
  }
}

export interface NationWalletEarnRuleDto {
  id: string
  label: string
  amount: number
  description: string
}

export interface NationWalletLedgerItemDto {
  id: string
  delta: number
  xpDelta?: number
  balanceAfter: number
  lifetimeAfter: number
  reason: string
  reasonLabel: string
  refType?: string
  refId?: string
  note?: string
  createdAt: string
}

export interface NationWalletDto {
  balance: number
  lifetimeEarned: number
  weeklyDelta: number
  sparkline: number[]
  rank: NationHubDto['rank']
  earnRules: NationWalletEarnRuleDto[]
  recentLedger: NationWalletLedgerItemDto[]
}

export interface NationWalletLedgerDto {
  items: NationWalletLedgerItemDto[]
  nextCursor: string | null
}

export interface NationTopArtistDto {
  rank: number
  artistProfileId: string
  userId: string
  displayName: string
  slug: string
  avatarUrl?: string
  isVerified?: boolean
  plays: number
  likes: number
  supportScore: number
  listenerPercentile: number
}

export interface NationTopArtistsDto {
  items: NationTopArtistDto[]
  total: number
}

export type NationCalendarFilter = 'all' | 'upcoming' | 'recent' | 'event'

export type NationCalendarDot = 'scheduled' | 'pending' | 'event'

export interface NationCalendarEntryDto {
  id: string
  kind: 'release' | 'event'
  date: string
  title: string
  subtitle?: string
  artistName?: string
  status: NationCalendarDot
  releaseId?: string
  eventId?: string
  slug?: string
  joined?: boolean
}

export interface NationCalendarDayDto {
  date: string
  dots: NationCalendarDot[]
  entries: NationCalendarEntryDto[]
}

export interface NationCalendarDto {
  month: string
  filter: NationCalendarFilter
  days: NationCalendarDayDto[]
  entries: NationCalendarEntryDto[]
}

export type NationActivityKind = 'earn_db' | 'follow' | 'tribe_join' | 'playlist_save'

export interface NationActivityTextSegment {
  text: string
  bold?: boolean
}

export interface NationRecentActivityItemDto {
  id: string
  kind: NationActivityKind
  segments: NationActivityTextSegment[]
  createdAt: string
}

export interface NationRecentActivityDto {
  items: NationRecentActivityItemDto[]
}

export type NationMagazineCategory = 'feature' | 'review' | 'signal' | 'interview' | 'ep'

export interface NationMagazineArticleDto {
  id: string
  slug: string
  title: string
  category: NationMagazineCategory
  categoryLabel: string
  coverUrl?: string
  publishedAt: string
  reviewScore?: number
}

export interface NationMagazineArticlesDto {
  items: NationMagazineArticleDto[]
}

export interface NationTrendingTrackDto {
  rank: number
  trackId: string
  releaseId: string
  title: string
  artistName?: string
  coverUrl?: string
  tagLabel: string
  qualifiedPlays: number
}

export interface NationTrendingTracksDto {
  items: NationTrendingTrackDto[]
}

export type UniverseRolloutStatus = 'hidden' | 'preview' | 'beta' | 'live' | 'maintenance'
export type UniverseCtaMode = 'info' | 'navigate' | 'disabled'

export interface NationWorldEntryDto {
  status: UniverseRolloutStatus
  ctaMode: UniverseCtaMode
  title: string
  subtitle: string
  badgeLabel: string
  bannerUrl?: string
  avatarUrl?: string
  phaseLabel: string
  progressPct: number
  infoTitle: string
  infoBody: string
  stats: Array<{ id: string; label: string; value: string }>
  worldRoute: string
  rulesetVersion: string
  rendererHint: 'skia' | 'unity'
}
