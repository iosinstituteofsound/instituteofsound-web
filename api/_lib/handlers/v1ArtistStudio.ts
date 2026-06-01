import { requireAuth, resolveSupabaseForRequest } from '../auth.js'
import { createSupabaseUserClient } from '../supabaseServer.js'
import { repoGetArtistProfileBySlug, repoGetArtistProfileByUserId } from '../../../src/lib/artist-profile/profileRepository.js'
import { evaluateArtistLifecycle } from '../../../src/lib/artist-profile/pageLifecycle.js'
import {
  repoAddAlbum,
  repoAddBioTimeline,
  repoAddLineup,
  repoAddMerch,
  repoAddTrack,
  repoAddVideo,
  repoAssertOwnedProfileId,
  repoAssertProfileOwner,
  repoDeleteAlbum,
  repoDeleteBioTimeline,
  repoDeleteLineup,
  repoDeleteMerch,
  repoDeleteTrack,
  repoDeleteVideo,
  repoGetAlbumProfileId,
  repoGetAlbums,
  repoGetBioTimeline,
  repoGetBioTimelineProfileId,
  repoGetEditorialForProfile,
  repoGetLineup,
  repoGetLineupProfileId,
  repoGetMerch,
  repoGetMerchProfileId,
  repoGetTrackProfileId,
  repoGetTracks,
  repoGetVideoProfileId,
  repoGetVideos,
  repoListManagedArtistsByHandle,
  repoTouchArtistActivity,
  repoUpdateAlbum,
  repoUpdateBioTimeline,
  repoUpdateLineup,
  repoUpdateMerch,
  repoUpdateTrack,
  repoUpdateVideo,
} from '../../../src/lib/artist-profile/mediaRepository.js'
import type {
  UpsertAlbumInput,
  UpsertBioTimelineInput,
  UpsertLineupInput,
  UpsertMerchInput,
  UpsertTrackInput,
  UpsertVideoInput,
} from '../../../src/lib/artist-profile/types.js'
import { queryParam, type ApiRequest, type ApiResponse } from '../http.js'
import { requireQueryParam, requireValidatedBody } from '../validate.js'
import { repoTouchArtistActivity as repoTouchArtistPageActivityRpc } from '../../../src/lib/community/feedRepository.js'
import {
  artistAlbumCreateBody,
  artistAlbumDeleteBody,
  artistAlbumUpdateBody,
  artistBioCreateBody,
  artistBioDeleteBody,
  artistBioUpdateBody,
  artistLineupCreateBody,
  artistLineupDeleteBody,
  artistLineupUpdateBody,
  artistMerchCreateBody,
  artistMerchDeleteBody,
  artistMerchUpdateBody,
  artistTrackCreateBody,
  artistTrackDeleteBody,
  artistTrackUpdateBody,
  artistVideoCreateBody,
  artistVideoDeleteBody,
  artistVideoUpdateBody,
} from '../schemas/v1Bodies.js'
import { zSlug } from '../schemas/v1Common.js'

function send(res: ApiResponse, status: number, body: unknown): true {
  res.status(status).json(body)
  return true
}

async function loadArtistPage(supabase: ReturnType<typeof createSupabaseUserClient>, slug: string) {
  const profile = await repoGetArtistProfileBySlug(supabase, slug)
  if (!profile) return null

  const [tracks, albums, videos, merch, lineup, bioTimeline, editorialRows] = await Promise.all([
    repoGetTracks(supabase, profile.id),
    repoGetAlbums(supabase, profile.id),
    repoGetVideos(supabase, profile.id),
    repoGetMerch(supabase, profile.id),
    repoGetLineup(supabase, profile.id),
    repoGetBioTimeline(supabase, profile.id),
    repoGetEditorialForProfile(supabase, profile.id),
  ])

  const verdict = evaluateArtistLifecycle(profile, {
    trackCount: tracks.length,
    videoCount: videos.length,
  })
  if (verdict.action === 'delete') return null

  return {
    profile,
    tracks,
    albums: albums.filter((a) => a.releaseType === 'album'),
    singles: albums.filter((a) => a.releaseType === 'single' || a.releaseType === 'ep'),
    videos,
    merch,
    lineup,
    bioTimeline,
    editorialRows,
  }
}

