import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { ArtistProfile, UpsertArtistProfileInput } from '@/lib/artist-profile/types'
import type {
  CommunityFeedPost,
  FeedReactionKind,
} from '@/lib/community/feedTypes'
import type { CommunityFeedQuery } from '@/lib/community/feedService'
import type { CreateDropInput, CreateSpinInput } from '@/lib/community/feedService'
import type { User } from '@/lib/auth/types'
import type {
  RelationshipClaim,
  RelationshipClaimType,
  RoleVerificationRequest,
  SubmitRoleVerificationInput,
} from '@/lib/verification/types'
import type {
  PlaylistCuratorApplication,
  SubmitPlaylistCuratorInput,
} from '@/lib/playlistCurator/types'
import type {
  ArtistPageRecoveryRequest,
  ArtistProfileArchive,
  DeletedArtistPageRow,
} from '@/lib/artist-page-recovery/types'
import type {
  PublicMemberProfile,
  MemberActivityItem,
  MemberConnectionProfile,
} from '@/lib/community/memberProfileService'
import type { NetworkPendingRequest, NetworkPersonCard } from '@/lib/network/connectionTypes'
import type { PublicUserCrew, CrewRosterMember } from '@/lib/community/crewTypes'

export function isV1ApiEnabled(): boolean {
  const flag = import.meta.env.VITE_USE_V1_API?.trim().toLowerCase()
  return flag === '1' || flag === 'true' || flag === 'yes'
}

async function tryAccessToken(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  return data.session?.access_token ?? null
}

async function v1Fetch<T>(
  path: string,
  init?: RequestInit & { auth?: 'required' | 'optional' | 'none' },
): Promise<T> {
  const mode = init?.auth ?? 'required'
  const token = mode === 'none' ? null : await tryAccessToken()

  if (mode === 'required' && !token) {
    throw new Error('Sign in required')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const { auth: _auth, ...fetchInit } = init ?? {}
  const res = await fetch(`/api/v1${path}`, { ...fetchInit, headers })
  const body = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) {
    throw new Error(body.error ?? `Request failed (${res.status})`)
  }
  return body as T
}

export async function v1GetMe(): Promise<{ user: User }> {
  return v1Fetch('/me')
}

export async function v1GetArtistProfile(): Promise<{ profile: ArtistProfile | null }> {
  return v1Fetch('/artist/profile')
}

export async function v1PutArtistProfile(
  profile: UpsertArtistProfileInput,
): Promise<{ profile: ArtistProfile }> {
  return v1Fetch('/artist/profile', {
    method: 'PUT',
    body: JSON.stringify({ profile }),
  })
}

function feedQueryString(query: CommunityFeedQuery): string {
  const params = new URLSearchParams()
  params.set('limit', String(query.limit ?? 30))
  if (query.kind) params.set('kind', query.kind)
  if (query.genreSlug) params.set('genreSlug', query.genreSlug)
  if (query.followingOnly) params.set('followingOnly', 'true')
  if (query.cursor?.createdAt) params.set('cursorCreatedAt', query.cursor.createdAt)
  if (query.cursor?.id) params.set('cursorId', query.cursor.id)
  return params.toString()
}

export async function v1GetCommunityFeed(
  query: CommunityFeedQuery,
): Promise<{ posts: CommunityFeedPost[] }> {
  return v1Fetch(`/community/feed?${feedQueryString(query)}`, { auth: 'optional' })
}

export async function v1GetCommunityPost(
  postId: string,
): Promise<{ post: CommunityFeedPost | null }> {
  const params = new URLSearchParams({ postId })
  return v1Fetch(`/community/feed?${params}`, { auth: 'optional' })
}

