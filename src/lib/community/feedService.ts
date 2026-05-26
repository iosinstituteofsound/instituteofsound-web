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

export async function fetchCommunityFeed(limit = 30): Promise<CommunityFeedPost[]> {
  if (!isSupabaseConfigured()) {
    return localApplyReactions(
      localListFeed(limit).map((p) => ({
        ...p,
        reactions: p.reactions ?? emptyReactions(),
      }))
    )
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_feed', { lim: limit })

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
}

export async function createSpinPost(input: CreateSpinInput): Promise<CommunityFeedPost> {
  const { spotify, youtube, error } = validateSpinInput(input.spotifyRaw, input.youtubeRaw)
  if (error) throw new Error(error)

  const body = input.caption?.trim().slice(0, 280) || null
  const trackTitle = input.trackTitle?.trim().slice(0, 120) || null

  if (!isSupabaseConfigured()) {
    const post: CommunityFeedPost = {
      id: crypto.randomUUID(),
      kind: 'spin',
      body: body ?? undefined,
      spotifyUrl: spotify?.url,
      youtubeUrl: youtube?.url,
      trackTitle: trackTitle ?? undefined,
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
}

export async function createDropPost(input: CreateDropInput): Promise<CommunityFeedPost> {
  const text = input.text.trim()
  if (text.length < 1) throw new Error('Write your transmission first.')
  if (text.length > 280) throw new Error('Max 280 characters.')

  if (!isSupabaseConfigured()) {
    const post: CommunityFeedPost = {
      id: crypto.randomUUID(),
      kind: 'drop',
      body: text,
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
      body: text,
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
    body: text,
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
