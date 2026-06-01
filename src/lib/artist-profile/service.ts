import { getArtists } from '@/api/endpoints'
import { v1GetArtistProfile, v1PutArtistProfile } from '@/api/v1Client'
import {
  v1AddArtistAlbum,
  v1AddArtistBioTimeline,
  v1AddArtistLineup,
  v1AddArtistMerch,
  v1AddArtistTrack,
  v1AddArtistVideo,
  v1DeleteArtistAlbum,
  v1DeleteArtistBioTimeline,
  v1DeleteArtistLineup,
  v1DeleteArtistMerch,
  v1DeleteArtistTrack,
  v1DeleteArtistVideo,
  v1GetArtistPage,
  v1GetArtistStudio,
  v1ListManagedArtists,
  v1UpdateArtistAlbum,
  v1UpdateArtistBioTimeline,
  v1UpdateArtistLineup,
  v1UpdateArtistMerch,
  v1UpdateArtistTrack,
  v1UpdateArtistVideo,
} from '@/api/v1ArtistStudioClient'
import { v1ListDiscoverArtistProfiles, v1ListArtistProfilesForEditor } from '@/api/v1Phase5Client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { getDrafts } from '@/lib/auth/storage'
import type { Artist } from '@/types'
import type { User } from '@/lib/auth/types'
import { mergeDiscoverArtists } from './discover'
import { hideIfExpiredPublicPage, touchArtistPageActivityByProfileId } from './pageEnforcement'
import { resolveArtistPageForViewer } from './profileVisibility'
import type {
  ArtistEditorialFeature,
  ManagedArtistSummary,
  ArtistProfile,
  ArtistProfilePageData,
  ArtistAlbum,
  ArtistBioTimelineEntry,
  ArtistLineupEntry,
  ArtistMerchItem,
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
import { fetchEditorProfilesForDrafts } from '@/lib/editorial/published'
import { editorialExcerpt } from '@/lib/editorial/richText'
import { fetchThumbnailFromUrl } from '@/lib/media/thumbnailFromUrl'
import { enrichTracksWithThumbnails, enrichVideosWithThumbnails } from './enrichMedia'
import * as local from './storage'
async function mapEditorial(
  rows: {
    id: string
    type: string
    title: string
    subject: string
    body: string
    slug?: string | null
    cover_image_url?: string | null
    editor_id: string
    editor_name: string
    updated_at: string
  }[]
): Promise<ArtistEditorialFeature[]> {
  const editors = await fetchEditorProfilesForDrafts(rows.map((r) => r.editor_id))
  return rows.map((r) => {
    const live = editors.get(r.editor_id)
    const authorName = live?.name?.trim() || r.editor_name
    const authorUsername = live?.username?.trim() || undefined
    return {
      id: r.id,
      slug: r.slug?.trim() || r.id,
      type: r.type as ArtistEditorialFeature['type'],
      title: r.title,
      subject: r.subject,
      excerpt: editorialExcerpt(r.body),
      coverImageUrl: r.cover_image_url ?? undefined,
      editorName: authorName,
      editorUsername: authorUsername,
      publishedAt: r.updated_at,
    }
  })
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
      slug: d.slug ?? d.id,
      type: d.type,
      title: d.title,
      subject: d.subject,
      excerpt: editorialExcerpt(d.body),
      coverImageUrl: d.coverImageUrl,
      editorName: d.editorName,
      publishedAt: d.updatedAt,
    }))
}

export async function getProfileForUser(userId: string): Promise<ArtistProfile | null> {
  if (!isSupabaseConfigured()) {
    return local.localGetProfileByUserId(userId)
  }
  const { profile } = await v1GetArtistProfile()
  if (!profile || profile.userId !== userId) return null
  return profile
}

export async function upsertArtistProfile(
  user: User,
  input: UpsertArtistProfileInput
): Promise<ArtistProfile> {
  const stamp = new Date().toISOString()
  const payload: UpsertArtistProfileInput = {
    ...input,
    lastActivityAt: stamp,
    pageRefreshedAt: stamp,
  }
  if (!isSupabaseConfigured()) {
    return local.localUpsertProfile(user, payload)
  }
  const { profile } = await v1PutArtistProfile(payload)
  return profile
}

