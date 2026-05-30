import { getUsers, getUserById } from '@/lib/auth/storage'
import { localAddNotification } from '@/lib/community/localNotifications'
import { COMMUNITY_NOTIFICATION_EVENT } from '@/lib/community/notificationService'

export function notifySuperEditorsOfPlaylistCuratorApplication(
  submitterUserId: string,
  applicationId: string,
): void {
  const submitter = getUserById(submitterUserId)
  const body = `${submitter?.name ?? 'Member'} submitted playlist links for review`

  for (const account of getUsers()) {
    if (account.role !== 'super_editor') continue
    localAddNotification(
      {
        kind: 'playlist_curator_application',
        title: 'New playlist curator application',
        body,
        href: '/editor/dashboard?desk=playlist-curators',
        actorId: submitterUserId,
        actorName: submitter?.name,
        playlistCuratorApplicationId: applicationId,
      },
      account.id,
    )
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
  }
}

export function notifyMemberPlaylistCuratorDecision(
  userId: string,
  applicationId: string,
  decision: 'approved' | 'rejected',
  reviewNotes?: string,
): void {
  const title =
    decision === 'approved'
      ? 'Playlist curator application approved'
      : 'Playlist curator application declined'
  const body =
    decision === 'approved'
      ? 'Your playlists passed IOS Support review — you are verified as a curator on IOS.'
      : reviewNotes?.trim() || 'IOS Support could not verify your playlists this round. You may re-apply.'

  localAddNotification(
    {
      kind: 'playlist_curator_application',
      title,
      body,
      href: '/member/playlist-curator',
      playlistCuratorApplicationId: applicationId,
    },
    userId,
  )

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
  }
}

export async function syncPlaylistCuratorDeskNotifications(): Promise<void> {
  if (typeof window === 'undefined') return
  const { listPlaylistCuratorApplicationsForReview } = await import(
    '@/lib/playlistCurator/service'
  )
  const { localListNotifications } = await import('@/lib/community/localNotifications')

  const pending = (await listPlaylistCuratorApplicationsForReview()).filter(
    (a) => a.status === 'pending',
  )
  const { getUsers } = await import('@/lib/auth/storage')
  const superEditors = getUsers().filter((u) => u.role === 'super_editor')

  for (const editor of superEditors) {
    const existing = localListNotifications(80, editor.id).filter(
      (n) => n.kind === 'playlist_curator_application',
    )
    const known = new Set(existing.map((n) => n.playlistCuratorApplicationId).filter(Boolean))
    for (const app of pending) {
      if (known.has(app.id)) continue
      notifySuperEditorsOfPlaylistCuratorApplication(app.userId, app.id)
    }
  }
}
