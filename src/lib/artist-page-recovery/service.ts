import { withV1Fallback } from '@/api/v1Fallback'
import {
  isV1ApiEnabled,
  v1GetLatestDeletedArchive,
  v1GetOwnRecoveryRequest,
  v1ListDeletedArtistPagesDesk,
  v1ReviewArtistPageRecoveryRequest,
  v1SubmitArtistPageRecoveryRequest,
} from '@/api/v1Client'
import { assertDirectSupabaseAllowed } from '@/lib/api/v1Security'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { restoreArtistProfileArchive } from '@/lib/artist-profile/archive'
import type {
  ArtistPageRecoveryRequest,
  ArtistProfileArchive,
  DeletedArtistPageRow,
} from '@/lib/artist-page-recovery/types'
import * as local from '@/lib/artist-profile/storage'
import {
  notifyMemberRecoveryDecision,
  notifySuperEditorsOfRecoveryRequest,
} from '@/lib/artist-page-recovery/notify'

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

export async function getLatestDeletedArchiveForUser(
  userId: string,
): Promise<ArtistProfileArchive | null> {
  if (!isSupabaseConfigured()) return local.localGetLatestArchiveForUser(userId)

  const loadDirect = async () => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('artist_profile_archives')
      .select('*')
      .eq('user_id', userId)
      .is('restored_at', null)
      .order('deleted_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapArchive(data as Record<string, unknown>) : null
  }

  if (isV1ApiEnabled()) {
    return withV1Fallback(async () => {
      const { archive } = await v1GetLatestDeletedArchive()
      return archive
    }, loadDirect)
  }

  assertDirectSupabaseAllowed('Artist recovery')
  return loadDirect()
}

export async function listDeletedArtistPagesForDesk(): Promise<DeletedArtistPageRow[]> {
  if (isSupabaseConfigured() && isV1ApiEnabled()) {
    const { pages } = await v1ListDeletedArtistPagesDesk()
    return pages
  }

  if (!isSupabaseConfigured()) {
    const archives = local.localListDeletedArchivesForDesk()
    const requests = local.localListRecoveryRequests()
    return archives.map((archive) => ({
      ...archive,
      recoveryRequest:
        requests.find((r) => r.archiveId === archive.id) ??
        undefined,
    }))
  }

  assertDirectSupabaseAllowed('Artist recovery')
  const supabase = getSupabase()
  const [{ data: archives, error: archErr }, { data: requests, error: reqErr }] =
    await Promise.all([
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

  return (archives ?? []).map((row) => {
    const archive = mapArchive(row as Record<string, unknown>)
    return { ...archive, recoveryRequest: requestByArchive.get(archive.id) }
  })
}

export async function getOwnRecoveryRequest(
  archiveId: string,
  userId: string,
): Promise<ArtistPageRecoveryRequest | null> {
  if (!isSupabaseConfigured()) {
    const r = local.localGetRecoveryRequestForArchive(archiveId)
    return r?.userId === userId ? r : null
  }

  if (isV1ApiEnabled()) {
    const { request } = await v1GetOwnRecoveryRequest(archiveId)
    return request
  }

  assertDirectSupabaseAllowed('Artist recovery')
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('artist_page_recovery_requests')
    .select('*')
    .eq('archive_id', archiveId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapRequest(data as Record<string, unknown>) : null
}

export async function submitArtistPageRecoveryRequest(input: {
  archiveId: string
  userId: string
  govIdDocumentUrl: string
  applicantNote?: string
}): Promise<ArtistPageRecoveryRequest> {
  if (!isSupabaseConfigured()) {
    const request = local.localSubmitRecoveryRequest(input)
    notifySuperEditorsOfRecoveryRequest(input.userId, request.id, input.archiveId)
    return request
  }

  if (isV1ApiEnabled()) {
    const { request } = await v1SubmitArtistPageRecoveryRequest({
      archiveId: input.archiveId,
      govIdDocumentUrl: input.govIdDocumentUrl,
      applicantNote: input.applicantNote,
    })
    notifySuperEditorsOfRecoveryRequest(input.userId, request.id, input.archiveId)
    return request
  }

  assertDirectSupabaseAllowed('Artist recovery')
  const supabase = getSupabase()
  const { data: archive, error: archErr } = await supabase
    .from('artist_profile_archives')
    .select('id, user_id, restored_at')
    .eq('id', input.archiveId)
    .maybeSingle()

  if (archErr) throw new Error(archErr.message)
  if (!archive || archive.user_id !== input.userId) {
    throw new Error('Deleted page record not found.')
  }
  if (archive.restored_at) throw new Error('This page has already been restored.')

  const { data: pending } = await supabase
    .from('artist_page_recovery_requests')
    .select('id')
    .eq('archive_id', input.archiveId)
    .eq('status', 'pending')
    .maybeSingle()

  if (pending) throw new Error('You already have a pending recovery request for this page.')

  const { data, error } = await supabase
    .from('artist_page_recovery_requests')
    .insert({
      archive_id: input.archiveId,
      user_id: input.userId,
      gov_id_document_url: input.govIdDocumentUrl,
      applicant_note: input.applicantNote?.trim() || null,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  const request = mapRequest(data as Record<string, unknown>)
  notifySuperEditorsOfRecoveryRequest(input.userId, request.id, input.archiveId)
  return request
}

export async function reviewArtistPageRecoveryRequest(
  requestId: string,
  reviewerUserId: string,
  decision: 'approved' | 'rejected',
  reviewNotes?: string,
): Promise<void> {
  if (isSupabaseConfigured() && isV1ApiEnabled()) {
    const supabase = getSupabase()
    const { data: request, error } = await supabase
      .from('artist_page_recovery_requests')
      .select('user_id, status')
      .eq('id', requestId)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!request) throw new Error('Recovery request not found.')
    if (request.status !== 'pending') throw new Error('Request already reviewed.')

    await v1ReviewArtistPageRecoveryRequest({ requestId, decision, reviewNotes })
    notifyMemberRecoveryDecision(String(request.user_id), requestId, decision, reviewNotes)
    return
  }

  if (!isSupabaseConfigured()) {
    const requests = local.localListRecoveryRequests()
    const request = requests.find((r) => r.id === requestId)
    if (!request) throw new Error('Recovery request not found.')
    if (request.status !== 'pending') throw new Error('Request already reviewed.')

    if (decision === 'approved') {
      await restoreArtistProfileArchive(request.archiveId, reviewerUserId)
    }

    local.localUpdateRecoveryRequest(requestId, {
      status: decision,
      reviewNotes: reviewNotes?.trim() || undefined,
      reviewedBy: reviewerUserId,
    })
    notifyMemberRecoveryDecision(request.userId, requestId, decision, reviewNotes)
    return
  }

  assertDirectSupabaseAllowed('Artist recovery')
  const supabase = getSupabase()
  const { data: request, error } = await supabase
    .from('artist_page_recovery_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!request) throw new Error('Recovery request not found.')
  if (request.status !== 'pending') throw new Error('Request already reviewed.')

  if (decision === 'approved') {
    await restoreArtistProfileArchive(String(request.archive_id), reviewerUserId)
  }

  const { error: updateErr } = await supabase
    .from('artist_page_recovery_requests')
    .update({
      status: decision,
      review_notes: reviewNotes?.trim() || null,
      reviewed_by: reviewerUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (updateErr) throw new Error(updateErr.message)
  notifyMemberRecoveryDecision(String(request.user_id), requestId, decision, reviewNotes)
}