export async function listManagedArtistsByHandle(
  handle: string
): Promise<ManagedArtistSummary[]> {
  if (!isSupabaseConfigured()) return local.localListManagedArtistsByHandle(handle)

  const { artists } = await v1ListManagedArtists(handle)
  return artists
}

export type ArtistStudioChildData = {
  tracks: ArtistTrack[]
  albums: ArtistAlbum[]
  videos: ArtistVideo[]
  merch: ArtistMerchItem[]
  lineup: ArtistLineupEntry[]
  bioTimeline: ArtistBioTimelineEntry[]
}

export async function loadArtistStudioChildData(
  profileId: string,
): Promise<ArtistStudioChildData & { trackCount: number; videoCount: number }> {
  if (!isSupabaseConfigured()) {
    const tracks = local.localGetTracks(profileId)
    const videos = local.localGetVideos(profileId)
    return {
      tracks,
      albums: local.localGetAlbums(profileId),
      videos,
      merch: local.localGetMerch(profileId),
      lineup: local.localGetLineup(profileId),
      bioTimeline: local.localGetBioTimeline(profileId),
      trackCount: tracks.length,
      videoCount: videos.length,
    }
  }

  const { studio } = await v1GetArtistStudio()
  if (!studio || studio.profile.id !== profileId) {
    throw new Error('Studio data unavailable for this profile.')
  }
  return {
    tracks: studio.tracks,
    albums: studio.albums,
    videos: studio.videos,
    merch: studio.merch,
    lineup: studio.lineup,
    bioTimeline: studio.bioTimeline,
    trackCount: studio.tracks.length,
    videoCount: studio.videos.length,
  }
}

async function finalizeArtistPage(page: NonNullable<Awaited<ReturnType<typeof v1GetArtistPage>>['page']>): Promise<ArtistProfilePageData | null> {
  const profile = hideIfExpiredPublicPage(page.profile, {
    trackCount: page.tracks.length,
    videoCount: page.videos.length,
  })
  if (!profile) return null
  const [enrichedTracks, enrichedVideos] = await Promise.all([
    enrichTracksWithThumbnails(page.tracks, true),
    enrichVideosWithThumbnails(page.videos, true),
  ])
  const pickTrack = profile.artistPickTrackId
    ? enrichedTracks.find((t) => t.id === profile.artistPickTrackId)
    : enrichedTracks[0]
  return {
    profile,
    tracks: enrichedTracks,
    albums: page.albums,
    singles: page.singles,
    videos: enrichedVideos,
    merch: page.merch,
    lineup: page.lineup,
    bioTimeline: page.bioTimeline,
    editorial: await mapEditorial(page.editorialRows),
    pickTrack,
  }
}

export async function getArtistProfilePage(slug: string): Promise<ArtistProfilePageData | null> {
  if (isSupabaseConfigured()) {
    const { page } = await v1GetArtistPage(slug)
    if (!page) return null
    return finalizeArtistPage(page)
  }

  const raw = local.localGetProfileBySlug(slug)
  if (!raw) return null
  const t = local.localGetTracks(raw.id)
  const v = local.localGetVideos(raw.id)
  const profile = hideIfExpiredPublicPage(raw, { trackCount: t.length, videoCount: v.length })
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
  return resolveArtistPageForViewer(data, viewerId)
}

async function bumpProfileActivity(profileId: string) {
  await touchArtistPageActivityByProfileId(profileId)
}

export async function addArtistAlbum(profileId: string, input: UpsertAlbumInput) {
  const row = !isSupabaseConfigured()
    ? local.localAddAlbum(profileId, input)
    : (await v1AddArtistAlbum({ profileId, input })).album
  await bumpProfileActivity(profileId)
  return row
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
  const row = !isSupabaseConfigured()
    ? local.localAddTrack(profileId, enriched)
    : (await v1AddArtistTrack({ profileId, input: enriched })).track
  await bumpProfileActivity(profileId)
  return row
}

export async function addArtistVideo(profileId: string, input: UpsertVideoInput) {
  const enriched = await videoWithThumbnail(input)
  const row = !isSupabaseConfigured()
    ? local.localAddVideo(profileId, enriched)
    : (await v1AddArtistVideo({ profileId, input: enriched })).video
  await bumpProfileActivity(profileId)
  return row
}

