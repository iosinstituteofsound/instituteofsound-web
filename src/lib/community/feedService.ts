import {
  v1CreateDropPost,
  v1CreateSpinPost,
  v1GetCommunityFeed,
  v1GetCommunityPost,
  v1HideCommunityPost,
  v1TogglePostReaction,
  v1UpdateDropPost,
  v1UpdateSpinPost,
} from '@/api/v1Client'
import { touchArtistPageActivity } from '@/lib/artist-profile/pageEnforcement'
import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { parseSpotifyUrl, parseYouTubeUrl, validateSpinInput } from '@/lib/community/musicLinks'
import {
  localAddFeedPost,
  localApplyReactions,
  localHideFeedPost,
  localListFeed,
  localToggleReaction,
  localUpdateFeedPost,
} from '@/lib/community/localFeed'
import { localCommentCount } from '@/lib/community/localComments'
import { evaluateWeeklyChallenges } from '@/lib/community/challengeService'
import { getLocalFollowingIds } from '@/lib/community/followService'
import { tryGrantBadge } from '@/lib/community/grantBadge'
import type { CommunityFeedPost, FeedReactionKind } from '@/lib/community/feedTypes'
import type { CommunityRank } from '@/types'

export type { CommunityFeedPost, CommunityPostKind } from '@/lib/community/feedTypes'
export const COMMUNITY_FEED_EVENT = 'ios-community-feed-change'

const emptyReactions = () => ({ fire: 0, headphones: 0, bolt: 0 })

export type { FeedRow } from '@/lib/community/feedRow'
export { mapFeedRow } from '@/lib/community/feedRow'

function notifyFeed() {
  window.dispatchEvent(new Event(COMMUNITY_FEED_EVENT))
}

export interface CommunityFeedCursor {
  createdAt: string
  id: string
}

export interface CommunityFeedQuery {
  limit?: number
  kind?: 'spin' | 'drop' | null
  genreSlug?: string | null
  followingOnly?: boolean
  viewerUserId?: string | null
  cursor?: CommunityFeedCursor | null
}

function isBeforeFeedCursor(
  post: { createdAt: string; id: string },
  cursor: CommunityFeedCursor
): boolean {
  const postMs = new Date(post.createdAt).getTime()
  const cursorMs = new Date(cursor.createdAt).getTime()
  if (postMs !== cursorMs) return postMs < cursorMs
  return post.id < cursor.id
}

export async function fetchCommunityFeed(
  limitOrQuery: number | CommunityFeedQuery = 30
): Promise<CommunityFeedPost[]> {
  const query: CommunityFeedQuery =
    typeof limitOrQuery === 'number' ? { limit: limitOrQuery } : limitOrQuery
  const limit = query.limit ?? 30
  const kind = query.kind ?? null
  const genreSlug = query.genreSlug ?? null
  const followingOnly = query.followingOnly ?? false
  const viewerUserId = query.viewerUserId ?? null
  const cursor = query.cursor ?? null

  if (!isSupabaseConfigured()) {
    let posts = localApplyReactions(
      localListFeed(200).map((p) => ({
        ...p,
        reactions: p.reactions ?? emptyReactions(),
      }))
    )
    if (followingOnly) {
      const following = new Set(getLocalFollowingIds())
      posts = posts.filter(
        (p) =>
          p.userId === viewerUserId ||
          following.has(p.userId)
      )
    }
    if (kind) posts = posts.filter((p) => p.kind === kind)
    if (genreSlug) posts = posts.filter((p) => p.primaryGenreSlug === genreSlug)
    posts = posts
      .map((p) => ({ ...p, commentCount: localCommentCount(p.id) }))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
          b.id.localeCompare(a.id)
      )
    if (cursor) posts = posts.filter((p) => isBeforeFeedCursor(p, cursor))
    return posts.slice(0, limit)
  }

  try {
    const { posts } = await v1GetCommunityFeed(query)
    return posts
  } catch (err) {
    console.warn('[community] feed api', err instanceof Error ? err.message : err)
    return []
  }
}

