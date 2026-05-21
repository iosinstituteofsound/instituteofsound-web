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

export interface SuperAdminAnalytics {
  generatedAt: string
  artistsRegistered: number
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
  pipeline: 'clear' | 'steady' | 'backlog'
}

export interface AnalyticsSource {
  submissions: TrackSubmission[]
  drafts: EditorialDraft[]
  artistsRegistered: number
}