export async function updateArtistTrack(trackId: string, input: UpsertTrackInput) {
  const enriched = await trackWithThumbnail(input)
  if (!isSupabaseConfigured()) return local.localUpdateTrack(trackId, enriched)
  const { track } = await v1UpdateArtistTrack({ trackId, input: enriched })
  return track
}

export async function updateArtistAlbum(albumId: string, input: UpsertAlbumInput) {
  if (!isSupabaseConfigured()) return local.localUpdateAlbum(albumId, input)
  const { album } = await v1UpdateArtistAlbum({ albumId, input })
  return album
}

export async function updateArtistVideo(videoId: string, input: UpsertVideoInput) {
  const enriched = await videoWithThumbnail(input)
  if (!isSupabaseConfigured()) return local.localUpdateVideo(videoId, enriched)
  const { video } = await v1UpdateArtistVideo({ videoId, input: enriched })
  return video
}

export async function deleteArtistAlbum(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteAlbum(id)
    return
  }
  await v1DeleteArtistAlbum(id)
}

export async function deleteArtistTrack(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteTrack(id)
    return
  }
  await v1DeleteArtistTrack(id)
}

export async function deleteArtistVideo(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteVideo(id)
    return
  }
  await v1DeleteArtistVideo(id)
}

export async function addArtistMerch(profileId: string, input: UpsertMerchInput) {
  const enriched = await merchWithThumbnail(input)
  if (!isSupabaseConfigured()) return local.localAddMerch(profileId, enriched)
  const { merch } = await v1AddArtistMerch({ profileId, input: enriched })
  return merch
}

export async function updateArtistMerch(merchId: string, input: UpsertMerchInput) {
  const enriched = await merchWithThumbnail(input)
  if (!isSupabaseConfigured()) return local.localUpdateMerch(merchId, enriched)
  const { merch } = await v1UpdateArtistMerch({ merchId, input: enriched })
  return merch
}

export async function deleteArtistMerch(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteMerch(id)
    return
  }
  await v1DeleteArtistMerch(id)
}

export async function addArtistLineup(profileId: string, input: UpsertLineupInput) {
  if (!isSupabaseConfigured()) return local.localAddLineup(profileId, input)
  const { entry } = await v1AddArtistLineup({ profileId, input })
  return entry
}

export async function updateArtistLineup(entryId: string, input: UpsertLineupInput) {
  if (!isSupabaseConfigured()) return local.localUpdateLineup(entryId, input)
  const { entry } = await v1UpdateArtistLineup({ entryId, input })
  return entry
}

export async function deleteArtistLineup(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteLineup(id)
    return
  }
  await v1DeleteArtistLineup(id)
}

export async function addArtistBioTimeline(profileId: string, input: UpsertBioTimelineInput) {
  const row = !isSupabaseConfigured()
    ? local.localAddBioTimeline(profileId, input)
    : (await v1AddArtistBioTimeline({ profileId, input })).entry
  await bumpProfileActivity(profileId)
  return row
}

export async function updateArtistBioTimeline(entryId: string, input: UpsertBioTimelineInput) {
  if (!isSupabaseConfigured()) return local.localUpdateBioTimeline(entryId, input)
  const { entry } = await v1UpdateArtistBioTimeline({ entryId, input })
  return entry
}

export async function deleteArtistBioTimeline(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteBioTimeline(id)
    return
  }
  await v1DeleteArtistBioTimeline(id)
}

export async function listArtistProfilesForEditor(): Promise<ArtistProfile[]> {
  if (!isSupabaseConfigured()) return local.localGetProfiles()
  const { profiles } = await v1ListArtistProfilesForEditor()
  return profiles
}

/** Published artist profiles + legacy demo artists (deduped by slug) */
export async function listDiscoverArtists(): Promise<Artist[]> {
  const legacy = await getArtists().catch(() => [] as Artist[])
  const published = isSupabaseConfigured()
    ? (await v1ListDiscoverArtistProfiles()).profiles
    : local.localListPublishedProfiles()
  return mergeDiscoverArtists(published, legacy)
}
