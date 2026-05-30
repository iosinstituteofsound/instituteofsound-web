/**
 * Phase 4 API client — remaining modules (community social, content, platform).
 * Import via v1Client re-exports or directly from here in services.
 */
import { v1Fetch } from '@/api/v1Client'
import type { TrackSubmission, EditorialDraft, User } from '@/lib/auth/types'
import type { PostComment } from '@/lib/community/commentTypes'
import type { CommunityNotification } from '@/lib/community/localNotifications'
import type {
  CommunityMemberStats,
  CommunityGenre,
  EarnedBadge,
  LeaderboardEntry,
} from '@/lib/community/service'
import type { ArtistRelease, PublicRelease, ReleaseMilestone, UpsertReleaseInput } from '@/lib/releases/types'
import type { MyCrew } from '@/lib/community/crewTypes'
import type { SceneEvent, PendingSceneEvent, SubmitEventInput } from '@/lib/events/types'
import type { CollabBoardPost, CreateCollabPostInput } from '@/lib/collab/types'
import type { DmMessage, DmThreadHeader, DmThreadSummary } from '@/lib/dm/types'
import type { AcademyProgressSnapshot } from '@/lib/academy/typesProgress'
import type { PublishedEditorial } from '@/lib/editorial/published'
import type { DiscoverPremiereCard } from '@/lib/discovery/premieres'
import type { SceneHubData } from '@/lib/discovery/sceneService'
import type {
  CreateDraftInput,
  CreateSubmissionInput,
  ReviewSubmissionInput,
} from '@/lib/submissions/service'
import type { UpdateProfileInput } from '@/lib/auth/profile'

export async function v1ToggleFollow(targetUserId: string): Promise<{ following: boolean }> {
  return v1Fetch('/community/follow', { method: 'POST', body: JSON.stringify({ targetUserId }) })
}

export async function v1IsFollowing(targetUserId: string): Promise<{ following: boolean }> {
  const params = new URLSearchParams({ targetUserId })
  return v1Fetch(`/community/follow?${params}`)
}

export async function v1ListPostComments(postId: string, limit = 100): Promise<{ comments: PostComment[] }> {
  const params = new URLSearchParams({ postId, limit: String(limit) })
  return v1Fetch(`/community/comments?${params}`, { auth: 'optional' })
}

