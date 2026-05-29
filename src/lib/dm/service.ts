import { isSupabaseConfigured, getSupabase } from '@/lib/supabase/client'
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

function requireSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Messaging needs a connected account. Sign in on the live site.')
  }
  return getSupabase()
}

/** Whether DMs are available in this environment (Supabase only). */
export function isMessagingAvailable(): boolean {
  return isSupabaseConfigured()
}

export async function getOrCreateThread(otherUserId: string): Promise<string> {
  const supabase = requireSupabase()
  const { data, error } = await supabase.rpc('dm_get_or_create_thread', {
    p_other: otherUserId,
  })
  if (error) throw new Error(error.message)
  return data as string
}

export async function sendMessage(threadId: string, body: string): Promise<string> {
  const supabase = requireSupabase()
  const { data, error } = await supabase.rpc('dm_send_message', {
    p_thread_id: threadId,
    p_body: body,
  })
  if (error) throw new Error(error.message)
  emitDmChange()
  return data as string
}

export async function setThreadStatus(
  threadId: string,
  status: Extract<DmThreadStatus, 'accepted' | 'declined'>,
): Promise<void> {
  const supabase = requireSupabase()
  const { error } = await supabase.rpc('dm_set_thread_status', {
    p_thread_id: threadId,
    p_status: status,
  })
  if (error) throw new Error(error.message)
  emitDmChange()
}

interface ThreadRow {
  thread_id: string
  status: DmThreadStatus
  is_requester: boolean
  other_user_id: string
  other_name: string | null
  other_handle: string | null
  other_avatar_url: string | null
  last_message_body: string | null
  last_message_at: string | null
  last_sender_id: string | null
  unread_count: number | string
}

export async function listThreads(): Promise<DmThreadSummary[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('dm_list_threads')
  if (error || !Array.isArray(data)) return []
  return (data as ThreadRow[]).map((row) => ({
    threadId: row.thread_id,
    status: row.status,
    isRequester: row.is_requester,
    otherUserId: row.other_user_id,
    otherName: row.other_name ?? 'Member',
    otherHandle: row.other_handle ?? 'member',
    otherAvatarUrl: row.other_avatar_url ?? undefined,
    lastMessageBody: row.last_message_body ?? undefined,
    lastMessageAt: row.last_message_at ?? undefined,
    lastSenderId: row.last_sender_id ?? undefined,
    unreadCount: Number(row.unread_count) || 0,
  }))
}

interface MessageRow {
  id: string
  sender_id: string
  body: string
  created_at: string
  read_at: string | null
}

export async function listMessages(threadId: string, limit = 100): Promise<DmMessage[]> {
  const supabase = requireSupabase()
  const { data, error } = await supabase.rpc('dm_list_messages', {
    p_thread_id: threadId,
    lim: limit,
  })
  if (error) throw new Error(error.message)
  emitDmChange()
  if (!Array.isArray(data)) return []
  return (data as MessageRow[]).map((row) => ({
    id: row.id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at ?? undefined,
  }))
}

interface HeaderRow {
  thread_id: string
  status: DmThreadStatus
  is_requester: boolean
  other_user_id: string
  other_name: string | null
  other_handle: string | null
  other_avatar_url: string | null
}

export async function getThreadHeader(threadId: string): Promise<DmThreadHeader | null> {
  if (!isSupabaseConfigured()) return null
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('dm_thread_header', { p_thread_id: threadId })
  if (error || !Array.isArray(data) || data.length === 0) return null
  const row = data[0] as HeaderRow
  return {
    threadId: row.thread_id,
    status: row.status,
    isRequester: row.is_requester,
    otherUserId: row.other_user_id,
    otherName: row.other_name ?? 'Member',
    otherHandle: row.other_handle ?? 'member',
    otherAvatarUrl: row.other_avatar_url ?? undefined,
  }
}

export async function getUnreadTotal(): Promise<number> {
  if (!isSupabaseConfigured()) return 0
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('dm_unread_total')
  if (error) return 0
  return Number(data) || 0
}
