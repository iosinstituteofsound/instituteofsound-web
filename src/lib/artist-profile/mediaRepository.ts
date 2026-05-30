import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveLineupEntryType } from './lineup'
import {
  mapArtistProfileRow,
  normalizeManagerHandle,
  type ArtistProfileRow,
} from './profileRow'
import type {
  ArtistAlbum,
  ArtistBioTimelineEntry,
  ArtistLineupEntry,
  ArtistMerchItem,
  ArtistProfile,
  ArtistTrack,
  ArtistVideo,
  ManagedArtistSummary,
  UpsertAlbumInput,
  UpsertBioTimelineInput,
  UpsertLineupInput,
  UpsertMerchInput,
  UpsertTrackInput,
  UpsertVideoInput,
} from './types'

export async function repoTouchArtistActivity(
  supabase: SupabaseClient,
  profileId: string,
): Promise<void> {
  const stamp = new Date().toISOString()
  const { error } = await supabase
    .from('artist_profiles')
    .update({
      last_activity_at: stamp,
      page_refreshed_at: stamp,
      updated_at: stamp,
    })
    .eq('id', profileId)
  if (error) throw new Error(error.message)
}

export async function repoListManagedArtistsByHandle(
  supabase: SupabaseClient,
  handle: string,
): Promise<ManagedArtistSummary[]> {
  const managerHandle = normalizeManagerHandle(handle)
  if (!managerHandle) return []
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('id, slug, display_name, tagline, avatar_url, published')
    .eq('artist_manager_handle', managerHandle)
    .eq('published', true)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    profileId: row.id,
    slug: row.slug,
    displayName: row.display_name,
    tagline: row.tagline ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
  }))
}

export async function repoGetAlbums(
  supabase: SupabaseClient,
  profileId: string,
): Promise<ArtistAlbum[]> {
  const { data, error } = await supabase
    .from('artist_albums')
    .select('*')
    .eq('profile_id', profileId)
    .order('sort_order')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    title: r.title,
    coverUrl: r.cover_url ?? undefined,
    releaseYear: r.release_year ?? undefined,
    releaseType: r.release_type,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }))
}

export async function repoGetTracks(
  supabase: SupabaseClient,
  profileId: string,
): Promise<ArtistTrack[]> {
  const { data, error } = await supabase
    .from('artist_tracks')
    .select('*')
    .eq('profile_id', profileId)
    .order('play_count', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    albumId: r.album_id ?? undefined,
    title: r.title,
    streamUrl: r.stream_url,
    coverUrl: r.cover_url ?? undefined,
    playCount: r.play_count ?? 0,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }))
}

export async function repoGetBioTimeline(
  supabase: SupabaseClient,
  profileId: string,
): Promise<ArtistBioTimelineEntry[]> {
  const { data, error } = await supabase
    .from('artist_bio_timeline_entries')
    .select('*')
    .eq('profile_id', profileId)
    .order('year', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    year: r.year,
    title: r.title,
    description: r.description ?? undefined,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }))
}

export async function repoGetLineup(
  supabase: SupabaseClient,
  profileId: string,
): Promise<ArtistLineupEntry[]> {
  const { data, error } = await supabase
    .from('artist_lineup_entries')
    .select('*')
    .eq('profile_id', profileId)
    .order('sort_order')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    name: r.name,
    role: r.role,
    entryType: resolveLineupEntryType(r.entry_type),
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }))
}

export async function repoGetMerch(
  supabase: SupabaseClient,
  profileId: string,
): Promise<ArtistMerchItem[]> {
  const { data, error } = await supabase
    .from('artist_merch_items')
    .select('*')
    .eq('profile_id', profileId)
    .order('sort_order')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    title: r.title,
    productUrl: r.product_url,
    imageUrl: r.image_url ?? undefined,
    priceDisplay: r.price_display ?? undefined,
    showPrice: r.show_price ?? true,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }))
}

export async function repoGetVideos(
  supabase: SupabaseClient,
  profileId: string,
): Promise<ArtistVideo[]> {
  const { data, error } = await supabase
    .from('artist_videos')
    .select('*')
    .eq('profile_id', profileId)
    .order('sort_order')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    title: r.title,
    videoUrl: r.video_url,
    thumbnailUrl: r.thumbnail_url ?? undefined,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }))
}

export async function repoGetEditorialForProfile(
  supabase: SupabaseClient,
  profileId: string,
): Promise<
  {
    id: string
    slug: string | null
    type: string
    title: string
    subject: string
    body: string
    cover_image_url: string | null
    editor_id: string
    editor_name: string
    updated_at: string
  }[]
