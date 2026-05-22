import { getArtists } from '@/api/endpoints'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { getDrafts } from '@/lib/auth/storage'
import type { Artist } from '@/types'
import type { User } from '@/lib/auth/types'
import { mergeDiscoverArtists } from './discover'
import type {
  ArtistEditorialFeature,
  ArtistProfile,
  ArtistProfilePageData,
  UpsertAlbumInput,
  UpsertArtistProfileInput,
  UpsertBioTimelineInput,
  UpsertLineupInput,
  UpsertMerchInput,
  UpsertTrackInput,
  UpsertVideoInput,
} from './types'
import { fetchThumbnailFromUrl } from '@/lib/media/thumbnailFromUrl'
import { enrichTracksWithThumbnails, enrichVideosWithThumbnails } from './enrichMedia'
import * as local from './storage'
import * as sb from './supabaseProfile'

function mapEditorial(
  rows: {
    id: string
    type: string
    title: string
    subject: string
    body: string
    cover_image_url?: string | null
    editor_name: string
    updated_at: string
  }[]
): ArtistEditorialFeature[] {
  return rows.map((r) => ({
    id: r.id,
    type: r.type as ArtistEditorialFeature['type'],
    title: r.title,
    subject: r.subject,
    excerpt: r.body.slice(0, 180) + (r.body.length > 180 ? '…' : ''),
    coverImageUrl: r.cover_image_url ?? undefined,
    editorName: r.editor_name,
    publishedAt: r.updated_at,
  }))
}

function localEditorialForProfile(profileId: string): ArtistEditorialFeature[] {
  const links = local.localGetEditorialLinks()[profileId] ?? []
  return getDrafts()
    .filter(
      (d) =>
        d.status === 'published' &&
        (d.artistProfileId === profileId || links.includes(d.id))
    )
    .map((d) => ({
      id: d.id,
      type: d.type,
      title: d.title,
      subject: d.subject,
      excerpt: d.body.slice(0, 180) + (d.body.length > 180 ? '…' : ''),
      coverImageUrl: d.coverImageUrl,
      editorName: d.editorName,
      publishedAt: d.updatedAt,
    }))
}

export async function getProfileForUser(userId: string): Promise<ArtistProfile | null> {
  if (isSupabaseConfigured()) return sb.supabaseGetProfileByUserId(userId)
  return local.localGetProfileByUserId(userId)
}

export async function upsertArtistProfile(
  user: User,
  input: UpsertArtistProfileInput
): Promise<ArtistProfile> {
  if (isSupabaseConfigured()) return sb.supabaseUpsertProfile(user, input)
  return local.localUpsertProfile(user, input)
}

export async function getArtistProfilePage(slug: string): Promise<ArtistProfilePageData | null> {
  if (isSupabaseConfigured()) {
    const profile = await sb.supabaseGetProfileBySlug(slug)
    if (!profile) return null
    const [tracks, albums, videos, merch, lineup, bioTimeline, editorialRows] =
      await Promise.all([
        sb.supabaseGetTracks(profile.id),
        sb.supabaseGetAlbums(profile.id),
        sb.supabaseGetVideos(profile.id),
        sb.supabaseGetMerch(profile.id),
        sb.supabaseGetLineup(profile.id),
        sb.supabaseGetBioTimeline(profile.id),
        sb.supabaseGetEditorialForProfile(profile.id),
      ])
    const [enrichedTracks, enrichedVideos] = await Promise.all([
      enrichTracksWithThumbnails(tracks, true),
      enrichVideosWithThumbnails(videos, true),
    ])
    const albumList = albums.filter((a) => a.releaseType === 'album')
    const singles = albums.filter((a) => a.releaseType === 'single' || a.releaseType === 'ep')
    const pickTrack = profile.artistPickTrackId
      ? enrichedTracks.find((t) => t.id === profile.artistPickTrackId)
      : enrichedTracks[0]
    return {
      profile,
      tracks: enrichedTracks,
      albums: albumList,
      singles,
      videos: enrichedVideos,
      merch,
      lineup,
      bioTimeline,
      editorial: mapEditorial(editorialRows),
      pickTrack,
    }
  }

  const profile = local.localGetProfileBySlug(slug)
  if (!profile) return null
  const data = local.localGetPageData(slug, localEditorialForProfile(profile.id))
  if (!data) return null
  const [tracks, videos] = await Promise.all([
    enrichTracksWithThumbnails(data.tracks),
    enrichVideosWithThumbnails(data.videos),
  ])
  const pickTrack = data.profile.artistPickTrackId
    ? tracks.find((t) => t.id === data.profile.artistPickTrackId)
    : tracks[0]
  return { ...data, tracks, videos, pickTrack }
}

export async function getArtistProfilePageForViewer(
  slug: string,
  viewerId?: string
): Promise<ArtistProfilePageData | null> {
  const data = await getArtistProfilePage(slug)
  if (!data) return null
  if (data.profile.published) return data
  if (viewerId && data.profile.userId === viewerId) return data
  return null
}

export async function addArtistAlbum(profileId: string, input: UpsertAlbumInput) {
  if (isSupabaseConfigured()) return sb.supabaseAddAlbum(profileId, input)
  return local.localAddAlbum(profileId, input)
}

async function trackWithThumbnail(input: UpsertTrackInput): Promise<UpsertTrackInput> {
  if (input.coverUrl?.trim() || !input.streamUrl?.trim()) return input
  const coverUrl = await fetchThumbnailFromUrl(input.streamUrl)
  return coverUrl ? { ...input, coverUrl } : input
}

