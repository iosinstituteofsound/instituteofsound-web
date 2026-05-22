import { getSupabase } from '@/lib/supabase/client'
import type { User } from '@/lib/auth/types'
import type {
  ArtistAlbum,
  ArtistProfile,
  ArtistTrack,
  ArtistVideo,
  UpsertAlbumInput,
  UpsertArtistProfileInput,
  UpsertTrackInput,
  UpsertVideoInput,
} from './types'
import {
  DEFAULT_ACCENT_COLOR,
  DEFAULT_THEME_PRESET,
  normalizeAccentColor,
  resolveThemePreset,
} from './branding'
import { normalizeSocialLinkOrder } from './socialOrder'
import { ensureUniqueSlug, slugifyArtistName } from './slug'

type ProfileRow = {
  id: string
  user_id: string
  slug: string
  display_name: string
  tagline: string | null
  bio: string | null
  avatar_url: string | null
  banner_url: string | null
  logo_url: string | null
  genres: string[] | null
  country: string | null
  website_url: string | null
  spotify_url: string | null
  youtube_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  bandcamp_url: string | null
  monthly_listeners_display: string | null
  artist_pick_track_id: string | null
  accent_color: string | null
  theme_preset: string | null
  hero_video_url: string | null
  social_link_order: string[] | null
  published: boolean
  created_at: string
  updated_at: string
}

function mapProfile(row: ProfileRow): ArtistProfile {
  return {
    id: row.id,
    userId: row.user_id,
    slug: row.slug,
    displayName: row.display_name,
    tagline: row.tagline ?? undefined,
    bio: row.bio ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    bannerUrl: row.banner_url ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    genres: row.genres ?? [],
    country: row.country ?? undefined,
    social: {
      website: row.website_url ?? undefined,
      spotify: row.spotify_url ?? undefined,
      youtube: row.youtube_url ?? undefined,
      instagram: row.instagram_url ?? undefined,
      facebook: row.facebook_url ?? undefined,
      bandcamp: row.bandcamp_url ?? undefined,
    },
    monthlyListenersDisplay: row.monthly_listeners_display ?? '—',
    artistPickTrackId: row.artist_pick_track_id ?? undefined,
    accentColor: row.accent_color ?? DEFAULT_ACCENT_COLOR,
    themePreset: resolveThemePreset(row.theme_preset),
    heroVideoUrl: row.hero_video_url ?? undefined,
    socialLinkOrder: normalizeSocialLinkOrder(row.social_link_order),
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function profilePayload(input: UpsertArtistProfileInput, user: User) {
  const social = input.social ?? {}
  return {
    display_name: input.displayName.trim() || user.name,
    tagline: input.tagline?.trim() || null,
    bio: input.bio?.trim() || null,
    avatar_url: input.avatarUrl?.trim() || null,
    banner_url: input.bannerUrl?.trim() || null,
    logo_url: input.logoUrl?.trim() || null,
    genres: input.genres ?? [],
    country: input.country?.trim() || null,
    website_url: social.website?.trim() || null,
    spotify_url: social.spotify?.trim() || null,
    youtube_url: social.youtube?.trim() || null,
    instagram_url: social.instagram?.trim() || null,
    facebook_url: social.facebook?.trim() || null,
    bandcamp_url: social.bandcamp?.trim() || null,
    monthly_listeners_display: input.monthlyListenersDisplay?.trim() || '—',
    artist_pick_track_id: input.artistPickTrackId ?? null,
    accent_color:
      normalizeAccentColor(input.accentColor ?? '') ?? DEFAULT_ACCENT_COLOR,
    theme_preset: input.themePreset ?? DEFAULT_THEME_PRESET,
    hero_video_url: input.heroVideoUrl?.trim() || null,
    social_link_order: normalizeSocialLinkOrder(input.socialLinkOrder),
    published: input.published ?? false,
    updated_at: new Date().toISOString(),
  }
}

export async function supabaseGetProfileByUserId(userId: string): Promise<ArtistProfile | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapProfile(data as ProfileRow) : null
}

export async function supabaseGetProfileBySlug(slug: string): Promise<ArtistProfile | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapProfile(data as ProfileRow) : null
}

export async function supabaseListProfileSlugs(): Promise<string[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase.from('artist_profiles').select('slug')
  if (error) throw new Error(error.message)
  return (data ?? []).map((r: { slug: string }) => r.slug)
}

export async function supabaseUpsertProfile(
  user: User,
  input: UpsertArtistProfileInput
): Promise<ArtistProfile> {
  const supabase = getSupabase()
  const existing = await supabaseGetProfileByUserId(user.id)
  const slugs = (await supabaseListProfileSlugs()).filter((s) => s !== existing?.slug)
  const slug =
    input.slug?.trim() ||
    existing?.slug ||
    ensureUniqueSlug(input.displayName || user.name, slugs)

  const row = {
    ...profilePayload(input, user),
    slug: slugifyArtistName(slug),
    user_id: user.id,
  }

  if (existing) {
    const { data, error } = await supabase
      .from('artist_profiles')
      .update(row)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return mapProfile(data as ProfileRow)
  }

  const { data, error } = await supabase
    .from('artist_profiles')
    .insert(row)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapProfile(data as ProfileRow)
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
  return (data as ProfileRow[]).map(mapProfile)
}

export async function supabaseListPublishedProfiles(): Promise<ArtistProfile[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_profiles')
    .select('*')
    .eq('published', true)
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as ProfileRow[]).map(mapProfile)
}

export async function supabaseGetEditorialForProfile(
  profileId: string
): Promise<
  {
    id: string
    type: string
    title: string
    subject: string
    body: string
    cover_image_url: string | null
    editor_name: string
    updated_at: string
  }[]
> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('editorial_drafts')
    .select('id, type, title, subject, body, cover_image_url, editor_name, updated_at')
    .eq('artist_profile_id', profileId)
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
