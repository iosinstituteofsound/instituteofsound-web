import { getSupabase } from '@/lib/supabase/client'
import type { User } from '@/lib/auth/types'
import type {
  ArtistAlbum,
  ArtistBioTimelineEntry,
  ArtistLineupEntry,
  ArtistMerchItem,
  ArtistProfile,
  ArtistTrack,
  ArtistVideo,
  UpsertAlbumInput,
  UpsertArtistProfileInput,
  UpsertBioTimelineInput,
  UpsertLineupInput,
  UpsertMerchInput,
  UpsertTrackInput,
  UpsertVideoInput,
} from './types'
import { resolveLineupEntryType } from './lineup'
import { filterDiscoverProfiles } from '@/lib/artist-profile/profileVisibility'
import {
  mapArtistProfileRow,
  normalizeManagerHandle,
  type ArtistProfileRow,
} from './profileRow'
import {
  repoGetArtistProfileByUserId,
  repoListArtistProfileSlugs,
  repoUpsertArtistProfile,
} from './profileRepository'

export async function supabaseTouchActivity(profileId: string): Promise<void> {
  const supabase = getSupabase()
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

export async function supabaseDeleteProfileForUser(userId: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('artist_profiles').delete().eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function supabaseGetProfileByUserId(userId: string): Promise<ArtistProfile | null> {
  return repoGetArtistProfileByUserId(getSupabase(), userId)
}

export async function supabaseGetProfileBySlug(slug: string): Promise<ArtistProfile | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapArtistProfileRow(data as ArtistProfileRow) : null
}

export async function supabaseListManagedArtistsByHandle(
  handle: string
): Promise<
  {
    profileId: string
    slug: string
    displayName: string
    tagline?: string
    avatarUrl?: string
  }[]
> {
  const managerHandle = normalizeManagerHandle(handle)
  if (!managerHandle) return []
  const supabase = getSupabase()
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

export async function supabaseListProfileSlugs(): Promise<string[]> {
  return repoListArtistProfileSlugs(getSupabase())
}

export async function supabaseUpsertProfile(
  user: User,
  input: UpsertArtistProfileInput
): Promise<ArtistProfile> {
  return repoUpsertArtistProfile(getSupabase(), user, input)
}

export async function supabaseGetAlbums(profileId: string): Promise<ArtistAlbum[]> {
  const supabase = getSupabase()
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

export async function supabaseGetTracks(profileId: string): Promise<ArtistTrack[]> {
  const supabase = getSupabase()
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

export async function supabaseGetBioTimeline(
  profileId: string
): Promise<ArtistBioTimelineEntry[]> {
  const supabase = getSupabase()
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

export async function supabaseGetLineup(profileId: string): Promise<ArtistLineupEntry[]> {
  const supabase = getSupabase()
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

export async function supabaseGetMerch(profileId: string): Promise<ArtistMerchItem[]> {
  const supabase = getSupabase()
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

export async function supabaseGetVideos(profileId: string): Promise<ArtistVideo[]> {
  const supabase = getSupabase()
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

export async function supabaseAddAlbum(
  profileId: string,
  input: UpsertAlbumInput
): Promise<ArtistAlbum> {
  const supabase = getSupabase()
  const count = (await supabaseGetAlbums(profileId)).length
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

export async function supabaseAddTrack(
  profileId: string,
  input: UpsertTrackInput
): Promise<ArtistTrack> {
  const supabase = getSupabase()
  const count = (await supabaseGetTracks(profileId)).length
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

export async function supabaseAddMerch(
  profileId: string,
  input: UpsertMerchInput
): Promise<ArtistMerchItem> {
  const supabase = getSupabase()
  const count = (await supabaseGetMerch(profileId)).length
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

export async function supabaseUpdateMerch(
  merchId: string,
  input: UpsertMerchInput
): Promise<ArtistMerchItem> {
  const supabase = getSupabase()
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

export async function supabaseDeleteMerch(id: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from('artist_merch_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function supabaseAddLineup(
  profileId: string,
  input: UpsertLineupInput
): Promise<ArtistLineupEntry> {
  const supabase = getSupabase()
  const count = (await supabaseGetLineup(profileId)).length
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

export async function supabaseUpdateLineup(
  entryId: string,
  input: UpsertLineupInput
): Promise<ArtistLineupEntry> {
  const supabase = getSupabase()
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

export async function supabaseDeleteLineup(id: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from('artist_lineup_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function supabaseAddBioTimeline(
  profileId: string,
  input: UpsertBioTimelineInput
): Promise<ArtistBioTimelineEntry> {
  const supabase = getSupabase()
  const count = (await supabaseGetBioTimeline(profileId)).length
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

export async function supabaseUpdateBioTimeline(
  entryId: string,
  input: UpsertBioTimelineInput
): Promise<ArtistBioTimelineEntry> {
  const supabase = getSupabase()
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

export async function supabaseDeleteBioTimeline(id: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from('artist_bio_timeline_entries').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function supabaseAddVideo(
  profileId: string,
  input: UpsertVideoInput
): Promise<ArtistVideo> {
  const supabase = getSupabase()
  const count = (await supabaseGetVideos(profileId)).length
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

export async function supabaseUpdateTrack(
  trackId: string,
  input: UpsertTrackInput
): Promise<ArtistTrack> {
  const supabase = getSupabase()
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

export async function supabaseUpdateAlbum(
  albumId: string,
  input: UpsertAlbumInput
): Promise<ArtistAlbum> {
  const supabase = getSupabase()
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

export async function supabaseUpdateVideo(
  videoId: string,
  input: UpsertVideoInput
): Promise<ArtistVideo> {
  const supabase = getSupabase()
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

export async function supabasePatchTrackCover(trackId: string, coverUrl: string) {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('artist_tracks')
    .update({ cover_url: coverUrl.trim() })
    .eq('id', trackId)
  if (error) throw new Error(error.message)
}

export async function supabasePatchVideoThumbnail(videoId: string, thumbnailUrl: string) {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('artist_videos')
    .update({ thumbnail_url: thumbnailUrl.trim() })
    .eq('id', videoId)
  if (error) throw new Error(error.message)
}

export async function supabaseDeleteAlbum(id: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from('artist_albums').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function supabaseDeleteTrack(id: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from('artist_tracks').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function supabaseDeleteVideo(id: string) {
  const supabase = getSupabase()
  const { error } = await supabase.from('artist_videos').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function supabaseListProfilesForEditor(): Promise<ArtistProfile[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .order('display_name')
  if (error) throw new Error(error.message)
  return (data as ArtistProfileRow[]).map(mapArtistProfileRow)
}

export async function supabaseListPublishedProfiles(): Promise<ArtistProfile[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('published', true)
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return filterDiscoverProfiles((data as ArtistProfileRow[]).map(mapArtistProfileRow))
}

export async function supabaseGetEditorialForProfile(
  profileId: string
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
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('editorial_drafts')
    .select(
      'id, slug, type, title, subject, body, cover_image_url, editor_id, editor_name, updated_at'
    )
    .eq('artist_profile_id', profileId)
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