export async function v1CreateSpinPost(
  input: Pick<
    CreateSpinInput,
    'spotifyRaw' | 'youtubeRaw' | 'caption' | 'trackTitle' | 'imageUrl' | 'primaryGenreId'
  >,
): Promise<{ post: CommunityFeedPost }> {
  return v1Fetch('/community/spins', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function v1CreateDropPost(
  input: Pick<
    CreateDropInput,
    | 'text'
    | 'imageUrl'
    | 'linkUrl'
    | 'linkTitle'
    | 'linkDescription'
    | 'linkImageUrl'
    | 'primaryGenreId'
  >,
): Promise<{ post: CommunityFeedPost }> {
  return v1Fetch('/community/drops', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function v1TogglePostReaction(
  postId: string,
  reaction: FeedReactionKind,
): Promise<{ myReaction: FeedReactionKind | null }> {
  return v1Fetch('/community/reactions', {
    method: 'POST',
    body: JSON.stringify({ postId, reaction }),
  })
}

export async function v1UpdateDropPost(postId: string, text: string): Promise<void> {
  await v1Fetch('/community/drops', {
    method: 'PATCH',
    body: JSON.stringify({ postId, text }),
  })
}

export async function v1UpdateSpinPost(input: {
  postId: string
  caption?: string
  trackTitle?: string
  spotifyRaw?: string
  youtubeRaw?: string
}): Promise<void> {
  await v1Fetch('/community/spin', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function v1HideCommunityPost(postId: string): Promise<void> {
  await v1Fetch('/community/post', {
    method: 'DELETE',
    body: JSON.stringify({ postId }),
  })
}

export async function v1GetMyVerificationRequests(): Promise<{
  requests: RoleVerificationRequest[]
}> {
  return v1Fetch('/verification/requests')
}

export async function v1SubmitRoleVerification(
  input: SubmitRoleVerificationInput,
): Promise<void> {
  await v1Fetch('/verification/requests', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function v1ListVerificationDeskRequests(): Promise<{
  requests: RoleVerificationRequest[]
}> {
  return v1Fetch('/verification/desk/requests')
}

export async function v1ReviewVerificationRequest(input: {
  requestId: string
  decision: 'approved' | 'rejected'
  notes?: string
}): Promise<void> {
  await v1Fetch('/verification/desk/requests', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function v1CreateRelationshipClaim(input: {
  claimType: RelationshipClaimType
  targetHandle: string
  evidenceLinks: string[]
  note?: string
}): Promise<void> {
  await v1Fetch('/verification/claims', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function v1ListIncomingClaims(): Promise<{ claims: RelationshipClaim[] }> {
  return v1Fetch('/verification/claims/incoming')
}

export async function v1ListOutgoingClaims(): Promise<{ claims: RelationshipClaim[] }> {
  return v1Fetch('/verification/claims/outgoing')
}

export async function v1RespondToClaim(input: {
  claimId: string
  decision: 'approved' | 'rejected'
}): Promise<void> {
  await v1Fetch('/verification/claims', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function v1GetMyPlaylistCuratorApplications(): Promise<{
  applications: PlaylistCuratorApplication[]
}> {
  return v1Fetch('/playlist-curator/applications')
}

export async function v1SubmitPlaylistCuratorApplication(
  input: SubmitPlaylistCuratorInput,
): Promise<void> {
  await v1Fetch('/playlist-curator/applications', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function v1ListPlaylistCuratorDeskApplications(): Promise<{
  applications: PlaylistCuratorApplication[]
}> {
  return v1Fetch('/playlist-curator/desk/applications')
}

export async function v1ReviewPlaylistCuratorApplication(input: {
  applicationId: string
  decision: 'approved' | 'rejected'
  notes?: string
}): Promise<void> {
  await v1Fetch('/playlist-curator/desk/applications', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function v1GetLatestDeletedArchive(): Promise<{
  archive: ArtistProfileArchive | null
}> {
  return v1Fetch('/artist-recovery/archive')
}

export async function v1GetOwnRecoveryRequest(
  archiveId: string,
): Promise<{ request: ArtistPageRecoveryRequest | null }> {
  const params = new URLSearchParams({ archiveId })
  return v1Fetch(`/artist-recovery/request?${params}`)
}

export async function v1SubmitArtistPageRecoveryRequest(input: {
  archiveId: string
  govIdDocumentUrl: string
  applicantNote?: string
}): Promise<{ request: ArtistPageRecoveryRequest }> {
  return v1Fetch('/artist-recovery/requests', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function v1ListDeletedArtistPagesDesk(): Promise<{
  pages: DeletedArtistPageRow[]
}> {
  return v1Fetch('/artist-recovery/desk/deleted-pages')
}

export async function v1ReviewArtistPageRecoveryRequest(input: {
  requestId: string
  decision: 'approved' | 'rejected'
  reviewNotes?: string
}): Promise<void> {
  await v1Fetch('/artist-recovery/desk/requests', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

// —— Network profile (reads) ——

export async function v1GetNetworkProfile(handle: string): Promise<{ profile: PublicMemberProfile | null }> {
  const params = new URLSearchParams({ handle })
  return v1Fetch(`/network/profile?${params}`, { auth: 'optional' })
}

export async function v1GetNetworkProfilePosts(
  handle: string,
  limit = 50,
): Promise<{ posts: CommunityFeedPost[] }> {
  const params = new URLSearchParams({ handle, limit: String(limit) })
  return v1Fetch(`/network/profile/posts?${params}`, { auth: 'optional' })
}

export async function v1GetNetworkProfileActivity(
  handle: string,
  limit = 40,
): Promise<{ activity: MemberActivityItem[] }> {
  const params = new URLSearchParams({ handle, limit: String(limit) })
  return v1Fetch(`/network/profile/activity?${params}`, { auth: 'optional' })
}

export async function v1GetNetworkProfileFollowers(
  handle: string,
  limit = 80,
): Promise<{ connections: MemberConnectionProfile[] }> {
  const params = new URLSearchParams({ handle, limit: String(limit) })
  return v1Fetch(`/network/profile/followers?${params}`, { auth: 'optional' })
}

export async function v1GetNetworkProfileFollowing(
  handle: string,
  limit = 80,
): Promise<{ connections: MemberConnectionProfile[] }> {
  const params = new URLSearchParams({ handle, limit: String(limit) })
  return v1Fetch(`/network/profile/following?${params}`, { auth: 'optional' })
}

export async function v1GetNetworkProfileArtist(
  userId: string,
): Promise<{ artist: { id: string; slug: string } | null }> {
  const params = new URLSearchParams({ userId })
  return v1Fetch(`/network/profile/artist?${params}`, { auth: 'optional' })
}

export async function v1GetNetworkProfileCrew(
  userId: string,
): Promise<{ crew: PublicUserCrew | null }> {
  const params = new URLSearchParams({ userId })
  return v1Fetch(`/network/profile/crew?${params}`, { auth: 'optional' })
}

export async function v1GetNetworkCrewRoster(crewId: string): Promise<{ roster: CrewRosterMember[] }> {
  const params = new URLSearchParams({ crewId })
  return v1Fetch(`/network/crew/roster?${params}`, { auth: 'optional' })
}

// —— Network connections ——

export async function v1SendConnectionRequest(targetUserId: string): Promise<void> {
  await v1Fetch('/network/connections/request', {
    method: 'POST',
    body: JSON.stringify({ targetUserId }),
  })
}

export async function v1RespondConnectionRequest(requestId: string, accept: boolean): Promise<void> {
  await v1Fetch('/network/connections/request', {
    method: 'PATCH',
    body: JSON.stringify({ requestId, accept }),
  })
}

export async function v1RemoveConnection(targetUserId: string): Promise<void> {
  await v1Fetch('/network/connections', {
    method: 'DELETE',
    body: JSON.stringify({ targetUserId }),
  })
}

export async function v1GetConnectionsList(
  userId: string,
): Promise<{ connections: Pick<NetworkPersonCard, 'userId' | 'displayName' | 'handle' | 'avatarUrl'>[] }> {
  const params = new URLSearchParams({ userId })
  return v1Fetch(`/network/connections?${params}`, { auth: 'optional' })
}

export async function v1GetMutualConnections(
  targetUserId: string,
  limit = 12,
): Promise<{
  mutuals: Pick<NetworkPersonCard, 'userId' | 'displayName' | 'handle' | 'avatarUrl'>[]
}> {
  const params = new URLSearchParams({ targetUserId, limit: String(limit) })
  return v1Fetch(`/network/connections/mutual?${params}`, { auth: 'optional' })
}

export async function v1GetIncomingConnectionRequestId(
  fromUserId: string,
): Promise<{ requestId: string | null }> {
  const params = new URLSearchParams({ fromUserId })
  return v1Fetch(`/network/connections/incoming?${params}`)
}

export async function v1GetPendingConnectionRequests(): Promise<{ requests: NetworkPendingRequest[] }> {
  return v1Fetch('/network/requests/pending')
}

export async function v1SearchNetworkPeople(
  query: string,
  limit = 24,
): Promise<{ people: NetworkPersonCard[] }> {
  const params = new URLSearchParams({ q: query, limit: String(limit) })
  return v1Fetch(`/network/people/search?${params}`, { auth: 'optional' })
}

export async function v1GetSuggestedPeople(limit = 6): Promise<{ people: NetworkPersonCard[] }> {
  const params = new URLSearchParams({ limit: String(limit) })
  return v1Fetch(`/network/people/suggested?${params}`, { auth: 'optional' })
}
