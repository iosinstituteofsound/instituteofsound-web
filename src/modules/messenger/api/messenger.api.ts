import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  DmMessage,
  DmThreadListBucket,
  DmThreadSummary,
} from '@/modules/messenger/types/messenger.types'

export async function listThreads(params?: { bucket?: DmThreadListBucket; includeArchived?: boolean }) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ threads: DmThreadSummary[] }>>(
    `${API_V1}/dm/threads`,
    { params },
  )
  return data.data.threads
}

export async function getUnreadCount() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ count: number }>>(`${API_V1}/dm/unread`)
  return data.data.count
}

export async function createThread(otherUserId: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ thread: DmThreadSummary }>>(
    `${API_V1}/dm/thread`,
    { otherUserId },
  )
  return data.data.thread
}

export async function setThreadStatus(threadId: string, status: 'accepted' | 'declined') {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ thread: DmThreadSummary }>>(
    `${API_V1}/dm/thread-status`,
    { threadId, status },
  )
  return data.data.thread
}

export async function listMessages(threadId: string, params?: { limit?: number; cursor?: string }) {
  const { data } = await apiClient.get<
    ApiSuccessResponse<{ messages: DmMessage[]; nextCursor: string | null }>
  >(`${API_V1}/dm/messages`, { params: { threadId, ...params } })
  return data.data
}

export async function sendMessage(input: {
  threadId: string
  body?: string
  type?: DmMessage['type']
  mediaUrl?: string
  mediaMimeType?: string
  mediaFileName?: string
  replyToId?: string
  forwardFromId?: string
  clientMessageId?: string
  shareData?: DmMessage['shareData']
}) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ message: DmMessage }>>(
    `${API_V1}/dm/messages`,
    input,
  )
  return data.data.message
}

export async function markThreadRead(threadId: string, lastReadMessageId?: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ ok: true }>>(`${API_V1}/dm/read`, {
    threadId,
    lastReadMessageId,
  })
  return data.data
}

export async function addMessageReaction(messageId: string, emoji: string) {
  const { data } = await apiClient.put<ApiSuccessResponse<{ message: DmMessage }>>(
    `${API_V1}/dm/messages/${messageId}/reaction`,
    { emoji },
  )
  return data.data.message
}

export async function editMessage(messageId: string, body: string) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ message: DmMessage }>>(
    `${API_V1}/dm/messages/${messageId}`,
    { body },
  )
  return data.data.message
}

export async function deleteMessage(messageId: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ message: DmMessage }>>(
    `${API_V1}/dm/messages/${messageId}`,
  )
  return data.data.message
}

export async function joinCommunity(slug: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ thread: DmThreadSummary }>>(
    `${API_V1}/dm/communities/${slug}/join`,
  )
  return data.data.thread
}
