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

export type FeedRow = {
  id: string
  kind: string
  body: string | null
  spotify_url: string | null
  youtube_url: string | null
  track_title: string | null
  image_url?: string | null
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
    return posts.slice(0, limit)
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
}

export async function createDropPost(input: CreateDropInput): Promise<CommunityFeedPost> {
  const text = input.text.trim()
  const imageUrl = input.imageUrl?.trim() || null
  if (text.length < 1 && !imageUrl) throw new Error('Write something or add a photo first.')
  if (text.length > 280) throw new Error('Max 280 characters.')
  const body = text.length > 0 ? text : null

  if (!isSupabaseConfigured()) {
    const post: CommunityFeedPost = {
      id: crypto.randomUUID(),
      kind: 'drop',
      body: body ?? undefined,
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
    void tryGrantBadge('first_drop')
    notifyFeed()
    void evaluateWeeklyChallenges()
    return post
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: input.userId,
      kind: 'drop',
      body,
      image_url: imageUrl,
    })
    .select('id, created_at')
    .single()

  if (error) throw new Error(error.message)

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

export async function hideCommunityPost(postId: string, userId: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    localHideFeedPost(postId, userId)
    notifyFeed()
    return
  }

  const supabase = getSupabase()
  const { error } = await supabase
    .from('community_posts')
    .update({ status: 'hidden' })
    .eq('id', postId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  notifyFeed()
}

export function getEmbedForPost(post: CommunityFeedPost) {
  if (post.spotifyUrl) return parseSpotifyUrl(post.spotifyUrl)
  if (post.youtubeUrl) return parseYouTubeUrl(post.youtubeUrl)
  return null
}
