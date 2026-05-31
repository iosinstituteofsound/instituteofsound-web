import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ArtistContentChampionRow,
  ArtistDiscoveryDriverRow,
  ArtistRecentSupportRow,
  ArtistSupporterRow,
  FandomArtistSearchHit,
  FandomDiscoverArtistRow,
  FandomWindow,
  MyFandomArtistRow,
  PublicSupporterBadge,
  PublicSupporterBadgeOnArtist,
} from './types'

function mapMyArtist(row: Record<string, unknown>): MyFandomArtistRow {
  return {
    artistProfileId: String(row.artist_profile_id),
    slug: String(row.slug),
    displayName: String(row.display_name),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    supportScore: Number(row.support_score ?? 0),
    rankAmongMyArtists: Number(row.rank_among_my_artists ?? 0),
    percentileLabel: row.percentile_label ? String(row.percentile_label) : null,
    spins: Number(row.spins ?? 0),
    drops: Number(row.drops ?? 0),
    comments: Number(row.comments ?? 0),
    reactions: Number(row.reactions ?? 0),
    shares: Number(row.shares ?? 0),
    reviews: Number(row.reviews ?? 0),
    editorials: Number(row.editorials ?? 0),
    firstSupportAt: row.first_support_at ? String(row.first_support_at) : undefined,
    lastSupportAt: row.last_support_at ? String(row.last_support_at) : undefined,
  }
}

function mapSupporter(row: Record<string, unknown>): ArtistSupporterRow {
  return {
    supporterUserId: String(row.supporter_user_id),
    displayName: String(row.display_name),
    handle: String(row.handle),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    supportScore: Number(row.support_score ?? 0),
    supporterRank: Number(row.supporter_rank ?? 0),
    badgeLabel: row.badge_label ? String(row.badge_label) : null,
    spins: Number(row.spins ?? 0),
    drops: Number(row.drops ?? 0),
    comments: Number(row.comments ?? 0),
    reactions: Number(row.reactions ?? 0),
    shares: Number(row.shares ?? 0),
    reviews: Number(row.reviews ?? 0),
    editorials: Number(row.editorials ?? 0),
    firstSupportAt: row.first_support_at ? String(row.first_support_at) : undefined,
    lastSupportAt: row.last_support_at ? String(row.last_support_at) : undefined,
  }
}

export async function repoSetPostArtistTags(
  supabase: SupabaseClient,
  postId: string,
  artistProfileIds: string[],
): Promise<void> {
  const { error } = await supabase.rpc('community_set_post_artist_tags', {
    p_post_id: postId,
    p_artist_profile_ids: artistProfileIds,
  })
  if (error) throw new Error(error.message)
}

export async function repoLogPostShare(
  supabase: SupabaseClient,
  postId: string,
): Promise<void> {
  const { error } = await supabase.rpc('fandom_log_post_share', { p_post_id: postId })
  if (error) throw new Error(error.message)
}