export async function v1AddPostComment(input: {
  postId: string
  body: string
  parentId?: string
}): Promise<{ id: string }> {
  return v1Fetch('/community/comments', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1DeletePostComment(commentId: string): Promise<void> {
  await v1Fetch('/community/comments', { method: 'DELETE', body: JSON.stringify({ commentId }) })
}

export async function v1GetNotifications(limit = 40): Promise<{ notifications: CommunityNotification[] }> {
  const params = new URLSearchParams({ limit: String(limit) })
  return v1Fetch(`/community/notifications?${params}`)
}

export async function v1GetUnreadNotificationCount(): Promise<{ count: number }> {
  return v1Fetch('/community/notifications/unread')
}

export async function v1MarkNotificationsRead(ids?: string[]): Promise<void> {
  await v1Fetch('/community/notifications/read', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })
}

export async function v1GetMemberStats(userId: string): Promise<{ stats: CommunityMemberStats | null }> {
  const params = new URLSearchParams({ userId })
  return v1Fetch(`/community/member-stats?${params}`, { auth: 'optional' })
}

export async function v1GetWeeklyLeaderboard(limit = 20): Promise<{ entries: LeaderboardEntry[] }> {
  const params = new URLSearchParams({ limit: String(limit) })
  return v1Fetch(`/community/leaderboard?${params}`, { auth: 'optional' })
}

export async function v1GetCommunityGenres(): Promise<{ genres: CommunityGenre[] }> {
  return v1Fetch('/community/genres', { auth: 'optional' })
}

export async function v1SetPrimaryGenre(genreId: string): Promise<void> {
  await v1Fetch('/community/primary-genre', {
    method: 'PATCH',
    body: JSON.stringify({ genreId }),
  })
}

export async function v1GetUserBadges(userId: string): Promise<{ badges: EarnedBadge[] }> {
  const params = new URLSearchParams({ userId })
  return v1Fetch(`/community/badges?${params}`, { auth: 'optional' })
}

export async function v1GetGenreLeaderboard(
  genreSlug: string,
  limit = 15,
): Promise<{ entries: LeaderboardEntry[] }> {
  const params = new URLSearchParams({ genreSlug, limit: String(limit) })
  return v1Fetch(`/community/genre-leaderboard?${params}`, { auth: 'optional' })
}

export async function v1GetGenreRank(
  genreSlug: string,
  userId: string,
): Promise<{ rank: number | null }> {
  const params = new URLSearchParams({ genreSlug, userId })
  return v1Fetch(`/community/genre-rank?${params}`, { auth: 'optional' })
}

export async function v1GetMyCrew(): Promise<{ crew: MyCrew | null }> {
  return v1Fetch('/community/crew/my')
}

export async function v1CreateCrew(input: {
  name: string
  tagline?: string
  genreSlug?: string
}): Promise<{ crew: MyCrew | null }> {
  return v1Fetch('/community/crew', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1JoinCrew(inviteCode: string): Promise<{ crew: MyCrew | null }> {
  return v1Fetch('/community/crew/join', { method: 'POST', body: JSON.stringify({ inviteCode }) })
}

export async function v1LeaveCrew(): Promise<void> {
  await v1Fetch('/community/crew/leave', { method: 'POST', body: JSON.stringify({}) })
}

export async function v1DisbandCrew(): Promise<void> {
  await v1Fetch('/community/crew/disband', { method: 'POST', body: JSON.stringify({}) })
}

export async function v1GetPublicRelease(slug: string): Promise<{ release: PublicRelease | null }> {
  const params = new URLSearchParams({ slug })
  return v1Fetch(`/releases/public?${params}`, { auth: 'optional' })
}

export async function v1ListReleasesForProfile(profileId: string): Promise<{ releases: ArtistRelease[] }> {
  const params = new URLSearchParams({ profileId })
  return v1Fetch(`/releases?${params}`, { auth: 'optional' })
}

export async function v1UpsertRelease(input: {
  profileId: string
  release: UpsertReleaseInput
  releaseId?: string
}): Promise<{ release: ArtistRelease }> {
  return v1Fetch('/releases', { method: 'PUT', body: JSON.stringify(input) })
}

export async function v1ListReleaseMilestones(releaseId: string): Promise<{ milestones: ReleaseMilestone[] }> {
  const params = new URLSearchParams({ releaseId })
  return v1Fetch(`/releases/milestones?${params}`, { auth: 'optional' })
}

export async function v1AddReleaseMilestone(input: {
  releaseId: string
  kind: ReleaseMilestone['kind']
  title: string
  body?: string
}): Promise<{ milestone: ReleaseMilestone }> {
  return v1Fetch('/releases/milestones', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1MarkReleaseSpinPromoted(releaseId: string): Promise<void> {
  await v1Fetch('/releases/spin-promoted', { method: 'POST', body: JSON.stringify({ releaseId }) })
}

export async function v1CreateSubmission(input: CreateSubmissionInput): Promise<{ submission: TrackSubmission }> {
  return v1Fetch('/submissions', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1GetMySubmissions(): Promise<{ submissions: TrackSubmission[] }> {
  return v1Fetch('/submissions/mine')
}

export async function v1GetDeskSubmissions(): Promise<{ submissions: TrackSubmission[] }> {
  return v1Fetch('/submissions/desk')
}

export async function v1ReviewSubmission(input: {
  submissionId: string
  review: ReviewSubmissionInput
}): Promise<{ submission: TrackSubmission }> {
  return v1Fetch('/submissions/review', { method: 'PATCH', body: JSON.stringify(input) })
}

export async function v1GetSubmissionById(id: string): Promise<{ submission: TrackSubmission | null }> {
  const params = new URLSearchParams({ id })
  return v1Fetch(`/submissions/item?${params}`)
}

export async function v1GetEditorDrafts(): Promise<{ drafts: EditorialDraft[] }> {
  return v1Fetch('/editorial/drafts')
}

export async function v1CreateEditorDraft(input: CreateDraftInput): Promise<{ draft: EditorialDraft }> {
  return v1Fetch('/editorial/drafts', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1PublishEditorDraft(input: {
  draftId: string
  title?: string
}): Promise<{ draft: EditorialDraft }> {
  return v1Fetch('/editorial/drafts/publish', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1PatchMemberProfile(input: UpdateProfileInput): Promise<{ user: User }> {
  return v1Fetch('/member/profile', { method: 'PATCH', body: JSON.stringify(input) })
}

export async function v1GetDiscoverPremieres(limit = 24): Promise<{ cards: DiscoverPremiereCard[] }> {
  const params = new URLSearchParams({ limit: String(limit) })
  return v1Fetch(`/discovery/premieres?${params}`, { auth: 'optional' })
}

export async function v1GetSceneHub(city: string, genre: string): Promise<{ hub: SceneHubData }> {
  const params = new URLSearchParams({ city, genre })
  return v1Fetch(`/discovery/scene?${params}`, { auth: 'optional' })
}

export async function v1ListPublishedEditorials(): Promise<{ editorials: PublishedEditorial[] }> {
  return v1Fetch('/editorial/published', { auth: 'optional' })
}

export async function v1GetAcademySummary(userId: string): Promise<{ summary: AcademyProgressSnapshot | null }> {
  const params = new URLSearchParams({ userId })
  return v1Fetch(`/academy/summary?${params}`, { auth: 'optional' })
}

export async function v1GetUpcomingEvents(input: {
  city?: string
  genreSlug?: string
  limit?: number
}): Promise<{ events: SceneEvent[] }> {
  const params = new URLSearchParams()
  if (input.city) params.set('city', input.city)
  if (input.genreSlug) params.set('genreSlug', input.genreSlug)
  if (input.limit) params.set('limit', String(input.limit))
  return v1Fetch(`/events/upcoming?${params}`, { auth: 'optional' })
}

export async function v1SubmitSceneEvent(input: SubmitEventInput): Promise<{ id: string }> {
  return v1Fetch('/events/submit', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1ToggleEventRsvp(eventId: string): Promise<{ rsvped: boolean }> {
  return v1Fetch('/events/rsvp', { method: 'POST', body: JSON.stringify({ eventId }) })
}

export async function v1GetPendingEvents(limit = 30): Promise<{ events: PendingSceneEvent[] }> {
  const params = new URLSearchParams({ limit: String(limit) })
  return v1Fetch(`/events/pending?${params}`)
}

export async function v1ModerateEvent(input: {
  eventId: string
  action: 'publish' | 'reject'
  note?: string
}): Promise<void> {
  await v1Fetch('/events/moderate', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1GetCollabBoard(query: {
  kind?: string
  city?: string
  genreSlug?: string
  skill?: string
  limit?: number
}): Promise<{ posts: CollabBoardPost[] }> {
  const params = new URLSearchParams()
  if (query.kind) params.set('kind', query.kind)
  if (query.city) params.set('city', query.city)
  if (query.genreSlug) params.set('genreSlug', query.genreSlug)
  if (query.skill) params.set('skill', query.skill)
  if (query.limit) params.set('limit', String(query.limit))
  return v1Fetch(`/collab/board?${params}`, { auth: 'optional' })
}

export async function v1CreateCollabPost(input: CreateCollabPostInput): Promise<{ id: string }> {
  return v1Fetch('/collab/posts', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1DmListThreads(): Promise<{ threads: DmThreadSummary[] }> {
  return v1Fetch('/dm/threads')
}

export async function v1DmGetOrCreateThread(otherUserId: string): Promise<{ threadId: string }> {
  return v1Fetch('/dm/thread', { method: 'POST', body: JSON.stringify({ otherUserId }) })
}

export async function v1DmListMessages(threadId: string, limit = 100): Promise<{ messages: DmMessage[] }> {
  const params = new URLSearchParams({ threadId, limit: String(limit) })
  return v1Fetch(`/dm/messages?${params}`)
}

export async function v1DmSendMessage(threadId: string, body: string): Promise<{ id: string }> {
  return v1Fetch('/dm/messages', { method: 'POST', body: JSON.stringify({ threadId, body }) })
}

export async function v1DmSetThreadStatus(
  threadId: string,
  status: 'accepted' | 'declined',
): Promise<void> {
  await v1Fetch('/dm/thread-status', {
    method: 'PATCH',
    body: JSON.stringify({ threadId, status }),
  })
}

export async function v1DmThreadHeader(threadId: string): Promise<{ header: DmThreadHeader | null }> {
  const params = new URLSearchParams({ threadId })
  return v1Fetch(`/dm/thread-header?${params}`)
}

export async function v1DmUnreadTotal(): Promise<{ count: number }> {
  return v1Fetch('/dm/unread')
}
