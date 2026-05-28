import { getUsers, getUserById } from '@/lib/auth/storage'
import { isEditorStaff } from '@/lib/auth/roles'
import { localAddNotification } from '@/lib/community/localNotifications'
import { COMMUNITY_NOTIFICATION_EVENT } from '@/lib/community/notificationService'
import type { VerificationRoleType } from '@/lib/verification/types'

export function roleVerificationRoleLabel(roleType: VerificationRoleType): string {
  switch (roleType) {
    case 'artist_manager':
      return 'Artist manager'
    case 'label':
      return 'Label'
    case 'event_promoter':
      return 'Event promoter'
    case 'brand':
      return 'Brand'
    default:
      return roleType
  }
}

/** Local demo: ping desk staff (editors + super editors) in the notification bell. */
export function notifyDeskStaffOfVerificationRequest(
  submitterUserId: string,
  roleType: VerificationRoleType,
  _requestId: string,
): void {
  const submitter = getUserById(submitterUserId)
  const roleLabel = roleVerificationRoleLabel(roleType)
  const body = `${submitter?.name ?? 'Member'} · ${roleLabel}`

  for (const account of getUsers()) {
    if (!isEditorStaff(account.role)) continue
    localAddNotification({
      kind: 'role_verification',
      title: 'New role verification request',
      body,
      href: '/editor/dashboard?desk=verification',
      actorId: submitterUserId,
      actorName: submitter?.name,
    })
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
  }
}
