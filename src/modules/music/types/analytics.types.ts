export type ReleaseAnalyticsSummaryDto = {
  releaseId: string
  qualifiedPlays: number
  totalListenSec: number
  averageListenSec: number
  completionRate: number
  skipRate: number
  likeCount: number
  unlikeCount: number
  activeLikes: number
  uniqueListeners: number
  uniqueLocations: number
  peakListenHours: Array<{ hour: number; sessions: number }>
  topListeners: ListenerProfileDto[]
  locations: LocationAggregateDto[]
  tracks: TrackAnalyticsRowDto[]
  trendsPreview: {
    last7d: { plays: number; listenSec: number }
    last30d: { plays: number; listenSec: number }
  }
  userLiked?: boolean
}

export type TrackAnalyticsRowDto = {
  trackId: string
  title: string
  qualifiedPlays: number
  totalListenSec: number
  averageListenSec: number
  completionRate: number
  skipRate: number
  activeLikes: number
}

export type LocationAggregateDto = {
  countryCode: string
  countryName?: string
  city?: string
  lat?: number
  lng?: number
  sessions: number
  qualifiedPlays: number
  totalListenSec: number
  uniqueListeners: number
}

export type ListenerProfileDto = {
  userId: string
  name: string
  username?: string
  avatarUrl?: string
  isVerified?: boolean
  qualifiedPlays: number
  totalListenSec: number
  lastListenAt?: string
  profileHref: string
  rank: number
}

export type LikerProfileDto = {
  userId: string
  name: string
  username?: string
  avatarUrl?: string
  isVerified?: boolean
  likedAt: string
  profileHref: string
}

export type AnalyticsTrendPointDto = {
  date: string
  qualifiedPlays: number
  totalListenSec: number
  sessions: number
  completions: number
  skips: number
  likes: number
}

export type PaginatedListenersDto = {
  items: ListenerProfileDto[]
  total: number
  page: number
  pageSize: number
}

export type PaginatedLikersDto = {
  items: LikerProfileDto[]
  total: number
  page: number
  pageSize: number
}

export type AnalyticsRangePreset = '30d' | '90d' | '365d' | 'lifetime' | 'custom'

export type ArtistReleasePerformanceDto = {
  range: {
    preset: AnalyticsRangePreset
    from?: string
    to?: string
    label: string
  }
  aggregateTrend: AnalyticsTrendPointDto[]
  totals: {
    qualifiedPlays: number
    totalListenSec: number
    activeLikes: number
    uniqueListeners: number
    completionRate: number
  }
  releases: Array<{
    releaseId: string
    title: string
    type: string
    coverUrl?: string
    releaseDate?: string
    status: string
    qualifiedPlays: number
    totalListenSec: number
    completionRate: number
    activeLikes: number
    uniqueListeners: number
    trend: AnalyticsTrendPointDto[]
  }>
}

export type ArtistAnalyticsDashboardDto = {
  overview: {
    qualifiedPlays: number
    totalListenSec: number
    averageListenSec: number
    averageCompletionRate: number
    skipRate: number
    activeLikes: number
    uniqueListeners: number
    uniqueLocations: number
  }
  trend: AnalyticsTrendPointDto[]
  topListeners: ListenerProfileDto[]
  locations: LocationAggregateDto[]
  releases: Array<{
    releaseId: string
    title: string
    type: string
    qualifiedPlays: number
    totalListenSec: number
    completionRate: number
    activeLikes: number
    uniqueListeners: number
  }>
}

export type LikeToggleResultDto = {
  liked: boolean
  activeLikes: number
  likeCount: number
  unlikeCount: number
}