export interface CreateSpinInput {
  userId: string
  displayName: string
  handle: string
  avatarUrl?: string
  rank: CommunityRank
  primaryGenreSlug?: string
  primaryGenreId?: string
  spotifyRaw: string
  youtubeRaw: string
  caption?: string
  trackTitle?: string
  imageUrl?: string
  artistProfileIds?: string[]
}

export async function createSpinPost(input: CreateSpinInput): Promise<CommunityFeedPost> {
  const { spotify, youtube, error } = validateSpinInput(input.spotifyRaw, input.youtubeRaw)
  if (error) throw new Error(error)

  const body = input.caption?.trim().slice(0, 280) || null
  const trackTitle = input.trackTitle?.trim().slice(0, 120) || null
  const imageUrl = input.imageUrl?.trim() || null

  if (!isSupabaseConfigured()) {
    const post: CommunityFeedPost = {
      id: crypto.randomUUID(),
      kind: 'spin',
      body: body ?? undefined,
      spotifyUrl: spotify?.url,
      youtubeUrl: youtube?.url,
      trackTitle: trackTitle ?? undefined,
      imageUrl: imageUrl ?? undefined,
      createdAt: new Date().toISOString(),
      userId: input.userId,
      displayName: input.displayName,
      handle: input.handle,
      avatarUrl: input.avatarUrl,
      rank: input.rank,
      primaryGenreSlug: input.primaryGenreSlug,
      status: 'visible',
      reactions: emptyReactions(),
    }
    localAddFeedPost(post)
    void tryGrantBadge('first_spin')
    void touchArtistPageActivity(input.userId)
    notifyFeed()
    void evaluateWeeklyChallenges()
    return post
  }

  const { post } = await v1CreateSpinPost({
    spotifyRaw: input.spotifyRaw,
    youtubeRaw: input.youtubeRaw,
    caption: input.caption,
    trackTitle: input.trackTitle,
    imageUrl: input.imageUrl,
    primaryGenreId: input.primaryGenreId,
    artistProfileIds: input.artistProfileIds,
  })
  void tryGrantBadge('first_spin')
  void evaluateWeeklyChallenges()
  notifyFeed()
  return post
}

export interface CreateDropInput {
  userId: string
  displayName: string
  handle: string
  avatarUrl?: string
  rank: CommunityRank
  primaryGenreSlug?: string
  primaryGenreId?: string
  text: string
  imageUrl?: string
  linkUrl?: string
  linkTitle?: string
  linkDescription?: string
  linkImageUrl?: string
  artistProfileIds?: string[]
}

export async function createDropPost(input: CreateDropInput): Promise<CommunityFeedPost> {
  const text = input.text.trim()
  const imageUrl = input.imageUrl?.trim() || null
  const linkUrl = input.linkUrl?.trim() || null
  if (text.length < 1 && !imageUrl && !linkUrl) {
    throw new Error('Write something, add a photo, or paste a link.')
  }
  if (text.length > 280) throw new Error('Max 280 characters.')
  const body = text.length > 0 ? text : null

  if (!isSupabaseConfigured()) {
    const post: CommunityFeedPost = {
      id: crypto.randomUUID(),
      kind: 'drop',
      body: body ?? undefined,
      imageUrl: imageUrl ?? undefined,
      linkUrl: linkUrl ?? undefined,
      linkTitle: input.linkTitle?.trim() || undefined,
      linkDescription: input.linkDescription?.trim() || undefined,
      linkImageUrl: input.linkImageUrl?.trim() || undefined,
      createdAt: new Date().toISOString(),
      userId: input.userId,
      displayName: input.displayName,
      handle: input.handle,
      avatarUrl: input.avatarUrl,
      rank: input.rank,
      primaryGenreSlug: input.primaryGenreSlug,
      status: 'visible',
      reactions: emptyReactions(),
    }
    localAddFeedPost(post)
    void tryGrantBadge('first_drop')
    void touchArtistPageActivity(input.userId)
    notifyFeed()
    void evaluateWeeklyChallenges()
    return post
  }

  const { post } = await v1CreateDropPost({
    text,
    imageUrl: imageUrl ?? undefined,
    linkUrl: linkUrl ?? undefined,
    linkTitle: input.linkTitle,
    linkDescription: input.linkDescription,
    linkImageUrl: input.linkImageUrl,
    primaryGenreId: input.primaryGenreId,
    artistProfileIds: input.artistProfileIds,
  })
  void tryGrantBadge('first_drop')
  void evaluateWeeklyChallenges()
  notifyFeed()
  return post
}

