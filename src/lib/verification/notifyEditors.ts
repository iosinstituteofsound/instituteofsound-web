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
  requestId: string,
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
      verificationRequestId: requestId,
    })
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
  }
}

/** Backfill bell alerts for pending verification (requests submitted before DB trigger). */
export async function syncVerificationDeskNotifications(): Promise<void> {
  if (typeof window === 'undefined') return

  const { isSupabaseConfigured, getSupabase } = await import('@/lib/supabase/client')

  if (isSupabaseConfigured()) {
    const supabase = getSupabase()
    const { error } = await supabase.rpc('sync_verification_desk_notifications')
    if (error) {
      console.warn('[verification] desk notification sync', error.message)
    }
    window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
    return
  }

  const { listVerificationRequestsForReview } = await import('@/lib/verification/service')
  const { localListNotifications } = await import('@/lib/community/localNotifications')

  const pending = (await listVerificationRequestsForReview()).filter((r) => r.status === 'pending')
  const existing = localListNotifications(80).filter((n) => n.kind === 'role_verification')
  let added = false

  for (const req of pending) {
    if (existing.some((n) => n.verificationRequestId === req.id)) continue
    notifyDeskStaffOfVerificationRequest(req.userId, req.roleType, req.id)
    added = true
  }

  if (added) {
    window.dispatchEvent(new Event(COMMUNITY_NOTIFICATION_EVENT))
  }
}
