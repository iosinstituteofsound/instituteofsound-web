import { getUsers, getUserById } from '@/lib/auth/storage'
import { localAddNotification } from '@/lib/community/localNotifications'
import { COMMUNITY_NOTIFICATION_EVENT } from '@/lib/community/notificationService'

export function notifySuperEditorsOfRecoveryRequest(
  submitterUserId: string,
  requestId: string,
  archiveId: string,
): void {
  const submitter = getUserById(submitterUserId)
  const body = `${submitter?.name ?? 'Artist'} submitted an IOS Support page recovery request`

  for (const account of getUsers()) {
    localAddNotification(
      {
        kind: 'artist_page_recovery',
        title: 'Page recovery request',
        body,
        href: '/editor/dashboard?desk=deleted-pages',
        actorId: submitterUserId,
        actorName: submitter?.name,
        artistPageRecoveryRequestId: requestId,
        artistProfileArchiveId: archiveId,
      },
      account.id,
    )
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
  }
}

export function notifyMemberRecoveryDecision(
  userId: string,
  requestId: string,
  decision: 'approved' | 'rejected',
  reviewNotes?: string,
): void {
  const title =
    decision === 'approved'
      ? 'IOS Support restored your artist page'
      : 'IOS Support could not restore your page'
  const body =
    decision === 'approved'
      ? 'Your artist page has been restored. Open My Studio to review your catalog.'
      : reviewNotes?.trim() ||
        'We could not verify your request this time. Contact IOS Support if you have questions.'

  localAddNotification(
    {
      kind: 'artist_page_recovery',
      title,
      body,
      href: decision === 'approved' ? '/artist/dashboard' : '/support/artist-page',
      artistPageRecoveryRequestId: requestId,
    },
    userId,
  )

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
  }
}
