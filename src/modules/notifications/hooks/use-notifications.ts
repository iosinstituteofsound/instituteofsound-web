import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/modules/notifications/api/notifications.api'
import type { NotificationDto } from '@/modules/notifications/types/notification.types'
import { tokenStorage } from '@/shared/services/api/token-storage'

export const notificationsQueryKey = ['notifications'] as const

export function useNotifications(enabled = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: () => getNotifications(),
    enabled: enabled && tokenStorage.hasSession(),
    staleTime: 30_000,
    refetchOnMount: 'always',
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (updated) => {
      queryClient.setQueryData<{ items: NotificationDto[]; unreadCount: number } | undefined>(
        notificationsQueryKey,
        (current) => {
          if (!current) return current
          const previous = current.items.find((item) => item.id === updated.id)
          const wasUnread = Boolean(previous && !previous.readAt)
          return {
            items: current.items.map((item) => (item.id === updated.id ? updated : item)),
            unreadCount: Math.max(0, current.unreadCount - (wasUnread ? 1 : 0)),
          }
        },
      )
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })

  return {
    ...query,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingRead: markReadMutation.isPending || markAllReadMutation.isPending,
  }
}
