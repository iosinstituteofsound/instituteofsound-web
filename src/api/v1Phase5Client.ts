import { v1Fetch } from '@/api/v1Client'
import type { User } from '@/lib/auth/types'
import type { ArtistProfile } from '@/lib/artist-profile/types'
import type { DiscoverPremiereCard } from '@/lib/discovery/premieres'
import type { CollabBoardPost, CollabResponse } from '@/lib/collab/types'
import type { CrewLeaderboardEntry } from '@/lib/community/crewTypes'
import type { SceneEvent } from '@/lib/events/types'
import type { AcademyProgressSnapshot } from '@/lib/academy/typesProgress'
import type {
  EditorApplication,
  EditorApplicationWithProfile,
  SubmitEditorApplicationInput,
} from '@/lib/editor-applications/types'
import type { AwardDbInput } from '@/lib/community/awardRepository'
import type { WeeklyChallenge } from '@/lib/community/challengeService'
import type { SuperAdminAnalytics } from '@/lib/analytics/types'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import type { EditorWirePick } from '@/lib/editorial/editorialBridge'
import type {
  CrewWarsEntry,
  FridayWire,
  TribeWarStanding,
  WireDigest,
} from '@/lib/community/wireEvents'
import type { SpinOfTheWeek } from '@/lib/community/wireHighlights'
import type { StoredAnalyticsEvent } from '@/lib/analytics/artistAnalyticsStorage'

export async function v1GetUserProfile(userId: string): Promise<{ user: User }> {
  const params = new URLSearchParams({ userId })
  return v1Fetch(`/users/profile?${params}`)
}

export async function v1GetReleasesCatalog(): Promise<{ cards: DiscoverPremiereCard[] }> {
  return v1Fetch('/discovery/releases-catalog', { auth: 'optional' })
}

export async function v1ListDiscoverArtistProfiles(): Promise<{ profiles: ArtistProfile[] }> {
  return v1Fetch('/discovery/artists', { auth: 'optional' })
}

export async function v1ListArtistProfilesForEditor(): Promise<{ profiles: ArtistProfile[] }> {
  return v1Fetch('/artist/profiles/for-editor')
}

export async function v1GlobalSearchRpc(
  q: string,
  limit = 6,
): Promise<{
  rows: {
    category: 'user' | 'editor' | 'music'
    refId: string
    title: string
    subtitle: string | null
    imageUrl: string | null
    handle: string | null
  }[]
}> {
  const params = new URLSearchParams({ q, limit: String(limit) })
  return v1Fetch(`/search/global?${params}`, { auth: 'optional' })
}

export async function v1GetAcademyProgress(): Promise<{ progress: AcademyProgressSnapshot | null }> {
  return v1Fetch('/academy/progress')
}

export async function v1PutAcademyProgress(snapshot: AcademyProgressSnapshot): Promise<void> {
  await v1Fetch('/academy/progress', { method: 'PUT', body: JSON.stringify(snapshot) })
}

export async function v1GetCrewWeeklyLeaderboard(
  limit = 15,
): Promise<{ entries: CrewLeaderboardEntry[] }> {
  const params = new URLSearchParams({ limit: String(limit) })
  return v1Fetch(`/community/crew-leaderboard?${params}`, { auth: 'optional' })
}

export async function v1GetEventsByScene(
  city: string,
  genre: string,
  limit = 12,
): Promise<{ events: SceneEvent[] }> {
  const params = new URLSearchParams({ city, genre, limit: String(limit) })
  return v1Fetch(`/events/scene?${params}`, { auth: 'optional' })
}

export async function v1GetCollabPost(postId: string): Promise<{ post: CollabBoardPost | null }> {
  const params = new URLSearchParams({ postId })
  return v1Fetch(`/collab/post?${params}`, { auth: 'optional' })
}

export async function v1GetCollabResponses(postId: string): Promise<{ responses: CollabResponse[] }> {
  const params = new URLSearchParams({ postId })
  return v1Fetch(`/collab/responses?${params}`, { auth: 'optional' })
}