> {
  const { data, error } = await supabase
    .from('editorial_drafts')
    .select(
      'id, slug, type, title, subject, body, cover_image_url, editor_id, editor_name, updated_at',
    )
    .eq('artist_profile_id', profileId)
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function repoAddAlbum(
  supabase: SupabaseClient,
  profileId: string,
  input: UpsertAlbumInput,
): Promise<ArtistAlbum> {
  const count = (await repoGetAlbums(supabase, profileId)).length
  const { data, error } = await supabase
    .from('artist_albums')
    .insert({
      profile_id: profileId,
      title: input.title,
      cover_url: input.coverUrl?.trim() || null,
      release_year: input.releaseYear ?? null,
      release_type: input.releaseType,
      sort_order: count,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    title: r.title,
    coverUrl: r.cover_url ?? undefined,
    releaseYear: r.release_year ?? undefined,
    releaseType: r.release_type,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoAddTrack(
  supabase: SupabaseClient,
  profileId: string,
  input: UpsertTrackInput,
): Promise<ArtistTrack> {
  const count = (await repoGetTracks(supabase, profileId)).length
  const { data, error } = await supabase
    .from('artist_tracks')
    .insert({
      profile_id: profileId,
      album_id: input.albumId ?? null,
      title: input.title,
      stream_url: input.streamUrl,
      cover_url: input.coverUrl?.trim() || null,
      play_count: input.playCount ?? Math.floor(Math.random() * 50000) + 1000,
      sort_order: count,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    albumId: r.album_id ?? undefined,
    title: r.title,
    streamUrl: r.stream_url,
    coverUrl: r.cover_url ?? undefined,
    playCount: r.play_count,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoAddMerch(
  supabase: SupabaseClient,
  profileId: string,
  input: UpsertMerchInput,
): Promise<ArtistMerchItem> {
  const count = (await repoGetMerch(supabase, profileId)).length
  const { data, error } = await supabase
    .from('artist_merch_items')
    .insert({
      profile_id: profileId,
      title: input.title.trim(),
      product_url: input.productUrl.trim(),
      image_url: input.imageUrl?.trim() || null,
      price_display: input.priceDisplay?.trim() || null,
      show_price: input.showPrice ?? true,
      sort_order: count,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    title: r.title,
    productUrl: r.product_url,
    imageUrl: r.image_url ?? undefined,
    priceDisplay: r.price_display ?? undefined,
    showPrice: r.show_price ?? true,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoUpdateMerch(
  supabase: SupabaseClient,
  merchId: string,
  input: UpsertMerchInput,
): Promise<ArtistMerchItem> {
  const { data, error } = await supabase
    .from('artist_merch_items')
    .update({
      title: input.title.trim(),
      product_url: input.productUrl.trim(),
      image_url: input.imageUrl?.trim() || null,
      price_display: input.priceDisplay?.trim() || null,
      show_price: input.showPrice ?? true,
    })
    .eq('id', merchId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    title: r.title,
    productUrl: r.product_url,
    imageUrl: r.image_url ?? undefined,
    priceDisplay: r.price_display ?? undefined,
    showPrice: r.show_price ?? true,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoDeleteMerch(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('artist_merch_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function repoAddLineup(
  supabase: SupabaseClient,
  profileId: string,
  input: UpsertLineupInput,
): Promise<ArtistLineupEntry> {
  const count = (await repoGetLineup(supabase, profileId)).length
  const { data, error } = await supabase
    .from('artist_lineup_entries')
    .insert({
      profile_id: profileId,
      name: input.name.trim(),
      role: input.role.trim(),
      entry_type: resolveLineupEntryType(input.entryType),
      sort_order: count,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    name: r.name,
    role: r.role,
    entryType: resolveLineupEntryType(r.entry_type),
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoUpdateLineup(
  supabase: SupabaseClient,
  entryId: string,
  input: UpsertLineupInput,
): Promise<ArtistLineupEntry> {
  const { data, error } = await supabase
    .from('artist_lineup_entries')
    .update({
      name: input.name.trim(),
      role: input.role.trim(),
      entry_type: resolveLineupEntryType(input.entryType),
    })
    .eq('id', entryId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    name: r.name,
    role: r.role,
    entryType: resolveLineupEntryType(r.entry_type),
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoDeleteLineup(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('artist_lineup_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function repoAddBioTimeline(
  supabase: SupabaseClient,
  profileId: string,
  input: UpsertBioTimelineInput,
): Promise<ArtistBioTimelineEntry> {
  const count = (await repoGetBioTimeline(supabase, profileId)).length
  const { data, error } = await supabase
    .from('artist_bio_timeline_entries')
    .insert({
      profile_id: profileId,
      year: input.year,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      sort_order: count,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    year: r.year,
    title: r.title,
    description: r.description ?? undefined,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoUpdateBioTimeline(
  supabase: SupabaseClient,
  entryId: string,
  input: UpsertBioTimelineInput,
): Promise<ArtistBioTimelineEntry> {
  const { data, error } = await supabase
    .from('artist_bio_timeline_entries')
    .update({
      year: input.year,
      title: input.title.trim(),
      description: input.description?.trim() || null,
    })
    .eq('id', entryId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    year: r.year,
    title: r.title,
    description: r.description ?? undefined,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoDeleteBioTimeline(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('artist_bio_timeline_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function repoAddVideo(
  supabase: SupabaseClient,
  profileId: string,
  input: UpsertVideoInput,
): Promise<ArtistVideo> {
  const count = (await repoGetVideos(supabase, profileId)).length
  const { data, error } = await supabase
    .from('artist_videos')
    .insert({
      profile_id: profileId,
      title: input.title,
      video_url: input.videoUrl,
      thumbnail_url: input.thumbnailUrl?.trim() || null,
      sort_order: count,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    title: r.title,
    videoUrl: r.video_url,
    thumbnailUrl: r.thumbnail_url ?? undefined,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoUpdateTrack(
  supabase: SupabaseClient,
  trackId: string,
  input: UpsertTrackInput,
): Promise<ArtistTrack> {
  const { data, error } = await supabase
    .from('artist_tracks')
    .update({
      title: input.title.trim(),
      stream_url: input.streamUrl.trim(),
      cover_url: input.coverUrl?.trim() || null,
      play_count: input.playCount ?? 0,
      album_id: input.albumId ?? null,
    })
    .eq('id', trackId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    albumId: r.album_id ?? undefined,
    title: r.title,
    streamUrl: r.stream_url,
    coverUrl: r.cover_url ?? undefined,
    playCount: r.play_count ?? 0,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoUpdateAlbum(
  supabase: SupabaseClient,
  albumId: string,
  input: UpsertAlbumInput,
): Promise<ArtistAlbum> {
  const { data, error } = await supabase
    .from('artist_albums')
    .update({
      title: input.title.trim(),
      cover_url: input.coverUrl?.trim() || null,
      release_year: input.releaseYear ?? null,
      release_type: input.releaseType,
    })
    .eq('id', albumId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    title: r.title,
    coverUrl: r.cover_url ?? undefined,
    releaseYear: r.release_year ?? undefined,
    releaseType: r.release_type,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoUpdateVideo(
  supabase: SupabaseClient,
  videoId: string,
  input: UpsertVideoInput,
): Promise<ArtistVideo> {
  const { data, error } = await supabase
    .from('artist_videos')
    .update({
      title: input.title.trim(),
      video_url: input.videoUrl.trim(),
      thumbnail_url: input.thumbnailUrl?.trim() || null,
    })
    .eq('id', videoId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  const r = data
  return {
    id: r.id,
    profileId: r.profile_id,
    title: r.title,
    videoUrl: r.video_url,
    thumbnailUrl: r.thumbnail_url ?? undefined,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  }
}

export async function repoDeleteAlbum(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('artist_albums').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function repoDeleteTrack(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('artist_tracks').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function repoDeleteVideo(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from('artist_videos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function repoGetTrackProfileId(
  supabase: SupabaseClient,
  trackId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('artist_tracks')
    .select('profile_id')
    .eq('id', trackId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data?.profile_id ?? null
}

export async function repoGetAlbumProfileId(
  supabase: SupabaseClient,
  albumId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('artist_albums')
    .select('profile_id')
    .eq('id', albumId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data?.profile_id ?? null
}

export async function repoGetVideoProfileId(
  supabase: SupabaseClient,
  videoId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('artist_videos')
    .select('profile_id')
    .eq('id', videoId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data?.profile_id ?? null
}

export async function repoGetMerchProfileId(
  supabase: SupabaseClient,
  merchId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('artist_merch_items')
    .select('profile_id')
    .eq('id', merchId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data?.profile_id ?? null
}

export async function repoGetLineupProfileId(
  supabase: SupabaseClient,
  entryId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('artist_lineup_entries')
    .select('profile_id')
    .eq('id', entryId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data?.profile_id ?? null
}

export async function repoGetBioTimelineProfileId(
  supabase: SupabaseClient,
  entryId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('artist_bio_timeline_entries')
    .select('profile_id')
    .eq('id', entryId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data?.profile_id ?? null
}

export async function repoAssertProfileOwner(
  supabase: SupabaseClient,
  userId: string,
  profileId: string,
): Promise<ArtistProfile> {
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('id', profileId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Forbidden')
  return mapArtistProfileRow(data as ArtistProfileRow)
}

export async function repoAssertOwnedProfileId(
  supabase: SupabaseClient,
  userId: string,
  profileId: string | null,
): Promise<string> {
  if (!profileId) throw new Error('Not found')
  await repoAssertProfileOwner(supabase, userId, profileId)
  return profileId
}