export async function repoFetchMyFandom(
  supabase: SupabaseClient,
  window: FandomWindow = '90d',
  limit = 50,
): Promise<MyFandomArtistRow[]> {
  const { data, error } = await supabase.rpc('fandom_my_artists', {
    p_window: window,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => mapMyArtist(row))
}

export async function repoFetchArtistSupporters(
  supabase: SupabaseClient,
  window: FandomWindow = '90d',
  limit = 50,
): Promise<ArtistSupporterRow[]> {
  const { data, error } = await supabase.rpc('fandom_artist_supporters', {
    p_window: window,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => mapSupporter(row))
}

export async function repoFetchArtistRecentSupport(
  supabase: SupabaseClient,
  limit = 20,
): Promise<ArtistRecentSupportRow[]> {
  const { data, error } = await supabase.rpc('fandom_artist_recent_support', { lim: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => ({
    supporterUserId: String(row.supporter_user_id),
    displayName: String(row.display_name),
    handle: String(row.handle),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    actionType: row.action_type as ArtistRecentSupportRow['actionType'],
    createdAt: String(row.created_at),
  }))
}

export async function repoFetchArtistContentChampions(
  supabase: SupabaseClient,
  window: FandomWindow = '90d',
  limit = 10,
): Promise<ArtistContentChampionRow[]> {
  const { data, error } = await supabase.rpc('fandom_artist_content_champions', {
    p_window: window,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => ({
    supporterUserId: String(row.supporter_user_id),
    displayName: String(row.display_name),
    handle: String(row.handle),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    contentScore: Number(row.content_score ?? 0),
    spins: Number(row.spins ?? 0),
    drops: Number(row.drops ?? 0),
    reviews: Number(row.reviews ?? 0),
    editorials: Number(row.editorials ?? 0),
  }))
}

export async function repoSearchArtistsForTags(
  supabase: SupabaseClient,
  query: string,
  limit = 12,
): Promise<FandomArtistSearchHit[]> {
  const { data, error } = await supabase.rpc('fandom_search_artists', {
    q: query.trim(),
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    slug: String(row.slug),
    displayName: String(row.display_name),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
  }))
}

export async function repoFetchArtistDiscoveryDrivers(
  supabase: SupabaseClient,
  window: FandomWindow = '90d',
  limit = 10,
): Promise<ArtistDiscoveryDriverRow[]> {
  const { data, error } = await supabase.rpc('fandom_artist_discovery_drivers', {
    p_window: window,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => ({
    supporterUserId: String(row.supporter_user_id),
    displayName: String(row.display_name),
    handle: String(row.handle),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    shares: Number(row.shares ?? 0),
    wiredReach: Number(row.wired_reach ?? 0),
    driverRank: Number(row.driver_rank ?? 0),
  }))
}

export async function repoFetchDiscoverRisingArtists(
  supabase: SupabaseClient,
  limit = 12,
): Promise<FandomDiscoverArtistRow[]> {
  const { data, error } = await supabase.rpc('fandom_discover_rising_artists', { lim: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => ({
    artistProfileId: String(row.artist_profile_id),
    slug: String(row.slug),
    displayName: String(row.display_name),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    reasonLabel: String(row.momentum_label ?? 'Rising on the wire'),
    signalStrength: row.recent_supporters != null ? Number(row.recent_supporters) : undefined,
  }))
}

export async function repoFetchDiscoverFromMyFandom(
  supabase: SupabaseClient,
  limit = 8,
): Promise<FandomDiscoverArtistRow[]> {
  const { data, error } = await supabase.rpc('fandom_discover_from_my_fandom', { lim: limit })
  if (error) throw new Error(error.message)
  return (data ?? []).map((row: Record<string, unknown>) => ({
    artistProfileId: String(row.artist_profile_id),
    slug: String(row.slug),
    displayName: String(row.display_name),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    reasonLabel: String(row.reason_label ?? 'Also supported by your circle'),
    signalStrength: row.circle_overlap != null ? Number(row.circle_overlap) : undefined,
  }))
}

export async function repoFetchPublicSupporterBadge(
  supabase: SupabaseClient,
  artistProfileId: string,
  supporterUserId?: string,
): Promise<PublicSupporterBadge | null> {
  const { data, error } = await supabase.rpc('fandom_public_supporter_badge', {
    p_artist_profile_id: artistProfileId,
    p_supporter_user_id: supporterUserId ?? null,
  })
  if (error) throw new Error(error.message)
  const row = (data ?? [])[0] as Record<string, unknown> | undefined
  if (!row) return null
  return {
    supporterUserId: String(row.supporter_user_id),
    badgeLabel: row.badge_label ? String(row.badge_label) : null,
    supporterRank: row.supporter_rank != null ? Number(row.supporter_rank) : null,
  }
}

export async function repoFetchPublicSupporterBadgesForUser(
  supabase: SupabaseClient,
  supporterUserId: string,
  limit = 8,
): Promise<PublicSupporterBadgeOnArtist[]> {
  const { data, error } = await supabase.rpc('fandom_public_supporter_badges_for_user', {
    p_supporter_user_id: supporterUserId,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  return (data ?? [])
    .map((row: Record<string, unknown>) => ({
      artistProfileId: String(row.artist_profile_id),
      artistSlug: String(row.artist_slug),
      artistDisplayName: String(row.artist_display_name),
      badgeLabel: String(row.badge_label),
      supporterRank: row.supporter_rank != null ? Number(row.supporter_rank) : null,
    }))
    .filter((row: PublicSupporterBadgeOnArtist) => row.badgeLabel.length > 0)
}
