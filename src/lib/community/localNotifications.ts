export type NotificationKind =
  | 'follow'
  | 'reaction'
  | 'rank_up'
  | 'editorial_publish'
  | 'collab_response'
  | 'collab_accepted'
  | 'role_verification'

export interface CommunityNotification {
  id: string
  kind: NotificationKind
  title: string
  body?: string
  href?: string
  actorId?: string
  actorName?: string
  actorHandle?: string
  actorAvatarUrl?: string
  /** Dedupe desk alerts for role verification (local demo). */
  verificationRequestId?: string
  readAt?: string
  createdAt: string
}

const KEY = 'ios_community_notifications'

function read(): CommunityNotification[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CommunityNotification[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(items: CommunityNotification[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, 80)))
  } catch {
    /* ignore */
  }
}

export function localListNotifications(limit = 40): CommunityNotification[] {
  return read()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export function localUnreadCount(): number {
  return read().filter((n) => !n.readAt).length
}

export function localAddNotification(
  input: Omit<CommunityNotification, 'id' | 'createdAt'> & { id?: string }
): void {
  const n: CommunityNotification = {
    id: input.id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  }
  write([n, ...read()])
}

export function localMarkNotificationsRead(ids?: string[]): void {
  const set = ids?.length ? new Set(ids) : null
  const now = new Date().toISOString()
  write(
    read().map((n) => {
      if (n.readAt) return n
      if (set && !set.has(n.id)) return n
      return { ...n, readAt: now }
    })
  )
}
