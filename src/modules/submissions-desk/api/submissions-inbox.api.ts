import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { SubmissionInboxPageDto } from '@/modules/explore/types/explore.types'

export async function listSubmissionInbox(input: {
  status?: string
  page?: number
  limit?: number
}): Promise<SubmissionInboxPageDto> {
  const { data } = await apiClient.get<{ success: true; data: SubmissionInboxPageDto }>(
    `${API_V1}/submissions/inbox`,
    { params: input },
  )
  return data.data
}

export async function reviewSubmissionTarget(input: {
  submissionId: string
  targetId: string
  status: 'new' | 'in_review' | 'shortlisted' | 'approved' | 'rejected' | 'archived'
  reviewerNotes?: string
}): Promise<{ ok: true }> {
  const { data } = await apiClient.patch<{ success: true; data: { ok: true } }>(
    `${API_V1}/submissions/${input.submissionId}/targets/${input.targetId}/review`,
    { status: input.status, reviewerNotes: input.reviewerNotes },
  )
  return data.data
}

