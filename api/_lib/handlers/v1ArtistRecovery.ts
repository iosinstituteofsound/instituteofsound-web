import { restoreArtistProfileArchiveWithAdmin } from '../artistRecoveryRestore.js'
import type {
  ArtistPageRecoveryRequest,
  ArtistProfileArchive,
  DeletedArtistPageRow,
} from '../../../src/lib/artist-page-recovery/types.js'
import { requireAuth } from '../auth.js'
import { requireSuperEditor } from '../requireDesk.js'
import { parseJsonBody, queryParam, type ApiRequest, type ApiResponse } from '../http.js'
import { createSupabaseUserClient, getSupabaseAdmin } from '../supabaseServer.js'

function mapArchive(row: Record<string, unknown>): ArtistProfileArchive {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    profileId: String(row.profile_id),
    slug: String(row.slug),
    displayName: String(row.display_name),
    deletionReason: row.deletion_reason as ArtistProfileArchive['deletionReason'],
    deletedAt: String(row.deleted_at),
    snapshot: row.snapshot as ArtistProfileArchive['snapshot'],
    restoredAt: row.restored_at ? String(row.restored_at) : undefined,
    restoredBy: row.restored_by ? String(row.restored_by) : undefined,
  }
}

function mapRequest(row: Record<string, unknown>): ArtistPageRecoveryRequest {
  return {
    id: String(row.id),
    archiveId: String(row.archive_id),
    userId: String(row.user_id),
    govIdDocumentUrl: String(row.gov_id_document_url),
    applicantNote: row.applicant_note ? String(row.applicant_note) : undefined,
    status: row.status as ArtistPageRecoveryRequest['status'],
    reviewNotes: row.review_notes ? String(row.review_notes) : undefined,
    reviewedBy: row.reviewed_by ? String(row.reviewed_by) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

export async function handleV1ArtistRecovery(
  req: ApiRequest,
  res: ApiResponse,
  pathname: string,
): Promise<boolean> {
  if (!pathname.startsWith('/api/v1/artist-recovery')) return false

  if (pathname === '/api/v1/artist-recovery/desk/deleted-pages' && req.method === 'GET') {
    await handleDeskDeletedPages(req, res)
    return true
  }
  if (pathname === '/api/v1/artist-recovery/desk/requests' && req.method === 'PATCH') {
    await handleDeskReview(req, res)
    return true
  }
  if (pathname === '/api/v1/artist-recovery/archive' && req.method === 'GET') {
    await handleLatestArchive(req, res)
    return true
  }
  if (pathname === '/api/v1/artist-recovery/request' && req.method === 'GET') {
    await handleOwnRequest(req, res)
    return true
  }
  if (pathname === '/api/v1/artist-recovery/requests' && req.method === 'POST') {
    await handleSubmitRequest(req, res)
    return true
  }

  res.status(404).json({ error: 'Not found' })
  return true
}

async function handleLatestArchive(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const { data, error } = await supabase
      .from('artist_profile_archives')
      .select('*')
      .eq('user_id', auth.authUser.id)
      .is('restored_at', null)
      .order('deleted_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(error.message)
    const archive = data ? mapArchive(data as Record<string, unknown>) : null
    return res.status(200).json({ archive })
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to load archive' })
  }
}

async function handleOwnRequest(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const archiveId = queryParam(req, 'archiveId')
  if (!archiveId) return res.status(400).json({ error: 'archiveId query required' })
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const { data, error } = await supabase
      .from('artist_page_recovery_requests')
      .select('*')
      .eq('archive_id', archiveId)
      .eq('user_id', auth.authUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(error.message)
    const request = data ? mapRequest(data as Record<string, unknown>) : null
    return res.status(200).json({ request })
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to load request' })
  }
}

async function handleSubmitRequest(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const body = parseJsonBody<{
    archiveId?: string
    govIdDocumentUrl?: string
    applicantNote?: string
  }>(req.body)
  if (!body?.archiveId || !body.govIdDocumentUrl?.trim()) {
    return res.status(400).json({ error: 'archiveId and govIdDocumentUrl required' })
  }
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const { data: archive, error: archErr } = await supabase
      .from('artist_profile_archives')
      .select('id, user_id, restored_at')
      .eq('id', body.archiveId)
      .maybeSingle()
    if (archErr) throw new Error(archErr.message)
    if (!archive || archive.user_id !== auth.authUser.id) {
      return res.status(400).json({ error: 'Deleted page record not found.' })
    }
    if (archive.restored_at) {
      return res.status(400).json({ error: 'This page has already been restored.' })
    }

    const { data: pending } = await supabase
      .from('artist_page_recovery_requests')
      .select('id')
      .eq('archive_id', body.archiveId)
      .eq('status', 'pending')
      .maybeSingle()
    if (pending) {
      return res.status(400).json({ error: 'You already have a pending recovery request for this page.' })
    }

    const { data, error } = await supabase
      .from('artist_page_recovery_requests')
      .insert({
        archive_id: body.archiveId,
        user_id: auth.authUser.id,
        gov_id_document_url: body.govIdDocumentUrl.trim(),
        applicant_note: body.applicantNote?.trim() || null,
      })
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    const request = mapRequest(data as Record<string, unknown>)
    return res.status(201).json({ request })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Submit failed' })
  }
}

async function handleDeskDeletedPages(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const desk = await requireSuperEditor(auth)
  if ('error' in desk) return res.status(desk.status).json({ error: desk.error })
  const supabase = createSupabaseUserClient(auth.accessToken)
  try {
    const [{ data: archives, error: archErr }, { data: requests, error: reqErr }] = await Promise.all([
      supabase
        .from('artist_profile_archives')
        .select('*')
        .is('restored_at', null)
        .order('deleted_at', { ascending: false }),
      supabase
        .from('artist_page_recovery_requests')
        .select('*')
        .order('created_at', { ascending: false }),
    ])
    if (archErr) throw new Error(archErr.message)
    if (reqErr) throw new Error(reqErr.message)

    const requestByArchive = new Map<string, ArtistPageRecoveryRequest>()
    for (const row of requests ?? []) {
      const mapped = mapRequest(row as Record<string, unknown>)
      if (!requestByArchive.has(mapped.archiveId)) {
        requestByArchive.set(mapped.archiveId, mapped)
      }
    }

    const pages: DeletedArtistPageRow[] = (archives ?? []).map((row) => {
      const archive = mapArchive(row as Record<string, unknown>)
      return { ...archive, recoveryRequest: requestByArchive.get(archive.id) }
    })
    return res.status(200).json({ pages })
  } catch (err) {
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to load pages' })
  }
}

async function handleDeskReview(req: ApiRequest, res: ApiResponse) {
  const auth = await requireAuth(req)
  if ('error' in auth) return res.status(auth.status).json({ error: auth.error })
  const desk = await requireSuperEditor(auth)
  if ('error' in desk) return res.status(desk.status).json({ error: desk.error })
  const body = parseJsonBody<{
    requestId?: string
    decision?: 'approved' | 'rejected'
    reviewNotes?: string
  }>(req.body)
  if (!body?.requestId || !body.decision) {
    return res.status(400).json({ error: 'requestId and decision required' })
  }

  const supabase = createSupabaseUserClient(auth.accessToken)
  const admin = getSupabaseAdmin()

  try {
    const { data: request, error } = await supabase
      .from('artist_page_recovery_requests')
      .select('*')
      .eq('id', body.requestId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!request) throw new Error('Recovery request not found.')
    if (request.status !== 'pending') throw new Error('Request already reviewed.')

    if (body.decision === 'approved') {
      await restoreArtistProfileArchiveWithAdmin(
        String(request.archive_id),
        auth.authUser.id,
        admin,
      )
    }

    const { error: updateErr } = await supabase
      .from('artist_page_recovery_requests')
      .update({
        status: body.decision,
        review_notes: body.reviewNotes?.trim() || null,
        reviewed_by: auth.authUser.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.requestId)

    if (updateErr) throw new Error(updateErr.message)
    return res.status(200).json({ ok: true })
  } catch (err) {
    return res.status(400).json({ error: err instanceof Error ? err.message : 'Review failed' })
  }
}
