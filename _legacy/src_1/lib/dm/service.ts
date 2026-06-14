import { isSupabaseConfigured } from '@/lib/api/liveMode'
import {
  v1DmGetOrCreateThread,
  v1DmListMessages,
  v1DmListThreads,
  v1DmSendMessage,
  v1DmSetThreadStatus,
  v1DmThreadHeader,
  v1DmUnreadTotal,
} from '@/api/v1Phase4Client'
import { COMMUNITY_NOTIFICATION_EVENT } from '@/lib/community/notificationService'
import type {
  DmMessage,
  DmThreadHeader,
  DmThreadStatus,
  DmThreadSummary,
} from '@/lib/dm/types'

/** Fired after any DM mutation so unread badges / lists can refresh. */
export const DM_EVENT = 'ios:dm-changed'

function emitDmChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DM_EVENT))
    window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
  }
}

/** Whether DMs are available in this environment (Supabase only). */
export function isMessagingAvailable(): boolean {
  return isSupabaseConfigured()
}

export async function getOrCreateThread(otherUserId: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Messaging needs a connected account. Sign in on the live site.')
  }
  const { threadId } = await v1DmGetOrCreateThread(otherUserId)
  return threadId
}

export async function sendMessage(threadId: string, body: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Messaging needs a connected account. Sign in on the live site.')
  }
  const { id: messageId } = await v1DmSendMessage(threadId, body)
  emitDmChange()
  return messageId
}

export async function setThreadStatus(
  threadId: string,
  status: Extract<DmThreadStatus, 'accepted' | 'declined'>,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error('Messaging needs a connected account. Sign in on the live site.')
  }
  await v1DmSetThreadStatus(threadId, status)
  emitDmChange()
}

export async function listThreads(): Promise<DmThreadSummary[]> {
  if (!isSupabaseConfigured()) return []

  const { threads } = await v1DmListThreads()
  return threads
}

export async function listMessages(threadId: string, limit = 100): Promise<DmMessage[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Messaging needs a connected account. Sign in on the live site.')
  }
  const { messages } = await v1DmListMessages(threadId, limit)
  emitDmChange()
  return messages
}

export async function getThreadHeader(threadId: string): Promise<DmThreadHeader | null> {
  if (!isSupabaseConfigured()) return null

  const { header } = await v1DmThreadHeader(threadId)
  return header
}

export async function getUnreadTotal(): Promise<number> {
  if (!isSupabaseConfigured()) return 0

  const { count } = await v1DmUnreadTotal()
  return count
}
