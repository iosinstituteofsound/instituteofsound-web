export type CollabPostKind = 'need' | 'offer'
export type CollabPostStatus = 'open' | 'closed' | 'filled'
export type CollabResponseStatus = 'pending' | 'accepted' | 'declined'

export interface CollabBoardPost {
  id: string
  kind: CollabPostKind
  title: string
  body: string
  sceneCity?: string
  sceneGenreSlug?: string
  skillSlugs: string[]
  status: CollabPostStatus
  responseCount: number
  createdAt: string
  userId: string
  displayName: string
  handle: string
  avatarUrl?: string
  communityRank: string
  ownerConfirmedAt?: string
  partnerConfirmedAt?: string
  acceptedResponderId?: string
}

export interface CollabResponse {
  id: string
  message: string
  status: CollabResponseStatus
  createdAt: string
  responderId: string
  displayName: string
  handle: string
  avatarUrl?: string
  communityRank: string
}

export interface CollabBoardFilters {
  kind?: CollabPostKind | ''
  city?: string
  genreSlug?: string
  skill?: string
}

export interface CreateCollabPostInput {
  kind: CollabPostKind
  title: string
  body: string
  sceneCity?: string
  sceneGenreSlug?: string
  skillSlugs: string[]
}
