import type { PersistedStudioDocument } from '@/modules/illustrator/lib/studio-document-persistence'

export type IllustratorTrendPointDto = {
  date: string
  reactions: number
  comments: number
  posts: number
}

export type IllustratorArtworkDto = {
  id: string
  title?: string
  imageUrl?: string
  reactionTotal: number
  commentCount: number
  createdAt: string
}

export type IllustratorEngagerDto = {
  userId: string
  name: string
  username?: string
  avatarUrl?: string
  isVerified?: boolean
  reactionCount: number
  profileHref: string
  rank: number
}

export type IllustratorAnalyticsDashboardDto = {
  overview: {
    totalReactions: number
    totalComments: number
    portfolioCount: number
    uniqueEngagers: number
  }
  trend: IllustratorTrendPointDto[]
  artworks: IllustratorArtworkDto[]
  topEngagers: IllustratorEngagerDto[]
}

export type IllustratorPortfolioItemDto = {
  id: string
  title?: string
  body?: string
  imageUrl?: string
  reactionTotal: number
  commentCount: number
  createdAt: string
  updatedAt?: string
  savedAt?: string
  status: string
  source?: 'studio' | 'feed'
  width?: number
  height?: number
  dpi?: number
  colorProfile?: 'sRGB' | 'CMYK'
}

export type IllustratorArtworkDetailDto = {
  id: string
  title: string
  status: 'draft' | 'published'
  previewUrl?: string
  document: {
    width: number
    height: number
    dpi: number
    colorProfile: 'sRGB' | 'CMYK'
  }
  savedAt?: string
  createdAt: string
  updatedAt: string
  studioState: PersistedStudioDocument | null
}

export type IllustratorArtworkSaveResultDto = {
  id: string
  savedAt?: string
  previewUrl?: string
  status: 'draft' | 'published'
}

export type CreateIllustratorArtworkInput = {
  title?: string
  width: number
  height: number
  dpi?: number
  colorProfile?: 'sRGB' | 'CMYK'
}

export type SaveIllustratorArtworkInput = {
  title?: string
  status?: 'draft' | 'published'
  document?: {
    width: number
    height: number
    dpi: number
    colorProfile: 'sRGB' | 'CMYK'
  }
  stateGzipBase64: string
  previewDataUrl?: string
}
