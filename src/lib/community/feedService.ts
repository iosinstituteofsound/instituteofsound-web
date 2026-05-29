import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { awardDb } from '@/lib/community/awardDb'
import { parseSpotifyUrl, parseYouTubeUrl, validateSpinInput } from '@/lib/community/musicLinks'
import {
  localAddFeedPost,
  localApplyReactions,
  localHideFeedPost,
  localListFeed,
  localToggleReaction,
} from '@/lib/community/localFeed'
import { localCommentCount } from '@/lib/community/localComments'
import { evaluateWeeklyChallenges } from '@/lib/community/challengeService'
import { getCommunityGenreId } from '@/lib/community/genreContext'
import { getLocalFollowingIds } from '@/lib/community/followService'
import { tryGrantBadge } from '@/lib/community/grantBadge'
import type { CommunityFeedPost, CommunityPostKind, FeedReactionKind } from '@/lib/community/feedTypes'
import type { CommunityRank } from '@/types'

export type { CommunityFeedPost, CommunityPostKind } from '@/lib/community/feedTypes'
export const COMMUNITY_FEED_EVENT = 'ios-community-feed-change'

const SPIN_DB = 10
const DROP_DB = 5

const emptyReactions = () => ({ fire: 0, headphones: 0, bolt: 0 })

function isMissingLinkColumnError(message: string): boolean {
  return /link_url|link_title|link_description|link_image_url|column.*does not exist/i.test(
    message
  )
}

function friendlyPostError(message: string): string {
  if (isMissingLinkColumnError(message)) {
    return 'Link posts need the latest database migration (053). Run it in Supabase SQL editor, then try again.'
  }
  if (/community_posts_drop_requires_content|check constraint/i.test(message)) {
    return 'Add some text, a photo, or a valid link before posting.'
  }
  return message
}

export type FeedRow = {
  id: string
  kind: string
  body: string | null
  spotify_url: string | null
  youtube_url: string | null
  track_title: string | null
  image_url?: string | null
  link_url?: string | null
  link_title?: string | null
  link_description?: string | null
  link_image_url?: string | null
  created_at: string
  user_id: string
  display_name: string
  handle: string
  avatar_url: string | null
  community_rank: string
  primary_genre_slug: string | null
  reactions_fire?: number | string
  reactions_headphones?: number | string
  reactions_bolt?: number | string
  my_reaction?: string | null
  comment_count?: number | string
}

export function mapFeedRow(row: FeedRow): CommunityFeedPost {
  return mapRow(row)
}

function mapRow(row: FeedRow): CommunityFeedPost {
  return {
    id: row.id,
    kind: row.kind as CommunityPostKind,
    body: row.body ?? undefined,
    spotifyUrl: row.spotify_url ?? undefined,
    youtubeUrl: row.youtube_url ?? undefined,
    trackTitle: row.track_title ?? undefined,
    imageUrl: row.image_url ?? undefined,
    linkUrl: row.link_url ?? undefined,
    linkTitle: row.link_title ?? undefined,
    linkDescription: row.link_description ?? undefined,
    linkImageUrl: row.link_image_url ?? undefined,
    createdAt: row.created_at,
    userId: row.user_id,
    displayName: row.display_name,
    handle: row.handle.startsWith('@') ? row.handle : `@${row.handle}`,
    avatarUrl: row.avatar_url ?? undefined,
    rank: row.community_rank as CommunityRank,
    primaryGenreSlug: row.primary_genre_slug ?? undefined,
    status: 'visible',
    reactions: {
      fire: Number(row.reactions_fire ?? 0),
      headphones: Number(row.reactions_headphones ?? 0),
      bolt: Number(row.reactions_bolt ?? 0),
    },
    myReaction: (row.my_reaction as FeedReactionKind | null) ?? null,
    commentCount: Number(row.comment_count ?? 0),
  }
}

function notifyFeed() {
  window.dispatchEvent(new Event(COMMUNITY_FEED_EVENT))
}

export interface CommunityFeedQuery {
  limit?: number
  kind?: 'spin' | 'drop' | null
  genreSlug?: string | null
  followingOnly?: boolean
  viewerUserId?: string | null
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

