import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { ArtistProfile, UpsertArtistProfileInput } from '@/lib/artist-profile/types'
import type {
  CommunityFeedPost,
  FeedReactionKind,
} from '@/lib/community/feedTypes'
import type { CommunityFeedQuery } from '@/lib/community/feedService'
import type { CreateDropInput, CreateSpinInput } from '@/lib/community/feedService'
import type { User } from '@/lib/auth/types'

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
