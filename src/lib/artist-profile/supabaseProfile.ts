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
import { filterDiscoverProfiles } from '@/lib/artist-profile/profileVisibility'
import { mapArtistProfileRow, type ArtistProfileRow } from './profileRow'
import {
  repoGetArtistProfileByUserId,
  repoGetArtistProfileBySlug,
  repoListArtistProfileSlugs,
  repoUpsertArtistProfile,
} from './profileRepository'
import * as media from './mediaRepository'

function sb() {
  return getSupabase()
}

export async function supabaseTouchActivity(profileId: string): Promise<void> {
  return media.repoTouchArtistActivity(sb(), profileId)
}

export async function supabaseDeleteProfileForUser(userId: string): Promise<void> {
  const supabase = sb()
  const { error } = await supabase.from('artist_profiles').delete().eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function supabaseGetProfileByUserId(userId: string): Promise<ArtistProfile | null> {
  return repoGetArtistProfileByUserId(sb(), userId)
}

export async function supabaseGetProfileBySlug(slug: string): Promise<ArtistProfile | null> {
  return repoGetArtistProfileBySlug(sb(), slug)
}

export async function supabaseListManagedArtistsByHandle(
  handle: string,
): Promise<
  {
    profileId: string
    slug: string
    displayName: string
    tagline?: string
    avatarUrl?: string
  }[]
> {
  return media.repoListManagedArtistsByHandle(sb(), handle)
}

export async function supabaseListProfileSlugs(): Promise<string[]> {
  return repoListArtistProfileSlugs(sb())
}

export async function supabaseUpsertProfile(
  user: User,
  input: UpsertArtistProfileInput,
): Promise<ArtistProfile> {
  return repoUpsertArtistProfile(sb(), user, input)
}

export async function supabaseGetAlbums(profileId: string): Promise<ArtistAlbum[]> {
  return media.repoGetAlbums(sb(), profileId)
}

export async function supabaseGetTracks(profileId: string): Promise<ArtistTrack[]> {
  return media.repoGetTracks(sb(), profileId)
}

export async function supabaseGetBioTimeline(
  profileId: string,
): Promise<ArtistBioTimelineEntry[]> {
  return media.repoGetBioTimeline(sb(), profileId)
}

export async function supabaseGetLineup(profileId: string): Promise<ArtistLineupEntry[]> {
  return media.repoGetLineup(sb(), profileId)
}

export async function supabaseGetMerch(profileId: string): Promise<ArtistMerchItem[]> {
  return media.repoGetMerch(sb(), profileId)
}

export async function supabaseGetVideos(profileId: string): Promise<ArtistVideo[]> {
  return media.repoGetVideos(sb(), profileId)
}

export async function supabaseAddAlbum(
  profileId: string,
  input: UpsertAlbumInput,
): Promise<ArtistAlbum> {
  return media.repoAddAlbum(sb(), profileId, input)
}

export async function supabaseAddTrack(
  profileId: string,
  input: UpsertTrackInput,
): Promise<ArtistTrack> {
  return media.repoAddTrack(sb(), profileId, input)
}

export async function supabaseAddMerch(
  profileId: string,
  input: UpsertMerchInput,
): Promise<ArtistMerchItem> {
  return media.repoAddMerch(sb(), profileId, input)
}

export async function supabaseUpdateMerch(
  merchId: string,
  input: UpsertMerchInput,
): Promise<ArtistMerchItem> {
  return media.repoUpdateMerch(sb(), merchId, input)
}

export async function supabaseDeleteMerch(id: string) {
  return media.repoDeleteMerch(sb(), id)
}

export async function supabaseAddLineup(
  profileId: string,
  input: UpsertLineupInput,
): Promise<ArtistLineupEntry> {
  return media.repoAddLineup(sb(), profileId, input)
}

export async function supabaseUpdateLineup(
  entryId: string,
  input: UpsertLineupInput,
): Promise<ArtistLineupEntry> {
  return media.repoUpdateLineup(sb(), entryId, input)
}

export async function supabaseDeleteLineup(id: string) {
  return media.repoDeleteLineup(sb(), id)
}

export async function supabaseAddBioTimeline(
  profileId: string,
  input: UpsertBioTimelineInput,
): Promise<ArtistBioTimelineEntry> {
  return media.repoAddBioTimeline(sb(), profileId, input)
}

export async function supabaseUpdateBioTimeline(
  entryId: string,
  input: UpsertBioTimelineInput,
): Promise<ArtistBioTimelineEntry> {
  return media.repoUpdateBioTimeline(sb(), entryId, input)
}

export async function supabaseDeleteBioTimeline(id: string) {
  return media.repoDeleteBioTimeline(sb(), id)
}

export async function supabaseAddVideo(
  profileId: string,
  input: UpsertVideoInput,
): Promise<ArtistVideo> {
  return media.repoAddVideo(sb(), profileId, input)
}

export async function supabaseUpdateTrack(
  trackId: string,
  input: UpsertTrackInput,
): Promise<ArtistTrack> {
  return media.repoUpdateTrack(sb(), trackId, input)
}

export async function supabaseUpdateAlbum(
  albumId: string,
  input: UpsertAlbumInput,
): Promise<ArtistAlbum> {
  return media.repoUpdateAlbum(sb(), albumId, input)
}

export async function supabaseUpdateVideo(
  videoId: string,
  input: UpsertVideoInput,
): Promise<ArtistVideo> {
  return media.repoUpdateVideo(sb(), videoId, input)
}

export async function supabasePatchTrackCover(trackId: string, coverUrl: string) {
  const { error } = await sb()
    .from('artist_tracks')
    .update({ cover_url: coverUrl.trim() })
    .eq('id', trackId)
  if (error) throw new Error(error.message)
}

export async function supabasePatchVideoThumbnail(videoId: string, thumbnailUrl: string) {
  const { error } = await sb()
    .from('artist_videos')
    .update({ thumbnail_url: thumbnailUrl.trim() })
    .eq('id', videoId)
  if (error) throw new Error(error.message)
}

export async function supabaseDeleteAlbum(id: string) {
  return media.repoDeleteAlbum(sb(), id)
}

export async function supabaseDeleteTrack(id: string) {
  return media.repoDeleteTrack(sb(), id)
}

export async function supabaseDeleteVideo(id: string) {
  return media.repoDeleteVideo(sb(), id)
}

export async function supabaseListProfilesForEditor(): Promise<ArtistProfile[]> {
  const { data, error } = await sb().from('artist_profiles').select('*').order('display_name')
  if (error) throw new Error(error.message)
  return (data as ArtistProfileRow[]).map(mapArtistProfileRow)
}

export async function supabaseListPublishedProfiles(): Promise<ArtistProfile[]> {
  const { data, error } = await sb()
    .from('artist_profiles')
    .select('*')
    .eq('published', true)
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return filterDiscoverProfiles((data as ArtistProfileRow[]).map(mapArtistProfileRow))
}

export async function supabaseGetEditorialForProfile(profileId: string) {
  return media.repoGetEditorialForProfile(sb(), profileId)
}
