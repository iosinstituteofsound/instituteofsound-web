import { requireAuth, resolveSupabaseForRequest } from '../auth.js'
import { createSupabaseUserClient } from '../supabaseServer.js'
import {
  repoFetchConnectionsList,
  repoFetchIncomingRequestIdFromUser,
  repoFetchMutualConnections,
  repoFetchPendingConnectionRequests,
  repoFetchSuggestedPeople,
  repoRemoveConnection,
  repoRespondConnectionRequest,
  repoSearchNetworkPeople,
  repoSendConnectionRequest,
} from '../repositories/networkConnectionsRepository.js'
import {
  repoFetchCrewForUserId,
  repoFetchCrewRoster,
  repoFetchMemberActivity,
  repoFetchMemberConnections,
  repoFetchMemberPosts,
  repoFetchPublicMemberProfile,
  repoFetchPublishedArtistMeta,
  repoNetworkPingPresence,
  repoNetworkOnlineConnections,
  repoFetchNetworkHandleForUserId,
} from '../repositories/networkProfileRepository.js'
import { queryParam, type ApiRequest, type ApiResponse } from '../http.js'
import { requireValidatedBody } from '../validate.js'
import { networkRespondBody, networkTargetUserBody } from '../schemas/v1Bodies.js'

function parseLimit(req: ApiRequest, fallback = 30, max = 100): number {
  const n = Number(queryParam(req, 'limit') ?? fallback)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(max, Math.floor(n))
}

function send(res: ApiResponse, status: number, body: unknown): true {
  res.status(status).json(body)
  return true
}

