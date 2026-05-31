export type FandomWindow = '90d' | 'all'

export type FandomActionType =
  | 'review'
  | 'editorial'
  | 'tagged_spin'
  | 'tagged_drop'
  | 'comment'
  | 'reaction'
  | 'share'

export interface MyFandomArtistRow {
  artistProfileId: string
  slug: string
  displayName: string
  avatarUrl?: string
  supportScore: number
  rankAmongMyArtists: number
  percentileLabel?: string | null
  spins: number
  drops: number
  comments: number
  reactions: number
  shares: number
  reviews: number
  editorials: number
  firstSupportAt?: string
  lastSupportAt?: string
}

export interface ArtistSupporterRow {
  supporterUserId: string
  displayName: string
  handle: string
  avatarUrl?: string
  supportScore: number
  supporterRank: number
  badgeLabel?: string | null
  spins: number
  drops: number
  comments: number
  reactions: number
  shares: number
  reviews: number
  editorials: number
  firstSupportAt?: string
  lastSupportAt?: string
}

export interface ArtistRecentSupportRow {
  supporterUserId: string
  displayName: string
  handle: string
  avatarUrl?: string
  actionType: FandomActionType
  createdAt: string
}

export interface ArtistContentChampionRow {
  supporterUserId: string
  displayName: string
  handle: string
  avatarUrl?: string
  contentScore: number
  spins: number
  drops: number
  reviews: number
  editorials: number
}

export interface FandomArtistSearchHit {
  id: string
  slug: string
  displayName: string
  avatarUrl?: string
}

export interface PublicSupporterBadge {
  supporterUserId: string
  badgeLabel?: string | null
  supporterRank?: number | null
}
