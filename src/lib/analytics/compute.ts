import type { EditorialDraft, SubmissionStatus } from '@/lib/auth/types'
import type { AnalyticsSource, SuperAdminAnalytics } from './types'

const MS_DAY = 86_400_000

function daysAgo(n: number) {
  return Date.now() - n * MS_DAY
}

function countInWindow(items: { createdAt: string }[], sinceMs: number) {
  return items.filter((i) => new Date(i.createdAt).getTime() >= sinceMs).length
}

function pipelineLabel(pending: number, inReview: number): SuperAdminAnalytics['pipeline'] {
  if (pending >= 8 || pending + inReview >= 12) return 'backlog'
  if (pending >= 3 || inReview >= 2) return 'steady'
  return 'clear'
}

export function computeSuperAdminAnalytics(source: AnalyticsSource): SuperAdminAnalytics {
  const { submissions, drafts, artistsRegistered } = source
  const weekAgo = daysAgo(7)
  const monthAgo = daysAgo(30)

  const statusCounts: Record<SubmissionStatus, number> = {
    pending: 0,
    in_review: 0,
    approved: 0,
    rejected: 0,
  }

  for (const s of submissions) {
    statusCounts[s.status] += 1
  }

  const decided = statusCounts.approved + statusCounts.rejected
  const approvalRate = decided > 0 ? Math.round((statusCounts.approved / decided) * 100) : 0

  const genreMap = new Map<string, number>()
  const artistIds = new Set<string>()
  for (const s of submissions) {
    const g = s.genre.trim() || 'Unspecified'
    genreMap.set(g, (genreMap.get(g) ?? 0) + 1)
    artistIds.add(s.artistId)
  }

  const totalGenre = submissions.length || 1
  const genreBreakdown = [...genreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([genre, count]) => ({
      genre,
      count,
      pct: Math.round((count / totalGenre) * 100),
    }))

  const draftsByType: Record<EditorialDraft['type'], number> = {
    review: 0,
    feature: 0,
    band_profile: 0,
  }
  for (const d of drafts) {
    draftsByType[d.type] += 1
  }

  const reviewed = submissions.filter((s) => s.reviewedAt)
  let avgReviewHours: number | null = null
  if (reviewed.length > 0) {
    const totalH =
      reviewed.reduce((sum, s) => {
        const start = new Date(s.createdAt).getTime()
        const end = new Date(s.reviewedAt!).getTime()
        return sum + Math.max(0, end - start) / 3_600_000
      }, 0) / reviewed.length
    avgReviewHours = Math.round(totalH * 10) / 10
  }

  const recentActivity = [...submissions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((s) => ({
      id: s.id,
      trackTitle: s.trackTitle,
      artistName: s.artistName,
      genre: s.genre,
      status: s.status,
      createdAt: s.createdAt,
    }))

  return {
    generatedAt: new Date().toISOString(),
    artistsRegistered,
    totalSubmissions: submissions.length,
    uniqueSubmittingArtists: artistIds.size,
    statusCounts,
    approvalRate,
    submissionsLast7Days: countInWindow(submissions, weekAgo),
    submissionsLast30Days: countInWindow(submissions, monthAgo),
    avgReviewHours,
    genreBreakdown,
    draftsTotal: drafts.length,
    draftsByType,
    recentActivity,
    pipeline: pipelineLabel(statusCounts.pending, statusCounts.in_review),
  }
}
