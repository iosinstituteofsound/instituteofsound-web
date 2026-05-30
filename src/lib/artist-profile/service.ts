import { getArtists } from '@/api/endpoints'
import { isV1ApiEnabled, v1GetArtistProfile, v1PutArtistProfile } from '@/api/v1Client'
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
  v1ListManagedArtists,
  v1UpdateArtistAlbum,
  v1UpdateArtistBioTimeline,
  v1UpdateArtistLineup,
  v1UpdateArtistMerch,
  v1UpdateArtistTrack,
  v1UpdateArtistVideo,
} from '@/api/v1ArtistStudioClient'
import { withV1Fallback } from '@/api/v1Fallback'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1ListDiscoverArtistProfiles, v1ListArtistProfilesForEditor } from '@/api/v1Phase5Client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { getDrafts } from '@/lib/auth/storage'
import type { Artist } from '@/types'
import type { User } from '@/lib/auth/types'
import { mergeDiscoverArtists } from './discover'
import {
  enforceArtistPageLifecycle,
  getProfileForUserAfterLifecycle,
  touchArtistPageActivityByProfileId,
} from './pageEnforcement'
import { resolveArtistPageForViewer } from './profileVisibility'
import type {
  ArtistEditorialFeature,
  ManagedArtistSummary,
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
import { fetchEditorProfilesForDrafts } from '@/lib/editorial/published'
import { editorialExcerpt } from '@/lib/editorial/richText'
import { fetchThumbnailFromUrl } from '@/lib/media/thumbnailFromUrl'
import { enrichTracksWithThumbnails, enrichVideosWithThumbnails } from './enrichMedia'
import * as local from './storage'
import * as sb from './supabaseProfile'

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
  if (isV1ApiEnabled() && isSupabaseConfigured()) {
    return withV1Fallback(
      async () => {
        const { profile } = await v1GetArtistProfile()
        if (!profile || profile.userId !== userId) return null
        return enforceArtistPageLifecycle(profile)
      },
      () => getProfileForUserAfterLifecycle(userId),
    )
  }
  return getProfileForUserAfterLifecycle(userId)
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
  if (isV1ApiEnabled() && isSupabaseConfigured()) {
    return withV1Fallback(
      async () => {
        const { profile } = await v1PutArtistProfile(payload)
        return (await enforceArtistPageLifecycle(profile)) ?? profile
      },
      async () => {
        const profile = await sb.supabaseUpsertProfile(user, payload)
        return (await enforceArtistPageLifecycle(profile)) ?? profile
      },
    )
  }
  const profile = isSupabaseConfigured()
    ? await sb.supabaseUpsertProfile(user, payload)
    : local.localUpsertProfile(user, payload)
  return (await enforceArtistPageLifecycle(profile)) ?? profile
}

export async function listManagedArtistsByHandle(
  handle: string
): Promise<ManagedArtistSummary[]> {
  if (!isSupabaseConfigured()) return local.localListManagedArtistsByHandle(handle)

  return viaV1Api(
    async () => {
      const { artists } = await v1ListManagedArtists(handle)
      return artists
    },
    () => sb.supabaseListManagedArtistsByHandle(handle),
  )
}

async function directGetArtistProfilePage(slug: string): Promise<ArtistProfilePageData | null> {
  const raw = await sb.supabaseGetProfileBySlug(slug)
  if (!raw) return null
  const profile = await enforceArtistPageLifecycle(raw)
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
    editorial: await mapEditorial(editorialRows),
    pickTrack,
  }
}

async function finalizeArtistPage(page: NonNullable<Awaited<ReturnType<typeof v1GetArtistPage>>['page']>): Promise<ArtistProfilePageData | null> {
  const profile = await enforceArtistPageLifecycle(page.profile)
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
    return viaV1Api(
      async () => {
        const { page } = await v1GetArtistPage(slug)
        if (!page) return null
        return finalizeArtistPage(page)
      },
      () => directGetArtistProfilePage(slug),
    )
  }

  const raw = local.localGetProfileBySlug(slug)
  if (!raw) return null
  const profile = await enforceArtistPageLifecycle(raw)
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
    : await viaV1Api(
        async () => {
          const { album } = await v1AddArtistAlbum({ profileId, input })
          return album
        },
        () => sb.supabaseAddAlbum(profileId, input),
      )
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
    : await viaV1Api(
        async () => {
          const { track } = await v1AddArtistTrack({ profileId, input: enriched })
          return track
        },
        () => sb.supabaseAddTrack(profileId, enriched),
      )
  await bumpProfileActivity(profileId)
  return row
}

export async function addArtistVideo(profileId: string, input: UpsertVideoInput) {
  const enriched = await videoWithThumbnail(input)
  const row = !isSupabaseConfigured()
    ? local.localAddVideo(profileId, enriched)
    : await viaV1Api(
        async () => {
          const { video } = await v1AddArtistVideo({ profileId, input: enriched })
          return video
        },
        () => sb.supabaseAddVideo(profileId, enriched),
      )
  await bumpProfileActivity(profileId)
  return row
}

export async function updateArtistTrack(trackId: string, input: UpsertTrackInput) {
  const enriched = await trackWithThumbnail(input)
  if (!isSupabaseConfigured()) return local.localUpdateTrack(trackId, enriched)
  return viaV1Api(
    async () => {
      const { track } = await v1UpdateArtistTrack({ trackId, input: enriched })
      return track
    },
    () => sb.supabaseUpdateTrack(trackId, enriched),
  )
}

