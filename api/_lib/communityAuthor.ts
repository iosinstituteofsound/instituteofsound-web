import type { SupabaseClient } from '@supabase/supabase-js'
import { rankFromDb } from '../../src/lib/community/ranks.js'
import type { CommunityRank } from '../../src/types/index.js'

export type PostAuthorContext = {
  userId: string
  displayName: string
  handle: string
  avatarUrl?: string
  rank: CommunityRank
  primaryGenreSlug?: string
}

export async function loadPostAuthor(
  supabase: SupabaseClient,
  userId: string,
): Promise<PostAuthorContext> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, username, avatar_url, total_db, primary_genre_id')
    .eq('id', userId)
    .single()

  if (error || !data) throw new Error('Profile not found')

  let primaryGenreSlug: string | undefined
  if (data.primary_genre_id) {
    const { data: genre } = await supabase
      .from('community_genres')
      .select('slug')
      .eq('id', data.primary_genre_id)
      .maybeSingle()
    primaryGenreSlug = genre?.slug ?? undefined
  }

  const username = data.username?.trim()
  const handle = username
    ? username.startsWith('@')
      ? username
      : `@${username}`
    : `@${(data.name || 'member').toLowerCase().replace(/\s+/g, '')}`

  return {
    userId: data.id,
    displayName: data.name?.trim() || 'Member',
    handle,
    avatarUrl: data.avatar_url?.trim() || undefined,
    rank: rankFromDb(Number(data.total_db ?? 0)),
    primaryGenreSlug,
  }
}
