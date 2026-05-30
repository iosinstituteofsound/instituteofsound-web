import { requireAuth, resolveSupabaseForRequest, fetchMemberProfile } from '../auth.js'
import { requireSuperEditor } from '../requireDesk.js'
import { createSupabaseUserClient } from '../supabaseServer.js'
import {
  repoAddReleaseMilestone,
  repoCreateDraft,
  repoCreateSubmission,
  repoFetchPublicRelease,
  repoGetDraftsForEditor,
  repoGetSubmissionById,
  repoGetSubmissionsForArtist,
  repoGetSubmissionsForEditor,
  repoListReleaseMilestones,
  repoListReleasesForProfile,
  repoMarkReleaseSpinPromoted,
  repoPublishDraft,
  repoReviewSubmission,
  repoUpsertRelease,
} from '../repositories/phase4ContentRepository.js'
import { ensureEditorialSlug } from '../../../src/lib/editorial/published.js'
import type { CreateDraftInput, CreateSubmissionInput, ReviewSubmissionInput } from '../../../src/lib/submissions/service.js'
import type { ReleaseMilestone, UpsertReleaseInput } from '../../../src/lib/releases/types.js'
import { parseJsonBody, queryParam, type ApiRequest, type ApiResponse } from '../http.js'

function send(res: ApiResponse, status: number, body: unknown): true {
  res.status(status).json(body)
  return true
}

export async function handleV1Phase4Content(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<boolean> {
  if (
    !pathname.startsWith('/api/v1/submissions') &&
    !pathname.startsWith('/api/v1/editorial/drafts') &&
    !pathname.startsWith('/api/v1/releases')
  ) {
    return false
  }

  if (pathname === '/api/v1/releases/public' && req.method === 'GET') {
    const slug = queryParam(req, 'slug')
    if (!slug) return send(res, 400, { error: 'slug required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const release = await repoFetchPublicRelease(resolved.supabase, slug)
      return send(res, 200, { release })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/releases' && req.method === 'GET') {
    const profileId = queryParam(req, 'profileId')
    if (!profileId) return send(res, 400, { error: 'profileId required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const releases = await repoListReleasesForProfile(resolved.supabase, profileId)
      return send(res, 200, { releases })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/releases' && req.method === 'PUT') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<{ profileId?: string; release?: UpsertReleaseInput; releaseId?: string }>(req)
    if (!body?.profileId || !body.release) return send(res, 400, { error: 'profileId and release required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const release = await repoUpsertRelease(supabase, body.profileId, body.release, body.releaseId)
      return send(res, 200, { release })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/releases/milestones' && req.method === 'GET') {
    const releaseId = queryParam(req, 'releaseId')
    if (!releaseId) return send(res, 400, { error: 'releaseId required' })
    const resolved = await resolveSupabaseForRequest(req)
    if ('error' in resolved) return send(res, resolved.status, { error: resolved.error })
    try {
      const milestones = await repoListReleaseMilestones(resolved.supabase, releaseId)
      return send(res, 200, { milestones })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/releases/milestones' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<{
      releaseId?: string
      kind?: string
      title?: string
      body?: string
    }>(req)
    if (!body?.releaseId || !body.kind || !body.title) {
      return send(res, 400, { error: 'releaseId, kind, title required' })
    }
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const milestone = await repoAddReleaseMilestone(supabase, body.releaseId, {
        kind: body.kind as ReleaseMilestone['kind'],
        title: body.title,
        body: body.body,
      })
      return send(res, 201, { milestone })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/releases/spin-promoted' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<{ releaseId?: string }>(req)
    if (!body?.releaseId) return send(res, 400, { error: 'releaseId required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      await repoMarkReleaseSpinPromoted(supabase, body.releaseId)
      return send(res, 200, { ok: true })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/submissions' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<CreateSubmissionInput>(req)
    if (!body?.trackTitle) return send(res, 400, { error: 'Invalid submission' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const user = await fetchMemberProfile(auth)
      const submission = await repoCreateSubmission(supabase, user, body)
      return send(res, 201, { submission })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/submissions/mine' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const submissions = await repoGetSubmissionsForArtist(supabase, auth.authUser.id)
      return send(res, 200, { submissions })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/submissions/desk' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const desk = await requireSuperEditor(auth)
    if ('error' in desk) return send(res, desk.status, { error: desk.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const submissions = await repoGetSubmissionsForEditor(supabase)
      return send(res, 200, { submissions })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/submissions/review' && req.method === 'PATCH') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const desk = await requireSuperEditor(auth)
    if ('error' in desk) return send(res, desk.status, { error: desk.error })
    const body = parseJsonBody<{ submissionId?: string; review?: ReviewSubmissionInput }>(req)
    if (!body?.submissionId || !body.review) return send(res, 400, { error: 'submissionId and review required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const submission = await repoReviewSubmission(
        supabase,
        body.submissionId,
        desk.profile,
        body.review,
      )
      return send(res, 200, { submission })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/submissions/item' && req.method === 'GET') {
    const id = queryParam(req, 'id')
    if (!id) return send(res, 400, { error: 'id required' })
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const submission = await repoGetSubmissionById(supabase, id)
      return send(res, 200, { submission })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/editorial/drafts' && req.method === 'GET') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const drafts = await repoGetDraftsForEditor(supabase, auth.authUser.id)
      return send(res, 200, { drafts })
    } catch (err) {
      return send(res, 500, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/editorial/drafts' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<CreateDraftInput>(req)
    if (!body?.title) return send(res, 400, { error: 'Invalid draft' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const user = await fetchMemberProfile(auth)
      const slug = await ensureEditorialSlug(body.title)
      const draft = await repoCreateDraft(supabase, user, body, slug)
      return send(res, 201, { draft })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  if (pathname === '/api/v1/editorial/drafts/publish' && req.method === 'POST') {
    const auth = await requireAuth(req)
    if ('error' in auth) return send(res, auth.status, { error: auth.error })
    const body = parseJsonBody<{ draftId?: string; title?: string }>(req)
    if (!body?.draftId) return send(res, 400, { error: 'draftId required' })
    const supabase = createSupabaseUserClient(auth.accessToken)
    try {
      const slug = body.title ? await ensureEditorialSlug(body.title, body.draftId) : ''
      const draft = await repoPublishDraft(supabase, body.draftId, slug)
      return send(res, 200, { draft })
    } catch (err) {
      return send(res, 400, { error: err instanceof Error ? err.message : 'Failed' })
    }
  }

  return false
}
