import { requireAuth, resolveSupabaseForRequest } from '../auth.js'
import { createSupabaseUserClient } from '../supabaseServer.js'
import {
  repoAddPostComment,
  repoDeletePostComment,
  repoFetchCommunityGenres,
  repoFetchGenreWeeklyLeaderboard,
  repoFetchGenreWeeklyRank,
  repoFetchMemberStats,
  repoFetchNotifications,
  repoFetchUnreadNotificationCount,
  repoFetchUserBadges,
  repoFetchWeeklyLeaderboard,
  repoIsFollowingUser,
  repoListPostComments,
  repoMarkNotificationsRead,
  repoSetPrimaryGenre,
  repoToggleFollow,
} from '../repositories/phase4CommunityRepository.js'
import {
  repoCreateCrew,
  repoDisbandCrew,
  repoFetchMyCrew,
  repoJoinCrew,
  repoLeaveCrew,
} from '../repositories/phase4PlatformRepository.js'
import { parseJsonBody, queryParam, type ApiRequest, type ApiResponse } from '../http.js'

function send(res: ApiResponse, status: number, body: unknown): true {
  res.status(status).json(body)
  return true
}

function parseLimit(req: ApiRequest, fallback = 30, max = 100): number {
  const n = Number(queryParam(req, 'limit') ?? fallback)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.min(max, Math.floor(n))
}

export async function handleV1Phase4Community(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<boolean> {
  if (!pathname.startsWith('/api/v1/community/')) return false

  if (pathname === '/api/v1/community/follow' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<{ targetUserId?: string }>(req)
    if (!body?.targetUserId) return send(res, 400, { error: 'targetUserId required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const following = await repoToggleFollow(supabase, body.targetUserId)
      return send(res, 200, { following })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Follow failed' })
    }
  }

  if (pathname === '/api/v1/community/follow' && req.method === 'GET') {
    const targetUserId = queryParam(req, 'targetUserId')
    if (!targetUserId) return send(res, 400, { error: 'targetUserId required' })
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const following = await repoIsFollowingUser(supabase, auth.authUser.id, targetUserId)
      return send(res, 200, { following })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/comments' && req.method === 'GET') {
    const postId = queryParam(req, 'postId')
    if (!postId) return send(res, 400, { error: 'postId required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const comments = await repoListPostComments(resolved.supabase, postId, parseLimit(req, 100, 200))
      return send(res, 200, { comments })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/comments' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<{ postId?: string; body?: string; parentId?: string }>(req)
    if (!body?.postId || !body.body?.trim()) return send(res, 400, { error: 'postId and body required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const id = await repoAddPostComment(supabase, body.postId, body.body.trim(), body.parentId)
      return send(res, 201, { id })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Comment failed' })
    }
  }

  if (pathname === '/api/v1/community/comments' && req.method === 'DELETE') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<{ commentId?: string }>(req)
    if (!body?.commentId) return send(res, 400, { error: 'commentId required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoDeletePostComment(supabase, body.commentId)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Delete failed' })
    }
  }

  if (pathname === '/api/v1/community/notifications' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const notifications = await repoFetchNotifications(supabase, parseLimit(req, 40, 80))
      return send(res, 200, { notifications })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/notifications/unread' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const count = await repoFetchUnreadNotificationCount(supabase)
      return send(res, 200, { count })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/notifications/read' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<{ ids?: string[] }>(req)
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoMarkNotificationsRead(supabase, body?.ids)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/member-stats' && req.method === 'GET') {
    const userId = queryParam(req, 'userId')
    if (!userId) return send(res, 400, { error: 'userId required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const stats = await repoFetchMemberStats(resolved.supabase, userId)
      return send(res, 200, { stats })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/leaderboard' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const entries = await repoFetchWeeklyLeaderboard(resolved.supabase, parseLimit(req, 20, 50))
      return send(res, 200, { entries })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/genres' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const genres = await repoFetchCommunityGenres(resolved.supabase)
      return send(res, 200, { genres })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/primary-genre' && req.method === 'PATCH') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<{ genreId?: string }>(req)
    if (!body?.genreId) return send(res, 400, { error: 'genreId required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoSetPrimaryGenre(supabase, auth.authUser.id, body.genreId)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/badges' && req.method === 'GET') {
    const userId = queryParam(req, 'userId')
    if (!userId) return send(res, 400, { error: 'userId required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const badges = await repoFetchUserBadges(resolved.supabase, userId)
      return send(res, 200, { badges })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/genre-leaderboard' && req.method === 'GET') {
    const genreSlug = queryParam(req, 'genreSlug')
    if (!genreSlug) return send(res, 400, { error: 'genreSlug required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const entries = await repoFetchGenreWeeklyLeaderboard(
        resolved.supabase,
        genreSlug,
        parseLimit(req, 15, 50),
      )
      return send(res, 200, { entries })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/genre-rank' && req.method === 'GET') {
    const genreSlug = queryParam(req, 'genreSlug')
    const userId = queryParam(req, 'userId')
    if (!genreSlug || !userId) return send(res, 400, { error: 'genreSlug and userId required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const rank = await repoFetchGenreWeeklyRank(resolved.supabase, genreSlug, userId)
      return send(res, 200, { rank })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/crew/my' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const crew = await repoFetchMyCrew(supabase)
      return send(res, 200, { crew })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/crew' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<{ name?: string; tagline?: string; genreSlug?: string }>(req)
    if (!body?.name) return send(res, 400, { error: 'name required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoCreateCrew(supabase, {
        name: body.name,
        tagline: body.tagline,
        genreSlug: body.genreSlug,
      })
      const crew = await repoFetchMyCrew(supabase)
      return send(res, 201, { crew })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/crew/join' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<{ inviteCode?: string }>(req)
    if (!body?.inviteCode) return send(res, 400, { error: 'inviteCode required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoJoinCrew(supabase, body.inviteCode)
      const crew = await repoFetchMyCrew(supabase)
      return send(res, 200, { crew })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/crew/leave' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoLeaveCrew(supabase)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/crew/disband' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoDisbandCrew(supabase)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  return false
}
