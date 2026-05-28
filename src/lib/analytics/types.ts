import type { EditorialDraft, SubmissionStatus, TrackSubmission } from '@/lib/auth/types'

export interface GenreStat {
  genre: string
  count: number
  pct: number
}

export interface RecentActivityItem {
  id: string
  trackTitle: string
  artistName: string
  genre: string
  status: SubmissionStatus
  createdAt: string
}

export interface AnalyticsArtistAccount {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface AnalyticsArtistProfile {
  id: string
  userId: string
  slug: string
  displayName: string
  published: boolean
  createdAt: string
}

export interface SuperAdminAnalytics {
  generatedAt: string
  artistsRegistered: number
  roleCounts: {
    listeners: number
    artists: number
    editors: number
    superEditors: number
    total: number
  }
  totalSubmissions: number
  uniqueSubmittingArtists: number
  statusCounts: Record<SubmissionStatus, number>
  approvalRate: number
  submissionsLast7Days: number
  submissionsLast30Days: number
  avgReviewHours: number | null
  genreBreakdown: GenreStat[]
  draftsTotal: number
  draftsByType: Record<EditorialDraft['type'], number>
  recentActivity: RecentActivityItem[]
  submissionLog: RecentActivityItem[]
  artistAccounts: AnalyticsArtistAccount[]
  artistProfiles: AnalyticsArtistProfile[]
  pipeline: 'clear' | 'steady' | 'backlog'
}

export interface AnalyticsSource {
  submissions: TrackSubmission[]
  drafts: EditorialDraft[]
  artistsRegistered: number
  roleCounts: {
    listeners: number
    artists: number
    editors: number
    superEditors: number
    total: number
  }
  artistAccounts: AnalyticsArtistAccount[]
  artistProfiles: AnalyticsArtistProfile[]
}