export async function handleV1ArtistStudio(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<boolean> {
  if (!pathname.startsWith('/api/v1/artist/')) return false
  if (pathname === '/api/v1/artist/profile') return false

  if (pathname === '/api/v1/artist/page' && req.method === 'GET') {
    const slug = requireQueryParam(res, req, 'slug', zSlug)
    if (!slug) return true
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const page = await loadArtistPage(resolved.supabase, slug)
      return send(res, 200, { page })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/artist/managed' && req.method === 'GET') {
    const handle = requireQueryParam(res, req, 'handle')
    if (!handle) return true
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const artists = await repoListManagedArtistsByHandle(resolved.supabase, handle)
      return send(res, 200, { artists })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/artist/studio' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const profile = await repoGetArtistProfileByUserId(supabase, auth.authUser.id)
      if (!profile) return send(res, 200, { studio: null })
      const [tracks, albums, videos, merch, lineup, bioTimeline] = await Promise.all([
        repoGetTracks(supabase, profile.id),
        repoGetAlbums(supabase, profile.id),
        repoGetVideos(supabase, profile.id),
        repoGetMerch(supabase, profile.id),
        repoGetLineup(supabase, profile.id),
        repoGetBioTimeline(supabase, profile.id),
      ])
      return send(res, 200, {
        studio: { profile, tracks, albums, videos, merch, lineup, bioTimeline },
      })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/artist/activity/touch' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    const profileId =
      typeof req.body === 'object' && req.body !== null && 'profileId' in req.body
        ? String((req.body as { profileId?: string }).profileId ?? '').trim()
        : ''
    try {
      if (profileId) {
        await repoTouchArtistActivity(supabase, profileId)
      } else {
        await repoTouchArtistPageActivityRpc(supabase, auth.authUser.id)
      }
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  const auth = await requireAuth(req)
  if ('error' in auth) return send(res, auth.status, { error: auth.error })
  const supabase = createSupabaseUserClient(auth.accessToken)
  const userId = auth.authUser.id

  const touch = async (profileId: string) => {
    await repoTouchArtistActivity(supabase, profileId)
  }

  if (pathname === '/api/v1/artist/albums') {
    if (req.method === 'POST') {
      const body = requireValidatedBody(res, artistAlbumCreateBody, req.body)
      if (!body) return true
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const album = await repoAddAlbum(supabase, body.profileId, body.input as unknown as UpsertAlbumInput)
        await touch(body.profileId)
        return send(res, 201, { album })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = requireValidatedBody(res, artistAlbumUpdateBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetAlbumProfileId(supabase, body.albumId as string),
        )
        const album = await repoUpdateAlbum(supabase, body.albumId as string, body.input as unknown as UpsertAlbumInput)
        await touch(profileId)
        return send(res, 200, { album })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = requireValidatedBody(res, artistAlbumDeleteBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetAlbumProfileId(supabase, body.albumId),
        )
        await repoDeleteAlbum(supabase, body.albumId)
        await touch(profileId)
        return send(res, 200, { ok: true })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
  }

  if (pathname === '/api/v1/artist/tracks') {
    if (req.method === 'POST') {
      const body = requireValidatedBody(res, artistTrackCreateBody, req.body)
      if (!body) return true
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const track = await repoAddTrack(supabase, body.profileId, body.input as unknown as UpsertTrackInput)
        await touch(body.profileId)
        return send(res, 201, { track })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = requireValidatedBody(res, artistTrackUpdateBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetTrackProfileId(supabase, body.trackId as string),
        )
        const track = await repoUpdateTrack(
          supabase,
          body.trackId as string,
          body.input as unknown as UpsertTrackInput,
        )
        await touch(profileId)
        return send(res, 200, { track })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = requireValidatedBody(res, artistTrackDeleteBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetTrackProfileId(supabase, body.trackId),
        )
        await repoDeleteTrack(supabase, body.trackId)
        await touch(profileId)
        return send(res, 200, { ok: true })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
  }

  if (pathname === '/api/v1/artist/videos') {
    if (req.method === 'POST') {
      const body = requireValidatedBody(res, artistVideoCreateBody, req.body)
      if (!body) return true
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const video = await repoAddVideo(supabase, body.profileId, body.input as unknown as UpsertVideoInput)
        await touch(body.profileId)
        return send(res, 201, { video })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = requireValidatedBody(res, artistVideoUpdateBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetVideoProfileId(supabase, body.videoId as string),
        )
        const video = await repoUpdateVideo(
          supabase,
          body.videoId as string,
          body.input as unknown as UpsertVideoInput,
        )
        await touch(profileId)
        return send(res, 200, { video })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = requireValidatedBody(res, artistVideoDeleteBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetVideoProfileId(supabase, body.videoId),
        )
        await repoDeleteVideo(supabase, body.videoId)
        await touch(profileId)
        return send(res, 200, { ok: true })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
  }

  if (pathname === '/api/v1/artist/merch') {
    if (req.method === 'POST') {
      const body = requireValidatedBody(res, artistMerchCreateBody, req.body)
      if (!body) return true
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const merch = await repoAddMerch(supabase, body.profileId, body.input as unknown as UpsertMerchInput)
        await touch(body.profileId)
        return send(res, 201, { merch })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = requireValidatedBody(res, artistMerchUpdateBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetMerchProfileId(supabase, body.merchId as string),
        )
        const merch = await repoUpdateMerch(
          supabase,
          body.merchId as string,
          body.input as unknown as UpsertMerchInput,
        )
        await touch(profileId)
        return send(res, 200, { merch })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = requireValidatedBody(res, artistMerchDeleteBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetMerchProfileId(supabase, body.merchId),
        )
        await repoDeleteMerch(supabase, body.merchId)
        await touch(profileId)
        return send(res, 200, { ok: true })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
  }

  if (pathname === '/api/v1/artist/lineup') {
    if (req.method === 'POST') {
      const body = requireValidatedBody(res, artistLineupCreateBody, req.body)
      if (!body) return true
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const entry = await repoAddLineup(supabase, body.profileId, body.input as unknown as UpsertLineupInput)
        await touch(body.profileId)
        return send(res, 201, { entry })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = requireValidatedBody(res, artistLineupUpdateBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetLineupProfileId(supabase, body.entryId as string),
        )
        const entry = await repoUpdateLineup(
          supabase,
          body.entryId as string,
          body.input as unknown as UpsertLineupInput,
        )
        await touch(profileId)
        return send(res, 200, { entry })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = requireValidatedBody(res, artistLineupDeleteBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetLineupProfileId(supabase, body.entryId),
        )
        await repoDeleteLineup(supabase, body.entryId)
        await touch(profileId)
        return send(res, 200, { ok: true })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
  }

  if (pathname === '/api/v1/artist/bio-timeline') {
    if (req.method === 'POST') {
      const body = requireValidatedBody(res, artistBioCreateBody, req.body)
      if (!body) return true
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const entry = await repoAddBioTimeline(
          supabase,
          body.profileId,
          body.input as unknown as UpsertBioTimelineInput,
        )
        await touch(body.profileId)
        return send(res, 201, { entry })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = requireValidatedBody(res, artistBioUpdateBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetBioTimelineProfileId(supabase, body.entryId as string),
        )
        const entry = await repoUpdateBioTimeline(
          supabase,
          body.entryId as string,
          body.input as unknown as UpsertBioTimelineInput,
        )
        await touch(profileId)
        return send(res, 200, { entry })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = requireValidatedBody(res, artistBioDeleteBody, req.body)
      if (!body) return true
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetBioTimelineProfileId(supabase, body.entryId),
        )
        await repoDeleteBioTimeline(supabase, body.entryId)
        await touch(profileId)
        return send(res, 200, { ok: true })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
  }

  return false
}
