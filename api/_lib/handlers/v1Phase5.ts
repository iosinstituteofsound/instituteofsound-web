import { requireAuth, resolveSupabaseForRequest } from '../auth.js'
import { requireSuperEditor } from '../requireDesk.js'
import { createSupabaseUserClient } from '../supabaseServer.js'
import {
  repoCollabAcceptResponse,
  repoAcknowledgeEditorCongrats,
  repoAnalyticsAllDrafts,
  repoAnalyticsListArtistAccounts,
  repoAnalyticsListArtistProfileSummaries,
  repoAnalyticsListRoleUsers,
  repoAnalyticsRoleCounts,
  repoApproveEditorApplication,
  repoAwardDb,
  repoCollabCompletedCount,
  repoCollabConfirmComplete,
  repoCollabPostGet,
  repoCollabPostResponses,
  repoCollabProfileSkills,
  repoCollabRespond,
  repoCollabSetProfileSkills,
  repoCrewWeeklyLeaderboard,
  repoCrewWarsV2,
  repoEditorWirePicks,
  repoEventsByScene,
  repoEvaluateWeeklyChallenges,
  repoFetchArtistAnalyticsEvents,
  repoFetchUserProfile,
  repoFetchWeeklyChallenges,
  repoFridayWire,
  repoGetAcademyProgress,
  repoGetMyEditorApplication,
  repoGlobalSearch,
  repoGrantBadge,
  repoInsertArtistAnalyticsEvent,
  repoListArtistProfilesForEditor,
  repoListEditorApplications,
  repoListPublishedArtistProfiles,
  repoPushAcademyProgress,
  repoRejectEditorApplication,
  repoSpinOfTheWeek,
  repoSubmitEditorApplication,
  repoTribeRecentSpins,
  repoTribeWarMonthly,
  repoUpdateEditorialLinkedPost,
  repoWireDigest,
} from '../repositories/phase5Repository.js'
import { repoGetSubmissionsForEditor } from '../repositories/phase4ContentRepository.js'
import { computeSuperAdminAnalytics } from '../../../src/lib/analytics/compute.js'
import { fetchSupabaseCatalogWithClient } from '../../../src/lib/discovery/releasesCatalog.js'
import type { AwardDbInput } from '../../../src/lib/community/awardRepository.js'
import type { AcademyProgressSnapshot } from '../../../src/lib/academy/typesProgress.js'
import type { SubmitEditorApplicationInput } from '../../../src/lib/editor-applications/types.js'
import { queryParam, type ApiRequest, type ApiResponse } from '../http.js'
import { requireValidatedBody } from '../validate.js'
import {
  academyProgressBody,
  analyticsArtistEventBody,
  applicationIdBody,
  applicationRejectBody,
  awardDbBody,
  collabRespondBody,
  collabResponseIdBody,
  collabSkillsBody,
  communityPostIdBody,
  editorApplicationBody,
  editorialLinkedPostBody,
  grantBadgeBody,
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

export async function handleV1Phase5(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<boolean> {
  if (pathname === '/api/v1/users/profile' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const userId = queryParam(req, 'userId') ?? auth.authUser.id
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const user = await repoFetchUserProfile(supabase, userId)
      return send(res, 200, { user })
    } catch (err) {
      return send(res, 404, { error: err instanceof Error ? err.message : 'Not found' })
    }
  }

  if (pathname === '/api/v1/discovery/releases-catalog' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const cards = await fetchSupabaseCatalogWithClient(resolved.supabase)
      return send(res, 200, { cards })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/discovery/artists' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const profiles = await repoListPublishedArtistProfiles(resolved.supabase)
      return send(res, 200, { profiles })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/artist/profiles/for-editor' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const desk = await requireSuperEditor(auth)
    if ('error' in desk) return send(res, desk.status, { error: desk.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const profiles = await repoListArtistProfilesForEditor(supabase)
      return send(res, 200, { profiles })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/search/global' && req.method === 'GET') {
    const q = queryParam(req, 'q')?.trim()
    if (!q) return send(res, 400, { error: 'q required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const rows = await repoGlobalSearch(resolved.supabase, q, parseLimit(req, 6, 20))
      return send(res, 200, { rows })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/academy/progress' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const progress = await repoGetAcademyProgress(supabase, auth.authUser.id)
      return send(res, 200, { progress })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/academy/progress' && req.method === 'PUT') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, academyProgressBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoPushAcademyProgress(
        supabase,
        auth.authUser.id,
        body as unknown as AcademyProgressSnapshot,
      )
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/crew-leaderboard' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const entries = await repoCrewWeeklyLeaderboard(resolved.supabase, parseLimit(req, 15, 50))
      return send(res, 200, { entries })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/events/scene' && req.method === 'GET') {
    const city = queryParam(req, 'city')
    const genre = queryParam(req, 'genre')
    if (!city || !genre) return send(res, 400, { error: 'city and genre required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const events = await repoEventsByScene(
        resolved.supabase,
        city,
        genre,
        parseLimit(req, 12, 40),
      )
      return send(res, 200, { events })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/collab/post' && req.method === 'GET') {
    const postId = queryParam(req, 'postId')
    if (!postId) return send(res, 400, { error: 'postId required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const post = await repoCollabPostGet(resolved.supabase, postId)
      return send(res, 200, { post })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/collab/responses' && req.method === 'GET') {
    const postId = queryParam(req, 'postId')
    if (!postId) return send(res, 400, { error: 'postId required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const responses = await repoCollabPostResponses(resolved.supabase, postId)
      return send(res, 200, { responses })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/collab/respond' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, collabRespondBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const id = await repoCollabRespond(supabase, body.postId, body.message)
      return send(res, 200, { id })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/collab/accept' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, collabResponseIdBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoCollabAcceptResponse(supabase, body.responseId)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/collab/complete' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, communityPostIdBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoCollabConfirmComplete(supabase, body.postId)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/collab/skills' && req.method === 'GET') {
    const handle = queryParam(req, 'handle')
    if (!handle) return send(res, 400, { error: 'handle required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const skills = await repoCollabProfileSkills(resolved.supabase, handle)
      return send(res, 200, { skills })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/collab/skills' && req.method === 'PUT') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, collabSkillsBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoCollabSetProfileSkills(supabase, body.skillSlugs)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/collab/completed-count' && req.method === 'GET') {
    const userId = queryParam(req, 'userId')
    if (!userId) return send(res, 400, { error: 'userId required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const count = await repoCollabCompletedCount(resolved.supabase, userId)
      return send(res, 200, { count })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/award-db' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, awardDbBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const awarded = await repoAwardDb(supabase, body as unknown as AwardDbInput)
      return send(res, 200, { awarded })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/grant-badge' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, grantBadgeBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const granted = await repoGrantBadge(supabase, body.slug)
      return send(res, 200, { granted })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/challenges' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const challenges = await repoFetchWeeklyChallenges(supabase)
      return send(res, 200, { challenges })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/challenges/evaluate' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const granted = await repoEvaluateWeeklyChallenges(supabase)
      return send(res, 200, { granted })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/wire/friday' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const raw = await repoFridayWire(resolved.supabase)
      const wire = raw
        ? {
            ...raw.post,
            reactionScore: raw.reactionScore,
            wireLive: raw.wireLive,
            nextWireAt: raw.nextWireAt ?? new Date().toISOString(),
            featuredFriday: raw.featuredFriday ?? new Date().toISOString().slice(0, 10),
          }
        : null
      return send(res, 200, { wire })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/wire/tribe-war' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const standings = await repoTribeWarMonthly(resolved.supabase)
      return send(res, 200, { standings })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/wire/crew-wars' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const entries = await repoCrewWarsV2(resolved.supabase, parseLimit(req, 15, 50))
      return send(res, 200, { entries })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/wire/digest' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const digest = await repoWireDigest(resolved.supabase)
      return send(res, 200, { digest })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/wire/spin-of-week' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const spin = await repoSpinOfTheWeek(resolved.supabase)
      return send(res, 200, { spin })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/wire/tribe-spins' && req.method === 'GET') {
    const genre = queryParam(req, 'genre')
    if (!genre) return send(res, 400, { error: 'genre required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const posts = await repoTribeRecentSpins(resolved.supabase, genre, parseLimit(req, 3, 20))
      return send(res, 200, { posts })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/community/wire/editor-picks' && req.method === 'GET') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const picks = await repoEditorWirePicks(resolved.supabase, parseLimit(req, 12, 24))
      return send(res, 200, { picks })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/analytics/artist-events' && req.method === 'GET') {
    const profileId = queryParam(req, 'profileId')
    if (!profileId) return send(res, 400, { error: 'profileId required' })
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const events = await repoFetchArtistAnalyticsEvents(supabase, profileId)
      return send(res, 200, { events })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/analytics/artist-events' && req.method === 'POST') {
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    const body = requireValidatedBody(res, analyticsArtistEventBody, req.body)
    if (!body) return true
    try {
      await repoInsertArtistAnalyticsEvent(
        resolved.supabase,
        body.profileId,
        body.eventType,
        body.trackId,
      )
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/desk/analytics' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const desk = await requireSuperEditor(auth)
    if ('error' in desk) return send(res, desk.status, { error: desk.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const [submissions, drafts, roleCounts, artistAccounts, artistProfiles, roleUsers] =
        await Promise.all([
          repoGetSubmissionsForEditor(supabase),
          repoAnalyticsAllDrafts(supabase),
          repoAnalyticsRoleCounts(supabase),
          repoAnalyticsListArtistAccounts(supabase),
          repoAnalyticsListArtistProfileSummaries(supabase),
          repoAnalyticsListRoleUsers(supabase),
        ])
      const analytics = computeSuperAdminAnalytics({
        submissions,
        drafts,
        artistsRegistered: roleCounts.artists,
        roleCounts,
        artistAccounts,
        artistProfiles,
        roleUsers,
      })
      return send(res, 200, { analytics })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/editor-applications/mine' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const application = await repoGetMyEditorApplication(supabase, auth.authUser.id)
      return send(res, 200, { application })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/editor-applications' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const desk = await requireSuperEditor(auth)
    if ('error' in desk) return send(res, desk.status, { error: desk.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const applications = await repoListEditorApplications(supabase)
      return send(res, 200, { applications })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/editor-applications' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, editorApplicationBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const application = await repoSubmitEditorApplication(
        supabase,
        auth.authUser.id,
        body as unknown as SubmitEditorApplicationInput,
      )
      return send(res, 200, { application })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/editor-applications/approve' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const desk = await requireSuperEditor(auth)
    if ('error' in desk) return send(res, desk.status, { error: desk.error })
    const body = requireValidatedBody(res, applicationIdBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoApproveEditorApplication(supabase, body.applicationId, auth.authUser.id)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/editor-applications/reject' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const desk = await requireSuperEditor(auth)
    if ('error' in desk) return send(res, desk.status, { error: desk.error })
    const body = requireValidatedBody(res, applicationRejectBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoRejectEditorApplication(supabase, body.applicationId, auth.authUser.id, body.notes)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/editor-applications/ack' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoAcknowledgeEditorCongrats(supabase, auth.authUser.id)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/editorial/linked-post' && req.method === 'PATCH') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = requireValidatedBody(res, editorialLinkedPostBody, req.body)
    if (!body) return true
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoUpdateEditorialLinkedPost(supabase, body.draftId, body.postId ?? null)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  return false
}
