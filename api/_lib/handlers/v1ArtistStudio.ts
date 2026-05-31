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
import { parseJsonBody, queryParam, type ApiRequest, type ApiResponse } from '../http.js'

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
    const slug = queryParam(req, 'slug')
    if (!slug) return send(res, 400, { error: 'slug required' })
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
    const handle = queryParam(req, 'handle')
    if (!handle) return send(res, 400, { error: 'handle required' })
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

  const auth = await requireAuth(req)
  if ('error' in auth) return send(res, auth.status, { error: auth.error })
  const supabase = createSupabaseUserClient(auth.accessToken)
  const userId = auth.authUser.id

  const touch = async (profileId: string) => {
    await repoTouchArtistActivity(supabase, profileId)
  }

  if (pathname === '/api/v1/artist/albums') {
    if (req.method === 'POST') {
      const body = parseJsonBody<{ profileId?: string; input?: UpsertAlbumInput }>(req.body)
      if (!body?.profileId || !body.input?.title) {
        return send(res, 400, { error: 'profileId and input.title required' })
      }
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const album = await repoAddAlbum(supabase, body.profileId, body.input)
        await touch(body.profileId)
        return send(res, 201, { album })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = parseJsonBody<{ albumId?: string; input?: UpsertAlbumInput }>(req.body)
      if (!body?.albumId || !body.input) return send(res, 400, { error: 'albumId and input required' })
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetAlbumProfileId(supabase, body.albumId),
        )
        const album = await repoUpdateAlbum(supabase, body.albumId, body.input)
        await touch(profileId)
        return send(res, 200, { album })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = parseJsonBody<{ albumId?: string }>(req.body)
      if (!body?.albumId) return send(res, 400, { error: 'albumId required' })
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
      const body = parseJsonBody<{ profileId?: string; input?: UpsertTrackInput }>(req.body)
      if (!body?.profileId || !body.input?.title) {
        return send(res, 400, { error: 'profileId and input required' })
      }
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const track = await repoAddTrack(supabase, body.profileId, body.input)
        await touch(body.profileId)
        return send(res, 201, { track })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = parseJsonBody<{ trackId?: string; input?: UpsertTrackInput }>(req.body)
      if (!body?.trackId || !body.input) return send(res, 400, { error: 'trackId and input required' })
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetTrackProfileId(supabase, body.trackId),
        )
        const track = await repoUpdateTrack(supabase, body.trackId, body.input)
        await touch(profileId)
        return send(res, 200, { track })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = parseJsonBody<{ trackId?: string }>(req.body)
      if (!body?.trackId) return send(res, 400, { error: 'trackId required' })
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
      const body = parseJsonBody<{ profileId?: string; input?: UpsertVideoInput }>(req.body)
      if (!body?.profileId || !body.input?.title) {
        return send(res, 400, { error: 'profileId and input required' })
      }
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const video = await repoAddVideo(supabase, body.profileId, body.input)
        await touch(body.profileId)
        return send(res, 201, { video })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = parseJsonBody<{ videoId?: string; input?: UpsertVideoInput }>(req.body)
      if (!body?.videoId || !body.input) return send(res, 400, { error: 'videoId and input required' })
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetVideoProfileId(supabase, body.videoId),
        )
        const video = await repoUpdateVideo(supabase, body.videoId, body.input)
        await touch(profileId)
        return send(res, 200, { video })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = parseJsonBody<{ videoId?: string }>(req.body)
      if (!body?.videoId) return send(res, 400, { error: 'videoId required' })
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
      const body = parseJsonBody<{ profileId?: string; input?: UpsertMerchInput }>(req.body)
      if (!body?.profileId || !body.input?.title) {
        return send(res, 400, { error: 'profileId and input required' })
      }
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const merch = await repoAddMerch(supabase, body.profileId, body.input)
        await touch(body.profileId)
        return send(res, 201, { merch })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = parseJsonBody<{ merchId?: string; input?: UpsertMerchInput }>(req.body)
      if (!body?.merchId || !body.input) return send(res, 400, { error: 'merchId and input required' })
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetMerchProfileId(supabase, body.merchId),
        )
        const merch = await repoUpdateMerch(supabase, body.merchId, body.input)
        await touch(profileId)
        return send(res, 200, { merch })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = parseJsonBody<{ merchId?: string }>(req.body)
      if (!body?.merchId) return send(res, 400, { error: 'merchId required' })
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
      const body = parseJsonBody<{ profileId?: string; input?: UpsertLineupInput }>(req.body)
      if (!body?.profileId || !body.input?.name) {
        return send(res, 400, { error: 'profileId and input required' })
      }
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const entry = await repoAddLineup(supabase, body.profileId, body.input)
        await touch(body.profileId)
        return send(res, 201, { entry })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = parseJsonBody<{ entryId?: string; input?: UpsertLineupInput }>(req.body)
      if (!body?.entryId || !body.input) return send(res, 400, { error: 'entryId and input required' })
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetLineupProfileId(supabase, body.entryId),
        )
        const entry = await repoUpdateLineup(supabase, body.entryId, body.input)
        await touch(profileId)
        return send(res, 200, { entry })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = parseJsonBody<{ entryId?: string }>(req.body)
      if (!body?.entryId) return send(res, 400, { error: 'entryId required' })
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
      const body = parseJsonBody<{ profileId?: string; input?: UpsertBioTimelineInput }>(req.body)
      if (!body?.profileId || !body.input?.title) {
        return send(res, 400, { error: 'profileId and input required' })
      }
      try {
        await repoAssertProfileOwner(supabase, userId, body.profileId)
        const entry = await repoAddBioTimeline(supabase, body.profileId, body.input)
        await touch(body.profileId)
        return send(res, 201, { entry })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'PATCH') {
      const body = parseJsonBody<{ entryId?: string; input?: UpsertBioTimelineInput }>(req.body)
      if (!body?.entryId || !body.input) return send(res, 400, { error: 'entryId and input required' })
      try {
        const profileId = await repoAssertOwnedProfileId(
          supabase,
          userId,
          await repoGetBioTimelineProfileId(supabase, body.entryId),
        )
        const entry = await repoUpdateBioTimeline(supabase, body.entryId, body.input)
        await touch(profileId)
        return send(res, 200, { entry })
      } catch (err) {
        return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
      }
    }
    if (req.method === 'DELETE') {
      const body = parseJsonBody<{ entryId?: string }>(req.body)
      if (!body?.entryId) return send(res, 400, { error: 'entryId required' })
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
