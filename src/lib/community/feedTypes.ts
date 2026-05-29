import type { CommunityRank } from '@/types'

export type CommunityPostKind = 'spin' | 'drop'

export type FeedReactionKind = 'fire' | 'headphones' | 'bolt'

export interface FeedReactionCounts {
  fire: number
  headphones: number
  bolt: number
}

export interface CommunityFeedPost {
  id: string
  kind: CommunityPostKind
  body?: string
  spotifyUrl?: string
  youtubeUrl?: string
  trackTitle?: string
  imageUrl?: string
  linkUrl?: string
  linkTitle?: string
  linkDescription?: string
  linkImageUrl?: string
  createdAt: string
  userId: string
  displayName: string
  handle: string
  avatarUrl?: string
  rank: CommunityRank
  primaryGenreSlug?: string
  status: 'visible' | 'hidden'
  reactions: FeedReactionCounts
  myReaction?: FeedReactionKind | null
  commentCount?: number
}
