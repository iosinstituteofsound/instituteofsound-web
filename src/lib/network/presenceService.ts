import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'

export const ONLINE_WINDOW_MINUTES = 3
export const PRESENCE_PING_MS = 45_000
export const ONLINE_CONNECTS_POLL_MS = 30_000

export interface OnlineConnection {
  userId: string
  displayName: string
  handle: string
  avatarUrl?: string
  lastSeenAt: string
}

export async function pingNetworkPresence(): Promise<void> {
  if (!isSupabaseConfigured()) return
  const supabase = getSupabase()
  const { error } = await supabase.rpc('network_ping_presence')
  if (error) {
    console.warn('[network] presence ping', error.message)
  }
}

export async function fetchOnlineConnections(
  windowMinutes = ONLINE_WINDOW_MINUTES,
): Promise<OnlineConnection[]> {
  if (!isSupabaseConfigured()) return []
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('network_online_connections', {
    p_window_minutes: windowMinutes,
  })
  if (error) {
    console.warn('[network] online connections', error.message)
    return []
  }
  return (data ?? []).map((row: Record<string, unknown>) => ({
    userId: String(row.user_id),
    displayName: String(row.display_name),
    handle: String(row.handle).replace(/^@/, ''),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    lastSeenAt: String(row.last_seen_at),
  }))
}