  if (!isSupabaseConfigured()) {
    let posts = localApplyReactions(
      localListFeed(limit * 2).map((p) => ({
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
    return posts
      .map((p) => ({ ...p, commentCount: localCommentCount(p.id) }))
      .slice(0, limit)
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_feed', {
    lim: limit,
    p_kind: kind,
    p_genre_slug: genreSlug,
    p_following_only: followingOnly,
  })

  if (error) {
    console.warn('[community] feed', error.message)
    if (/link_url|link_title|comment_count|does not exist/i.test(error.message)) {
      console.warn(
        '[community] feed RPC may be out of date — run migrations 051–053 in Supabase SQL editor.'
      )
    }
    return []
  }

  return (data ?? []).map(mapRow)
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
    notifyFeed()
    void evaluateWeeklyChallenges()
    return post
  }

  const supabase = getSupabase()
  const { data, error: insertError } = await supabase
    .from('community_posts')
    .insert({
      user_id: input.userId,
      kind: 'spin',
      body,
      spotify_url: spotify?.url ?? null,
      youtube_url: youtube?.url ?? null,
      track_title: trackTitle,
      image_url: imageUrl,
    })
    .select('id, created_at')
    .single()

  if (insertError) throw new Error(insertError.message)

  const awarded = await awardDb({
    userId: input.userId,
    source: 'spin_post',
    sourceId: data.id,
    amount: SPIN_DB,
    genreId: input.primaryGenreId ?? getCommunityGenreId(),
  })

  if (awarded) void tryGrantBadge('first_spin')
  void evaluateWeeklyChallenges()
  notifyFeed()

  return {
    id: data.id,
    kind: 'spin',
    body: body ?? undefined,
    spotifyUrl: spotify?.url,
    youtubeUrl: youtube?.url,
    trackTitle: trackTitle ?? undefined,
    imageUrl: imageUrl ?? undefined,
    createdAt: data.created_at,
    userId: input.userId,
    displayName: input.displayName,
    handle: input.handle,
    avatarUrl: input.avatarUrl,
    rank: input.rank,
    primaryGenreSlug: input.primaryGenreSlug,
    status: 'visible',
    reactions: emptyReactions(),
  }
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
    notifyFeed()
    void evaluateWeeklyChallenges()
    return post
  }

  const supabase = getSupabase()
  const linkTitle = input.linkTitle?.trim() || null
  const linkDescription = input.linkDescription?.trim() || null
  const linkImageUrl = input.linkImageUrl?.trim() || null

  const fullInsert = {
    user_id: input.userId,
    kind: 'drop' as const,
    body,
    image_url: imageUrl,
    link_url: linkUrl,
    link_title: linkTitle,
    link_description: linkDescription,
    link_image_url: linkImageUrl,
  }

  let result = await supabase.from('community_posts').insert(fullInsert).select('id, created_at').single()

  if (result.error && linkUrl && isMissingLinkColumnError(result.error.message)) {
    const fallbackBody =
      body && linkUrl && !body.includes(linkUrl) ? `${body}\n\n${linkUrl}` : body || linkUrl
    result = await supabase
      .from('community_posts')
      .insert({
        user_id: input.userId,
        kind: 'drop',
        body: fallbackBody,
        image_url: imageUrl,
      })
      .select('id, created_at')
      .single()
  }

  const { data, error } = result
  if (error) {
    throw new Error(friendlyPostError(error.message))
  }

  const awarded = await awardDb({
    userId: input.userId,
    source: 'drop_post',
    sourceId: data.id,
    amount: DROP_DB,
    genreId: input.primaryGenreId ?? getCommunityGenreId(),
  })

  if (awarded) void tryGrantBadge('first_drop')
  void evaluateWeeklyChallenges()
  notifyFeed()

  return {
    id: data.id,
    kind: 'drop',
    body: body ?? undefined,
    imageUrl: imageUrl ?? undefined,
    linkUrl: linkUrl ?? undefined,
    linkTitle: input.linkTitle?.trim() || undefined,
    linkDescription: input.linkDescription?.trim() || undefined,
    linkImageUrl: input.linkImageUrl?.trim() || undefined,
    createdAt: data.created_at,
    userId: input.userId,
    displayName: input.displayName,
    handle: input.handle,
    avatarUrl: input.avatarUrl,
    rank: input.rank,
    primaryGenreSlug: input.primaryGenreSlug,
    status: 'visible',
    reactions: emptyReactions(),
  }
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

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_toggle_post_reaction', {
    p_post_id: postId,
    p_reaction: reaction,
  })

  if (error) throw new Error(error.message)
  notifyFeed()
  return (data as FeedReactionKind | null) ?? null
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

  const supabase = getSupabase()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Sign in to remove posts.')
  }
  if (user.id !== actorUserId) {
    throw new Error('You can only remove your own posts.')
  }

  const { data: rpcOk, error: rpcError } = await supabase.rpc('community_hide_own_post', {
    p_post_id: postId,
  })

  if (!rpcError && rpcOk === true) {
    notifyFeed()
    return
  }

  if (rpcError && !/community_hide_own_post|schema cache|could not find/i.test(rpcError.message)) {
    throw new Error(rpcError.message)
  }

  const { data, error } = await supabase
    .from('community_posts')
    .update({ status: 'hidden' })
    .eq('id', postId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data?.id) {
    throw new Error(
      rpcError
        ? 'Could not remove post. Run migration 054-community-hide-own-post.sql in Supabase.'
        : 'Post not found or already removed.'
    )
  }

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

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_feed_post_by_id', {
    p_post_id: postId,
  })

  if (error) {
    console.warn('[community] feed post', error.message)
    return null
  }

  const row = (data ?? [])[0] as FeedRow | undefined
  return row ? mapRow(row) : null
}