export async function handleV1Network(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<boolean> {
  // —— Public member profile reads (optional auth for viewer context) ——
  if (pathname === '/api/v1/network/profile' && req.method === 'GET') {
    const handle = queryParam(req, 'handle')
    if (!handle) return send(res, 400, { error: 'handle query required' })

    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const profile = await repoFetchPublicMemberProfile(resolved.supabase, handle)
      return send(res, 200, { profile })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/profile/posts' && req.method === 'GET') {
    const handle = queryParam(req, 'handle')
    if (!handle) return send(res, 400, { error: 'handle query required' })

    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const posts = await repoFetchMemberPosts(resolved.supabase, handle, parseLimit(req, 50, 50))
      return send(res, 200, { posts })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load posts'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/profile/activity' && req.method === 'GET') {
    const handle = queryParam(req, 'handle')
    if (!handle) return send(res, 400, { error: 'handle query required' })

    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const activity = await repoFetchMemberActivity(resolved.supabase, handle, parseLimit(req, 40, 80))
      return send(res, 200, { activity })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load activity'
      return send(res, 500, { error: message })
    }
  }

  if (
    (pathname === '/api/v1/network/profile/followers' ||
      pathname === '/api/v1/network/profile/following') &&
    req.method === 'GET'
  ) {
    const handle = queryParam(req, 'handle')
    if (!handle) return send(res, 400, { error: 'handle query required' })
    const mode = pathname.endsWith('/followers') ? 'followers' : 'following'

    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const connections = await repoFetchMemberConnections(
        resolved.supabase,
        handle,
        mode,
        parseLimit(req, 80, 100),
      )
      return send(res, 200, { connections })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load connections'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/profile/artist' && req.method === 'GET') {
    const userId = queryParam(req, 'userId')
    if (!userId) return send(res, 400, { error: 'userId query required' })

    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const artist = await repoFetchPublishedArtistMeta(resolved.supabase, userId)
      return send(res, 200, { artist })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load artist meta'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/profile/handle' && req.method === 'GET') {
    const userId = queryParam(req, 'userId')
    if (!userId) return send(res, 400, { error: 'userId query required' })

    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const handle = await repoFetchNetworkHandleForUserId(resolved.supabase, userId)
      return send(res, 200, { handle })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load handle'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/profile/crew' && req.method === 'GET') {
    const userId = queryParam(req, 'userId')
    if (!userId) return send(res, 400, { error: 'userId query required' })

    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const crew = await repoFetchCrewForUserId(resolved.supabase, userId)
      return send(res, 200, { crew })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load crew'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/crew/roster' && req.method === 'GET') {
    const crewId = queryParam(req, 'crewId')
    if (!crewId) return send(res, 400, { error: 'crewId query required' })

    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const roster = await repoFetchCrewRoster(resolved.supabase, crewId)
      return send(res, 200, { roster })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load roster'
      return send(res, 500, { error: message })
    }
  }

  // —— Connection mutations (auth required) ——
  if (pathname === '/api/v1/network/connections/request' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })

    const body = requireValidatedBody(res, networkTargetUserBody, req.body)
    if (!body) return true

    const supabase = createSupabaseUserClient(auth.accessToken)

    try {
      await repoSendConnectionRequest(supabase, body.targetUserId)
      return send(res, 200, { ok: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send request'
      return send(res, 400, { error: message })
    }
  }

  if (pathname === '/api/v1/network/connections/request' && req.method === 'PATCH') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })

    const body = requireValidatedBody(res, networkRespondBody, req.body)
    if (!body) return true

    const supabase = createSupabaseUserClient(auth.accessToken)

    try {
      await repoRespondConnectionRequest(supabase, body.requestId, body.accept)
      return send(res, 200, { ok: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to respond'
      return send(res, 400, { error: message })
    }
  }

  if (pathname === '/api/v1/network/connections' && req.method === 'DELETE') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })

    const body = requireValidatedBody(res, networkTargetUserBody, req.body)
    if (!body) return true

    const supabase = createSupabaseUserClient(auth.accessToken)

    try {
      await repoRemoveConnection(supabase, body.targetUserId)
      return send(res, 200, { ok: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove connection'
      return send(res, 400, { error: message })
    }
  }

  // —— Connection reads ——
  if (pathname === '/api/v1/network/connections' && req.method === 'GET') {
    const userId = queryParam(req, 'userId')
    if (!userId) return send(res, 400, { error: 'userId query required' })

    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const connections = await repoFetchConnectionsList(resolved.supabase, userId)
      return send(res, 200, { connections })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load connections'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/connections/mutual' && req.method === 'GET') {
    const targetUserId = queryParam(req, 'targetUserId')
    if (!targetUserId) return send(res, 400, { error: 'targetUserId query required' })

    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const mutuals = await repoFetchMutualConnections(
        resolved.supabase,
        targetUserId,
        parseLimit(req, 12, 50),
      )
      return send(res, 200, { mutuals })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load mutuals'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/connections/incoming' && req.method === 'GET') {
    const fromUserId = queryParam(req, 'fromUserId')
    if (!fromUserId) return send(res, 400, { error: 'fromUserId query required' })

    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })

    const supabase = createSupabaseUserClient(auth.accessToken)

    try {
      const requestId = await repoFetchIncomingRequestIdFromUser(
        supabase,
        auth.authUser.id,
        fromUserId,
      )
      return send(res, 200, { requestId })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load request'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/requests/pending' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })

    const supabase = createSupabaseUserClient(auth.accessToken)

    try {
      const requests = await repoFetchPendingConnectionRequests(supabase)
      return send(res, 200, { requests })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load requests'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/people/suggested' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const people = await repoFetchSuggestedPeople(resolved.supabase, parseLimit(req, 6, 24))
      return send(res, 200, { people })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load suggestions'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/people/search' && req.method === 'GET') {
    const q = queryParam(req, 'q') ?? ''
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })

    try {
      const people = await repoSearchNetworkPeople(resolved.supabase, q, parseLimit(req, 24, 50))
      return send(res, 200, { people })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/presence/ping' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })

    const supabase = createSupabaseUserClient(auth.accessToken)

    try {
      await repoNetworkPingPresence(supabase)
      return send(res, 200, { ok: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Presence ping failed'
      return send(res, 500, { error: message })
    }
  }

  if (pathname === '/api/v1/network/presence/online' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })

    const windowMinutes = Number(queryParam(req, 'windowMinutes') ?? 3)
    const supabase = createSupabaseUserClient(auth.accessToken)

    try {
      const connections = await repoNetworkOnlineConnections(
        supabase,
        Number.isFinite(windowMinutes) ? windowMinutes : 3,
      )
      return send(res, 200, { connections })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load online connections'
      return send(res, 500, { error: message })
    }
  }

  return false
}
