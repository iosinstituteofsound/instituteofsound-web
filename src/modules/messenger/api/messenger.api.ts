import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import type {
  BlockedUser,
  CommunityListItem,
  DmMessage,
  DmThreadHeader,
  DmThreadListBucket,
  DmThreadSummary,
  GroupMember,
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

export async function getThreadHeader(threadId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ header: DmThreadHeader }>>(
    `${API_V1}/dm/thread-header`,
    { params: { threadId } },
  )
  return data.data.header
}

export async function setThreadStatus(threadId: string, status: 'accepted' | 'declined') {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ thread: DmThreadSummary }>>(
    `${API_V1}/dm/thread-status`,
    { threadId, status },
  )
  return data.data.thread
}

export async function updateThreadParticipant(
  threadId: string,
  patch: { muted?: boolean; archived?: boolean },
) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ thread: DmThreadSummary }>>(
    `${API_V1}/dm/thread/${threadId}/participant`,
    patch,
  )
  return data.data.thread
}

export async function blockUser(userId: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ ok: true }>>(`${API_V1}/dm/block`, { userId })
  return data.data
}

export async function unblockUser(userId: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ ok: true }>>(`${API_V1}/dm/block/${userId}`)
  return data.data
}

export async function listBlockedUsers() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ users: BlockedUser[] }>>(`${API_V1}/dm/blocked`)
  return data.data.users
}

export async function listMessages(threadId: string, params?: { limit?: number; cursor?: string }) {
  const { data } = await apiClient.get<
    ApiSuccessResponse<{ messages: DmMessage[]; nextCursor: string | null }>
  >(`${API_V1}/dm/messages`, { params: { threadId, ...params } })
  return data.data
}

export async function listMediaMessages(threadId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ messages: DmMessage[] }>>(
    `${API_V1}/dm/messages/media`,
    { params: { threadId } },
  )
  return data.data.messages
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

export async function createGroup(input: { title: string; memberUserIds: string[] }) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ thread: DmThreadSummary }>>(
    `${API_V1}/dm/groups`,
    input,
  )
  return data.data.thread
}

export async function updateGroup(threadId: string, patch: { title?: string; avatarUrl?: string }) {
  const { data } = await apiClient.patch<ApiSuccessResponse<{ thread: DmThreadSummary }>>(
    `${API_V1}/dm/groups/${threadId}`,
    patch,
  )
  return data.data.thread
}

export async function addGroupMembers(threadId: string, memberUserIds: string[]) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ thread: DmThreadSummary }>>(
    `${API_V1}/dm/groups/${threadId}/members`,
    { memberUserIds },
  )
  return data.data.thread
}

export async function removeGroupMember(threadId: string, userId: string) {
  const { data } = await apiClient.delete<ApiSuccessResponse<{ thread: DmThreadSummary }>>(
    `${API_V1}/dm/groups/${threadId}/members/${userId}`,
  )
  return data.data.thread
}

export async function leaveGroup(threadId: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ thread: DmThreadSummary }>>(
    `${API_V1}/dm/groups/${threadId}/leave`,
  )
  return data.data.thread
}

export async function listGroupMembers(threadId: string) {
  const { data } = await apiClient.get<ApiSuccessResponse<{ members: GroupMember[] }>>(
    `${API_V1}/dm/groups/${threadId}/members`,
  )
  return data.data.members
}

export async function listCommunities() {
  const { data } = await apiClient.get<ApiSuccessResponse<{ communities: CommunityListItem[] }>>(
    `${API_V1}/dm/communities`,
  )
  return data.data.communities
}

export async function joinCommunity(slug: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ thread: DmThreadSummary }>>(
    `${API_V1}/dm/communities/${slug}/join`,
  )
  return data.data.thread
}

export async function leaveCommunity(slug: string) {
  const { data } = await apiClient.post<ApiSuccessResponse<{ ok: true }>>(
    `${API_V1}/dm/communities/${slug}/leave`,
  )
  return data.data
}
