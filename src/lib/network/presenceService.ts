import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1PingNetworkPresence, v1FetchOnlineConnections } from '@/api/v1Client'

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
  try {
    await v1PingNetworkPresence()
  } catch (err) {
    console.warn('[network] presence ping', err instanceof Error ? err.message : err)
  }
}

export async function fetchOnlineConnections(
  windowMinutes = ONLINE_WINDOW_MINUTES,
): Promise<OnlineConnection[]> {
  if (!isSupabaseConfigured()) return []
  try {
    const { connections } = await v1FetchOnlineConnections(windowMinutes)
    return connections
  } catch (err) {
    console.warn('[network] online connections', err instanceof Error ? err.message : err)
    return []
  }
}
