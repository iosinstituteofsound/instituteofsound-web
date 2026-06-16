export type FeedItemType = 'music' | 'video' | 'image' | 'text' | 'article'
export type FeedItemStatus = 'published' | 'hidden'

export const FEED_REACTION_KINDS = ['like', 'love', 'haha', 'wow', 'sad', 'angry'] as const
export type FeedReactionKind = (typeof FEED_REACTION_KINDS)[number]

export interface FeedReactionCounts {
  like: number
  love: number
  haha: number
  wow: number
  sad: number
  angry: number
}

export interface FeedEngagementSummary {
  reactions: FeedReactionCounts
  reactionTotal: number
  commentCount: number
  myReaction: FeedReactionKind | null
}

export interface FeedCommentEngagementSummary {
  reactions: FeedReactionCounts
  reactionTotal: number
  myReaction: FeedReactionKind | null
}

export interface FeedCommentReactionUserDto {
  user: FeedAuthorDto
  kind: FeedReactionKind
  createdAt: string
}

export interface FeedCommentDto {
  id: string
  feedItemId: string
  author: FeedAuthorDto
  body: string
  gifUrl?: string
  giphyId?: string
  parentId?: string
  createdAt: string
  updatedAt: string
  engagement?: FeedCommentEngagementSummary
}

export interface FeedAuthorDto {
  id: string
  name: string
  username?: string
  avatarUrl?: string
}

export interface FeedItemDto {
  id: string
  type: FeedItemType
  priority: number
  status: FeedItemStatus
  author: FeedAuthorDto
  title?: string
  body?: string
  payload: Record<string, unknown>
  createdAt: string
  updatedAt: string
  engagement?: FeedEngagementSummary
}

export interface FeedListResponse {
  items: FeedItemDto[]
  nextCursor: string | null
}

export interface CreateFeedItemInput {
  type: FeedItemType
  priority?: number
  title?: string
  body?: string
  payload?: Record<string, unknown>
}

export const FEED_ITEM_TYPES: { value: FeedItemType; label: string }[] = [
  { value: 'music', label: 'Music' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'text', label: 'Text' },
  { value: 'article', label: 'Article' },
]
