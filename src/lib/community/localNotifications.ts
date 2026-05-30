export type NotificationKind =
  | 'follow'
  | 'reaction'
  | 'rank_up'
  | 'editorial_publish'
  | 'collab_response'
  | 'collab_accepted'
  | 'role_verification'
  | 'playlist_curator_application'
  | 'artist_page_recovery'
  | 'dm_message'
  | 'post_comment'

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
  verificationRequestId?: string
  playlistCuratorApplicationId?: string
  artistPageRecoveryRequestId?: string
  artistProfileArchiveId?: string
  readAt?: string
  createdAt: string
}

const KEY = 'ios_community_notifications'

function storageKey(userId?: string) {
  return userId ? `${KEY}:${userId}` : KEY
}

function read(userId?: string): CommunityNotification[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as CommunityNotification[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(items: CommunityNotification[], userId?: string) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(items.slice(0, 80)))
  } catch {
    /* ignore */
  }
}

export function localListNotifications(limit = 40, viewerUserId?: string): CommunityNotification[] {
  if (!viewerUserId) {
    return read()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }
  return read(viewerUserId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

export function localUnreadCount(viewerUserId?: string): number {
  return localListNotifications(200, viewerUserId).filter((n) => !n.readAt).length
}

export function localAddNotification(
  input: Omit<CommunityNotification, 'id' | 'createdAt'> & { id?: string },
  targetUserId?: string
): void {
  const n: CommunityNotification = {
    id: input.id ?? crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  }
  const uid = targetUserId?.trim()
  if (uid) {
    write([n, ...read(uid)], uid)
    return
  }
  write([n, ...read()])
}

export function localMarkNotificationsRead(ids?: string[], viewerUserId?: string): void {
  const set = ids?.length ? new Set(ids) : null
  const now = new Date().toISOString()
  const uid = viewerUserId?.trim()
  const update = (list: CommunityNotification[]) =>
    list.map((n) => {
      if (n.readAt) return n
      if (set && !set.has(n.id)) return n
      return { ...n, readAt: now }
    })

  if (uid) {
    write(update(read(uid)), uid)
    return
  }
  write(update(read()))
}