export async function togglePostReaction(
  postId: string,
  userId: string,
  reaction: FeedReactionKind
): Promise<FeedReactionKind | null> {
  if (!isSupabaseConfigured()) {
    const result = localToggleReaction(postId, userId, reaction)
    notifyFeed()
    return result
  }

  const { myReaction } = await v1TogglePostReaction(postId, reaction)
  notifyFeed()
  return myReaction
}

export interface UpdateDropInput {
  postId: string
  userId: string
  text: string
}

export async function updateDropPost(input: UpdateDropInput): Promise<void> {
  const text = input.text.trim()
  const postId = input.postId.trim()
  if (!postId) throw new Error('Invalid post.')

  if (!isSupabaseConfigured()) {
    const posts = localListFeed(100)
    const existing = posts.find((p) => p.id === postId)
    if (!existing || existing.userId !== input.userId) {
      throw new Error('Post not found.')
    }
    const imageUrl = existing.imageUrl
    const linkUrl = existing.linkUrl
    if (text.length < 1 && !imageUrl && !linkUrl) {
      throw new Error('Add some text before saving.')
    }
    if (text.length > 280) throw new Error('Max 280 characters.')
    if (!localUpdateFeedPost(postId, input.userId, { body: text || undefined })) {
      throw new Error('Could not update post.')
    }
    notifyFeed()
    return
  }

  await v1UpdateDropPost(postId, text)
  notifyFeed()
}

export interface UpdateSpinInput {
  postId: string
  userId: string
  caption?: string
  trackTitle?: string
  spotifyRaw?: string
  youtubeRaw?: string
}

export async function updateSpinPost(input: UpdateSpinInput): Promise<void> {
  const postId = input.postId.trim()
  if (!postId) throw new Error('Invalid post.')

  const { spotify, youtube, error: validationError } = validateSpinInput(
    input.spotifyRaw ?? '',
    input.youtubeRaw ?? ''
  )
  if (validationError) throw new Error(validationError)

  const caption = input.caption?.trim().slice(0, 280) || ''
  const trackTitle = input.trackTitle?.trim().slice(0, 120) || ''

  if (!isSupabaseConfigured()) {
    const ok = localUpdateFeedPost(postId, input.userId, {
      body: caption || undefined,
      trackTitle: trackTitle || undefined,
      spotifyUrl: spotify?.url,
      youtubeUrl: youtube?.url,
    })
    if (!ok) throw new Error('Post not found.')
    notifyFeed()
    return
  }

  await v1UpdateSpinPost({
    postId,
    caption,
    trackTitle,
    spotifyRaw: input.spotifyRaw,
    youtubeRaw: input.youtubeRaw,
  })
  notifyFeed()
}

export async function hideCommunityPost(postId: string, actorUserId: string): Promise<void> {
  if (!postId?.trim()) throw new Error('Invalid post.')
  if (!actorUserId?.trim()) throw new Error('Sign in to remove posts.')

  if (!isSupabaseConfigured()) {
    const ok = localHideFeedPost(postId, actorUserId)
    if (!ok) throw new Error('Could not remove this post.')
    notifyFeed()
    return
  }

  await v1HideCommunityPost(postId)
  notifyFeed()
}

export function getEmbedForPost(post: CommunityFeedPost) {
  if (post.spotifyUrl) return parseSpotifyUrl(post.spotifyUrl)
  if (post.youtubeUrl) return parseYouTubeUrl(post.youtubeUrl)
  return null
}

export async function fetchCommunityPostById(
  postId: string
): Promise<CommunityFeedPost | null> {
  if (!postId?.trim()) return null

  if (!isSupabaseConfigured()) {
    const post = localApplyReactions(localListFeed(50)).find((p) => p.id === postId)
    if (!post) return null
    return { ...post, commentCount: localCommentCount(postId) }
  }

  try {
    const { post } = await v1GetCommunityPost(postId)
    return post
  } catch (err) {
    console.warn('[community] feed post api', err instanceof Error ? err.message : err)
    return null
  }
}