export async function updateArtistAlbum(albumId: string, input: UpsertAlbumInput) {
  if (!isSupabaseConfigured()) return local.localUpdateAlbum(albumId, input)
  return viaV1Api(
    async () => {
      const { album } = await v1UpdateArtistAlbum({ albumId, input })
      return album
    },
    () => sb.supabaseUpdateAlbum(albumId, input),
  )
}

export async function updateArtistVideo(videoId: string, input: UpsertVideoInput) {
  const enriched = await videoWithThumbnail(input)
  if (!isSupabaseConfigured()) return local.localUpdateVideo(videoId, enriched)
  return viaV1Api(
    async () => {
      const { video } = await v1UpdateArtistVideo({ videoId, input: enriched })
      return video
    },
    () => sb.supabaseUpdateVideo(videoId, enriched),
  )
}

export async function deleteArtistAlbum(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteAlbum(id)
    return
  }
  await viaV1Api(
    () => v1DeleteArtistAlbum(id),
    () => sb.supabaseDeleteAlbum(id),
  )
}

export async function deleteArtistTrack(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteTrack(id)
    return
  }
  await viaV1Api(
    () => v1DeleteArtistTrack(id),
    () => sb.supabaseDeleteTrack(id),
  )
}

export async function deleteArtistVideo(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteVideo(id)
    return
  }
  await viaV1Api(
    () => v1DeleteArtistVideo(id),
    () => sb.supabaseDeleteVideo(id),
  )
}

export async function addArtistMerch(profileId: string, input: UpsertMerchInput) {
  const enriched = await merchWithThumbnail(input)
  if (!isSupabaseConfigured()) return local.localAddMerch(profileId, enriched)
  return viaV1Api(
    async () => {
      const { merch } = await v1AddArtistMerch({ profileId, input: enriched })
      return merch
    },
    () => sb.supabaseAddMerch(profileId, enriched),
  )
}

export async function updateArtistMerch(merchId: string, input: UpsertMerchInput) {
  const enriched = await merchWithThumbnail(input)
  if (!isSupabaseConfigured()) return local.localUpdateMerch(merchId, enriched)
  return viaV1Api(
    async () => {
      const { merch } = await v1UpdateArtistMerch({ merchId, input: enriched })
      return merch
    },
    () => sb.supabaseUpdateMerch(merchId, enriched),
  )
}

export async function deleteArtistMerch(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteMerch(id)
    return
  }
  await viaV1Api(
    () => v1DeleteArtistMerch(id),
    () => sb.supabaseDeleteMerch(id),
  )
}

export async function addArtistLineup(profileId: string, input: UpsertLineupInput) {
  if (!isSupabaseConfigured()) return local.localAddLineup(profileId, input)
  return viaV1Api(
    async () => {
      const { entry } = await v1AddArtistLineup({ profileId, input })
      return entry
    },
    () => sb.supabaseAddLineup(profileId, input),
  )
}

export async function updateArtistLineup(entryId: string, input: UpsertLineupInput) {
  if (!isSupabaseConfigured()) return local.localUpdateLineup(entryId, input)
  return viaV1Api(
    async () => {
      const { entry } = await v1UpdateArtistLineup({ entryId, input })
      return entry
    },
    () => sb.supabaseUpdateLineup(entryId, input),
  )
}

export async function deleteArtistLineup(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteLineup(id)
    return
  }
  await viaV1Api(
    () => v1DeleteArtistLineup(id),
    () => sb.supabaseDeleteLineup(id),
  )
}

export async function addArtistBioTimeline(profileId: string, input: UpsertBioTimelineInput) {
  const row = !isSupabaseConfigured()
    ? local.localAddBioTimeline(profileId, input)
    : await viaV1Api(
        async () => {
          const { entry } = await v1AddArtistBioTimeline({ profileId, input })
          return entry
        },
        () => sb.supabaseAddBioTimeline(profileId, input),
      )
  await bumpProfileActivity(profileId)
  return row
}

export async function updateArtistBioTimeline(entryId: string, input: UpsertBioTimelineInput) {
  if (!isSupabaseConfigured()) return local.localUpdateBioTimeline(entryId, input)
  return viaV1Api(
    async () => {
      const { entry } = await v1UpdateArtistBioTimeline({ entryId, input })
      return entry
    },
    () => sb.supabaseUpdateBioTimeline(entryId, input),
  )
}

export async function deleteArtistBioTimeline(id: string) {
  if (!isSupabaseConfigured()) {
    local.localDeleteBioTimeline(id)
    return
  }
  await viaV1Api(
    () => v1DeleteArtistBioTimeline(id),
    () => sb.supabaseDeleteBioTimeline(id),
  )
}

export async function listArtistProfilesForEditor(): Promise<ArtistProfile[]> {
  if (!isSupabaseConfigured()) return local.localGetProfiles()
  return viaV1Api(
    async () => {
      const { profiles } = await v1ListArtistProfilesForEditor()
      return profiles
    },
    () => sb.supabaseListProfilesForEditor(),
  )
}

/** Published artist profiles + legacy demo artists (deduped by slug) */
export async function listDiscoverArtists(): Promise<Artist[]> {
  const legacy = await getArtists().catch(() => [] as Artist[])
  const published = isSupabaseConfigured()
    ? await viaV1Api(
        async () => {
          const { profiles } = await v1ListDiscoverArtistProfiles()
          return profiles
        },
        () => sb.supabaseListPublishedProfiles(),
      )
    : local.localListPublishedProfiles()
  return mergeDiscoverArtists(published, legacy)
}
