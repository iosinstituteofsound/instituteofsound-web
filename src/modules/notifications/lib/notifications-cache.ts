import type { QueryClient } from '@tanstack/react-query'
import type { NotificationDto } from '@/modules/notifications/types/notification.types'
import { notificationsQueryKey } from '@/modules/notifications/hooks/use-notifications'

export function applyIncomingNotification(
  queryClient: QueryClient,
  notification: NotificationDto,
): void {
  queryClient.setQueryData<{ items: NotificationDto[]; unreadCount: number } | undefined>(
    notificationsQueryKey,
    (current) => {
      if (!current) {
        return { items: [notification], unreadCount: 1 }
      }

      const exists = current.items.some((item) => item.id === notification.id)
      if (exists) return current

      return {
        items: [notification, ...current.items].slice(0, 40),
        unreadCount: current.unreadCount + 1,
      }
    },
  )
}
