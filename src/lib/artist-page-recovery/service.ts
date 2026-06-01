import {
  v1GetLatestDeletedArchive,
  v1GetOwnRecoveryRequest,
  v1ListDeletedArtistPagesDesk,
  v1ReviewArtistPageRecoveryRequest,
  v1SubmitArtistPageRecoveryRequest,
} from '@/api/v1Client'
import { isSupabaseConfigured } from '@/lib/supabase/client'
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

export async function getLatestDeletedArchiveForUser(
  userId: string,
): Promise<ArtistProfileArchive | null> {
  if (!isSupabaseConfigured()) return local.localGetLatestArchiveForUser(userId)
  const { archive } = await v1GetLatestDeletedArchive()
  return archive
}

export async function listDeletedArtistPagesForDesk(): Promise<DeletedArtistPageRow[]> {
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
  const { pages } = await v1ListDeletedArtistPagesDesk()
  return pages
}

export async function getOwnRecoveryRequest(
  archiveId: string,
  userId: string,
): Promise<ArtistPageRecoveryRequest | null> {
  if (!isSupabaseConfigured()) {
    const r = local.localGetRecoveryRequestForArchive(archiveId)
    return r?.userId === userId ? r : null
  }
  const { request } = await v1GetOwnRecoveryRequest(archiveId)
  return request
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

  const { request } = await v1SubmitArtistPageRecoveryRequest({
    archiveId: input.archiveId,
    govIdDocumentUrl: input.govIdDocumentUrl,
    applicantNote: input.applicantNote,
  })
  notifySuperEditorsOfRecoveryRequest(input.userId, request.id, input.archiveId)
  return request
}

export async function reviewArtistPageRecoveryRequest(
  requestId: string,
  reviewerUserId: string,
  decision: 'approved' | 'rejected',
  reviewNotes?: string,
): Promise<void> {
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

  const { pages } = await v1ListDeletedArtistPagesDesk()
  const request = pages
    .map((page) => page.recoveryRequest)
    .find((r) => r?.id === requestId)
  if (!request || request.status !== 'pending') {
    throw new Error('Recovery request not found or already reviewed.')
  }

  await v1ReviewArtistPageRecoveryRequest({ requestId, decision, reviewNotes })
  notifyMemberRecoveryDecision(request.userId, requestId, decision, reviewNotes)
}
