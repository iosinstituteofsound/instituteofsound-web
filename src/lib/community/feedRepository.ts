import type { SupabaseClient } from '@supabase/supabase-js'
import { mapFeedRow, type FeedRow } from './feedRow'
import type { CommunityFeedPost, FeedReactionKind } from './feedTypes'

export interface FeedQueryParams {
  limit?: number
  kind?: 'spin' | 'drop' | null
  genreSlug?: string | null
  followingOnly?: boolean
  cursorCreatedAt?: string | null
  cursorId?: string | null
}

export async function repoFetchCommunityFeed(
  supabase: SupabaseClient,
  query: FeedQueryParams,
): Promise<CommunityFeedPost[]> {
  const { data, error } = await supabase.rpc('community_feed', {
    lim: query.limit ?? 30,
    p_kind: query.kind ?? null,
    p_genre_slug: query.genreSlug ?? null,
    p_following_only: query.followingOnly ?? false,
    p_cursor_created_at: query.cursorCreatedAt ?? null,
    p_cursor_id: query.cursorId ?? null,
  })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row: FeedRow) => mapFeedRow(row))
}

export async function repoFetchCommunityPostById(
  supabase: SupabaseClient,
  postId: string,
): Promise<CommunityFeedPost | null> {
  const { data, error } = await supabase.rpc('community_feed_post_by_id', {
    p_post_id: postId,
  })

  if (error) throw new Error(error.message)
  const row = (data ?? [])[0] as FeedRow | undefined
  return row ? mapFeedRow(row) : null
}

export async function repoTogglePostReaction(
  supabase: SupabaseClient,
  postId: string,
  reaction: FeedReactionKind,
): Promise<FeedReactionKind | null> {
  const { data, error } = await supabase.rpc('community_toggle_post_reaction', {
    p_post_id: postId,
    p_reaction: reaction,
  })
  if (error) throw new Error(error.message)
  return (data as FeedReactionKind | null) ?? null
}

export interface InsertSpinRow {
  user_id: string
  kind: 'spin'
  body: string | null
  spotify_url: string | null
  youtube_url: string | null
  track_title: string | null
  image_url: string | null
}

export interface InsertDropRow {
  user_id: string
  kind: 'drop'
  body: string | null
  image_url: string | null
  link_url: string | null
  link_title: string | null
  link_description: string | null
  link_image_url: string | null
}

export async function repoInsertCommunityPost(
  supabase: SupabaseClient,
  row: InsertSpinRow | InsertDropRow,
): Promise<{ id: string; created_at: string }> {
  const { data, error } = await supabase
    .from('community_posts')
    .insert(row as unknown as Record<string, unknown>)
    .select('id, created_at')
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function repoUpdateOwnDrop(
  supabase: SupabaseClient,
  postId: string,
  body: string,
): Promise<void> {
  const { error } = await supabase.rpc('community_update_own_drop', {
    p_post_id: postId,
    p_body: body,
  })
  if (error) throw new Error(error.message)
}

export async function repoUpdateOwnSpin(
  supabase: SupabaseClient,
  postId: string,
  fields: {
    p_body: string
    p_track_title: string
    p_spotify_url: string
    p_youtube_url: string
  },
): Promise<void> {
  const { error } = await supabase.rpc('community_update_own_spin', {
    p_post_id: postId,
    ...fields,
  })
  if (error) throw new Error(error.message)
}

export async function repoHideOwnPost(
  supabase: SupabaseClient,
  postId: string,
): Promise<boolean> {
  const { data: rpcOk, error: rpcError } = await supabase.rpc('community_hide_own_post', {
    p_post_id: postId,
  })

  if (!rpcError && rpcOk === true) return true

  if (rpcError && !/community_hide_own_post|schema cache|could not find/i.test(rpcError.message)) {
    throw new Error(rpcError.message)
  }

  const { data, error } = await supabase
    .from('community_posts')
    .update({ status: 'hidden' })
    .eq('id', postId)
    .select('id')
    .maybeSingle()

  if (error) throw new Error(error.message)
  return Boolean(data?.id)
}

export async function repoTouchArtistActivity(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data: profile } = await supabase
    .from('artist_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  if (!profile?.id) return

  const { error } = await supabase.rpc('touch_artist_page_activity', {
    p_profile_id: profile.id,
  })
  if (!error) return

  if (!/touch_artist_page_activity|schema cache|could not find/i.test(error.message)) {
    console.warn('[artist] touch activity rpc', error.message)
  }

  const stamp = new Date().toISOString()
  await supabase
    .from('artist_profiles')
    .update({
      last_activity_at: stamp,
      page_refreshed_at: stamp,
      updated_at: stamp,
    })
    .eq('id', profile.id)
}