async function videoWithThumbnail(input: UpsertVideoInput): Promise<UpsertVideoInput> {
  if (input.thumbnailUrl?.trim() || !input.videoUrl?.trim()) return input
  const thumbnailUrl = await fetchThumbnailFromUrl(input.videoUrl)
  return thumbnailUrl ? { ...input, thumbnailUrl } : input
}

async function merchWithThumbnail(input: UpsertMerchInput): Promise<UpsertMerchInput> {
  if (input.imageUrl?.trim() || !input.productUrl?.trim()) return input
  const imageUrl = await fetchThumbnailFromUrl(input.productUrl)
  return imageUrl ? { ...input, imageUrl } : input
}

export async function addArtistTrack(profileId: string, input: UpsertTrackInput) {
  const enriched = await trackWithThumbnail(input)
  if (isSupabaseConfigured()) return sb.supabaseAddTrack(profileId, enriched)
  return local.localAddTrack(profileId, enriched)
}

export async function addArtistVideo(profileId: string, input: UpsertVideoInput) {
  const enriched = await videoWithThumbnail(input)
  if (isSupabaseConfigured()) return sb.supabaseAddVideo(profileId, enriched)
  return local.localAddVideo(profileId, enriched)
}

export async function updateArtistTrack(trackId: string, input: UpsertTrackInput) {
  const enriched = await trackWithThumbnail(input)
  if (isSupabaseConfigured()) return sb.supabaseUpdateTrack(trackId, enriched)
  return local.localUpdateTrack(trackId, enriched)
}

export async function updateArtistAlbum(albumId: string, input: UpsertAlbumInput) {
  if (isSupabaseConfigured()) return sb.supabaseUpdateAlbum(albumId, input)
  return local.localUpdateAlbum(albumId, input)
}

export async function updateArtistVideo(videoId: string, input: UpsertVideoInput) {
  const enriched = await videoWithThumbnail(input)
  if (isSupabaseConfigured()) return sb.supabaseUpdateVideo(videoId, enriched)
  return local.localUpdateVideo(videoId, enriched)
}

export async function deleteArtistAlbum(id: string) {
  if (isSupabaseConfigured()) return sb.supabaseDeleteAlbum(id)
  local.localDeleteAlbum(id)
}

export async function deleteArtistTrack(id: string) {
  if (isSupabaseConfigured()) return sb.supabaseDeleteTrack(id)
  local.localDeleteTrack(id)
}

export async function deleteArtistVideo(id: string) {
  if (isSupabaseConfigured()) return sb.supabaseDeleteVideo(id)
  local.localDeleteVideo(id)
}

export async function addArtistMerch(profileId: string, input: UpsertMerchInput) {
  const enriched = await merchWithThumbnail(input)
  if (isSupabaseConfigured()) return sb.supabaseAddMerch(profileId, enriched)
  return local.localAddMerch(profileId, enriched)
}

export async function updateArtistMerch(merchId: string, input: UpsertMerchInput) {
  const enriched = await merchWithThumbnail(input)
  if (isSupabaseConfigured()) return sb.supabaseUpdateMerch(merchId, enriched)
  return local.localUpdateMerch(merchId, enriched)
}

export async function deleteArtistMerch(id: string) {
  if (isSupabaseConfigured()) return sb.supabaseDeleteMerch(id)
  local.localDeleteMerch(id)
}

export async function addArtistLineup(profileId: string, input: UpsertLineupInput) {
  if (isSupabaseConfigured()) return sb.supabaseAddLineup(profileId, input)
  return local.localAddLineup(profileId, input)
}

export async function updateArtistLineup(entryId: string, input: UpsertLineupInput) {
  if (isSupabaseConfigured()) return sb.supabaseUpdateLineup(entryId, input)
  return local.localUpdateLineup(entryId, input)
}

export async function deleteArtistLineup(id: string) {
  if (isSupabaseConfigured()) return sb.supabaseDeleteLineup(id)
  local.localDeleteLineup(id)
}

export async function addArtistBioTimeline(profileId: string, input: UpsertBioTimelineInput) {
  if (isSupabaseConfigured()) return sb.supabaseAddBioTimeline(profileId, input)
  return local.localAddBioTimeline(profileId, input)
}

export async function updateArtistBioTimeline(entryId: string, input: UpsertBioTimelineInput) {
  if (isSupabaseConfigured()) return sb.supabaseUpdateBioTimeline(entryId, input)
  return local.localUpdateBioTimeline(entryId, input)
}

export async function deleteArtistBioTimeline(id: string) {
  if (isSupabaseConfigured()) return sb.supabaseDeleteBioTimeline(id)
  local.localDeleteBioTimeline(id)
}

export async function listArtistProfilesForEditor(): Promise<ArtistProfile[]> {
  if (isSupabaseConfigured()) return sb.supabaseListProfilesForEditor()
  return local.localGetProfiles()
}

/** Published artist profiles + legacy demo artists (deduped by slug) */
export async function listDiscoverArtists(): Promise<Artist[]> {
  const legacy = await getArtists().catch(() => [] as Artist[])
  const published = isSupabaseConfigured()
    ? await sb.supabaseListPublishedProfiles()
    : local.localListPublishedProfiles()
  return mergeDiscoverArtists(published, legacy)
}
