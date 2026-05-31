import { requireAuth, resolveSupabaseForRequest, fetchMemberProfile } from '../auth.js'
import { requireSuperEditor } from '../requireDesk.js'
import { createSupabaseUserClient } from '../supabaseServer.js'
import {
  repoDmGetOrCreateThread,
  repoDmListMessages,
  repoDmListThreads,
  repoDmSendMessage,
  repoDmSetThreadStatus,
  repoDmThreadHeader,
  repoDmUnreadTotal,
  repoFetchAcademyPublicSummary,
  repoDiscoverPremiereFeed,
  repoFetchCollabBoard,
  repoFetchPendingEvents,
  repoFetchUpcomingEvents,
  repoCreateCollabPost,
  repoModerateEvent,
  repoSubmitSceneEvent,
  repoToggleEventRsvp,
  repoUpdateUserProfile,
} from '../repositories/phase4PlatformRepository.js'
import { repoListPublishedEditorials } from '../repositories/phase4ContentRepository.js'
import { repoFetchSceneHub } from '../repositories/sceneHubRepository.js'
import { createSupabaseAnonClient } from '../supabaseServer.js'
import type { SubmitEventInput } from '../../../src/lib/events/types.js'
import type { CreateCollabPostInput } from '../../../src/lib/collab/types.js'
import type { UpdateProfileInput } from '../../../src/lib/auth/profile.js'
import { queryParam, type ApiRequest, type ApiResponse } from '../http.js'
import { requireValidatedBody } from '../validate.js'
import {
  collabPostCreateBody,
  dmMessageBody,
  dmThreadBody,
  dmThreadStatusBody,
  eventModerateBody,
  eventRsvpBody,
  eventSubmitBody,
  memberProfilePatchBody,
} from '../schemas/v1Bodies.js'

function send(res: ApiResponse, status: number, body: unknown): true {
  res.status(status).json(body)
  return true
}

function parseLimit(req: ApiRequest, fallback = 30, max = 100): number {
  const n = Number(queryParam(req, 'limit') ?? fallback)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(max, Math.floor(n))
}

export async function handleV1Phase4Platform(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<boolean> {
  if (pathname === '/api/v1/member/profile' && req.method === 'PATCH') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, memberProfilePatchBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const current = await fetchMemberProfile(auth)
      const user = await repoUpdateUserProfile(
        supabase,
        auth.authUser.id,
        body as unknown as UpdateProfileInput,
        current,
      )
      return send(res, 200, { user })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/discovery/premieres' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const cards = await repoDiscoverPremiereFeed(resolved.supabase, parseLimit(req, 24, 48))
      return send(res, 200, { cards })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/discovery/scene' && req.method === 'GET') {
    const city = queryParam(req, 'city')
    const genre = queryParam(req, 'genre')
    if (!city || !genre) return send(res, 400, { error: 'city and genre required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const hub = await repoFetchSceneHub(resolved.supabase, city, genre)
      return send(res, 200, { hub })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/editorial/published' && req.method === 'GET') {
    try {
      const supabase = createSupabaseAnonClient()
      const editorials = await repoListPublishedEditorials(supabase)
      return send(res, 200, { editorials })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/academy/summary' && req.method === 'GET') {
    const userId = queryParam(req, 'userId')
    if (!userId) return send(res, 400, { error: 'userId required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const summary = await repoFetchAcademyPublicSummary(resolved.supabase, userId)
      return send(res, 200, { summary })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/events/upcoming' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const events = await repoFetchUpcomingEvents(
        resolved.supabase,
        { city: queryParam(req, 'city'), genreSlug: queryParam(req, 'genreSlug') },
        parseLimit(req, 40, 60),
      )
      return send(res, 200, { events })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/events/submit' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, eventSubmitBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const id = await repoSubmitSceneEvent(supabase, body as unknown as SubmitEventInput)
      return send(res, 201, { id })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/events/rsvp' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, eventRsvpBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const rsvped = await repoToggleEventRsvp(supabase, body.eventId)
      return send(res, 200, { rsvped })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/events/pending' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const desk = await requireSuperEditor(auth)
    if ('error' in desk) return send(res, desk.status, { error: desk.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const events = await repoFetchPendingEvents(supabase, parseLimit(req, 30, 50))
      return send(res, 200, { events })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/events/moderate' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const desk = await requireSuperEditor(auth)
    if ('error' in desk) return send(res, desk.status, { error: desk.error })
    const body = requireValidatedBody(res, eventModerateBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoModerateEvent(supabase, body.eventId, body.action, body.note)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/collab/board' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const posts = await repoFetchCollabBoard(
        resolved.supabase,
        {
          kind: queryParam(req, 'kind') ?? null,
          city: queryParam(req, 'city') ?? null,
          genreSlug: queryParam(req, 'genreSlug') ?? null,
          skill: queryParam(req, 'skill') ?? null,
        },
        parseLimit(req, 40, 80),
      )
      return send(res, 200, { posts })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/collab/posts' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, collabPostCreateBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const id = await repoCreateCollabPost(supabase, body as unknown as CreateCollabPostInput)
      return send(res, 201, { id })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/dm/threads' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const threads = await repoDmListThreads(supabase)
      return send(res, 200, { threads })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/dm/thread' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, dmThreadBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const threadId = await repoDmGetOrCreateThread(supabase, body.otherUserId)
      return send(res, 200, { threadId })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/dm/messages' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const threadId = queryParam(req, 'threadId')
    if (!threadId) return send(res, 400, { error: 'threadId required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const messages = await repoDmListMessages(supabase, threadId, parseLimit(req, 100, 200))
      return send(res, 200, { messages })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/dm/messages' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, dmMessageBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const id = await repoDmSendMessage(supabase, body.threadId, body.body)
      return send(res, 201, { id })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/dm/thread-status' && req.method === 'PATCH') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, dmThreadStatusBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoDmSetThreadStatus(supabase, body.threadId, body.status)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/dm/thread-header' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const threadId = queryParam(req, 'threadId')
    if (!threadId) return send(res, 400, { error: 'threadId required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const header = await repoDmThreadHeader(supabase, threadId)
      return send(res, 200, { header })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/dm/unread' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const count = await repoDmUnreadTotal(supabase)
      return send(res, 200, { count })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (
    !pathname.startsWith('/api/v1/member/') &&
    !pathname.startsWith('/api/v1/discovery/') &&
    !pathname.startsWith('/api/v1/editorial/published') &&
    !pathname.startsWith('/api/v1/academy/') &&
    !pathname.startsWith('/api/v1/events/') &&
    !pathname.startsWith('/api/v1/collab/') &&
    !pathname.startsWith('/api/v1/dm/')
  ) {
    return false
  }

  return false
}