export async function v1RespondCollabPost(input: {
  postId: string
  message: string
}): Promise<{ id: string }> {
  return v1Fetch('/collab/respond', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1AcceptCollabResponse(responseId: string): Promise<void> {
  await v1Fetch('/collab/accept', { method: 'POST', body: JSON.stringify({ responseId }) })
}

export async function v1ConfirmCollabComplete(postId: string): Promise<void> {
  await v1Fetch('/collab/complete', { method: 'POST', body: JSON.stringify({ postId }) })
}

export async function v1GetCollabProfileSkills(handle: string): Promise<{ skills: string[] }> {
  const params = new URLSearchParams({ handle })
  return v1Fetch(`/collab/skills?${params}`, { auth: 'optional' })
}

export async function v1SetCollabProfileSkills(skillSlugs: string[]): Promise<void> {
  await v1Fetch('/collab/skills', { method: 'PUT', body: JSON.stringify({ skillSlugs }) })
}

export async function v1GetCollabCompletedCount(userId: string): Promise<{ count: number }> {
  const params = new URLSearchParams({ userId })
  return v1Fetch(`/collab/completed-count?${params}`, { auth: 'optional' })
}

export async function v1AwardDb(input: AwardDbInput): Promise<{ awarded: boolean }> {
  return v1Fetch('/community/award-db', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1GrantBadge(slug: string): Promise<{ granted: boolean }> {
  return v1Fetch('/community/grant-badge', { method: 'POST', body: JSON.stringify({ slug }) })
}

export async function v1GetWeeklyChallenges(): Promise<{ challenges: WeeklyChallenge[] }> {
  return v1Fetch('/community/challenges')
}

export async function v1EvaluateWeeklyChallenges(): Promise<{ granted: number }> {
  return v1Fetch('/community/challenges/evaluate', { method: 'POST', body: '{}' })
}

export async function v1GetFridayWire(): Promise<{ wire: FridayWire | null }> {
  return v1Fetch('/community/wire/friday', { auth: 'optional' })
}

export async function v1GetTribeWarMonthly(): Promise<{ standings: TribeWarStanding[] }> {
  return v1Fetch('/community/wire/tribe-war', { auth: 'optional' })
}

export async function v1GetCrewWarsV2(limit = 15): Promise<{ entries: CrewWarsEntry[] }> {
  const params = new URLSearchParams({ limit: String(limit) })
  return v1Fetch(`/community/wire/crew-wars?${params}`, { auth: 'optional' })
}

export async function v1GetWireDigest(): Promise<{ digest: WireDigest | null }> {
  return v1Fetch('/community/wire/digest', { auth: 'optional' })
}

export async function v1GetSpinOfTheWeek(): Promise<{ spin: SpinOfTheWeek | null }> {
  return v1Fetch('/community/wire/spin-of-week', { auth: 'optional' })
}

export async function v1GetTribeRecentSpins(
  genre: string,
  limit = 3,
): Promise<{ posts: CommunityFeedPost[] }> {
  const params = new URLSearchParams({ genre, limit: String(limit) })
  return v1Fetch(`/community/wire/tribe-spins?${params}`, { auth: 'optional' })
}

export async function v1GetEditorWirePicks(limit = 12): Promise<{ picks: EditorWirePick[] }> {
  const params = new URLSearchParams({ limit: String(limit) })
  return v1Fetch(`/community/wire/editor-picks?${params}`, { auth: 'optional' })
}

export async function v1GetArtistAnalyticsEvents(
  profileId: string,
): Promise<{ events: StoredAnalyticsEvent[] }> {
  const params = new URLSearchParams({ profileId })
  return v1Fetch(`/analytics/artist-events?${params}`)
}

export async function v1PostArtistAnalyticsEvent(input: {
  profileId: string
  eventType: 'profile_view' | 'track_click'
  trackId?: string
}): Promise<void> {
  await v1Fetch('/analytics/artist-events', {
    method: 'POST',
    body: JSON.stringify(input),
    auth: 'optional',
  })
}

export async function v1GetSuperAdminAnalytics(): Promise<{ analytics: SuperAdminAnalytics }> {
  return v1Fetch('/desk/analytics')
}

export async function v1GetMyEditorApplication(): Promise<{ application: EditorApplication | null }> {
  return v1Fetch('/editor-applications/mine')
}

export async function v1ListEditorApplications(): Promise<{ applications: EditorApplicationWithProfile[] }> {
  return v1Fetch('/editor-applications')
}

export async function v1SubmitEditorApplication(
  input: SubmitEditorApplicationInput,
): Promise<{ application: EditorApplication }> {
  return v1Fetch('/editor-applications', { method: 'POST', body: JSON.stringify(input) })
}

export async function v1ApproveEditorApplication(applicationId: string): Promise<void> {
  await v1Fetch('/editor-applications/approve', {
    method: 'POST',
    body: JSON.stringify({ applicationId }),
  })
}

export async function v1RejectEditorApplication(
  applicationId: string,
  notes?: string,
): Promise<void> {
  await v1Fetch('/editor-applications/reject', {
    method: 'POST',
    body: JSON.stringify({ applicationId, notes }),
  })
}

export async function v1AckEditorCongratulations(): Promise<void> {
  await v1Fetch('/editor-applications/ack', { method: 'POST', body: '{}' })
}

export async function v1UpdateEditorialLinkedPost(
  draftId: string,
  postId: string | null,
): Promise<void> {
  await v1Fetch('/editorial/linked-post', {
    method: 'PATCH',
    body: JSON.stringify({ draftId, postId }),
  })
}
