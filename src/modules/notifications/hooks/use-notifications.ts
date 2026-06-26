import { useCallback, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/modules/notifications/api/notifications.api'
import type { NotificationDto } from '@/modules/notifications/types/notification.types'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'
import { tokenStorage } from '@/shared/services/api/token-storage'

export const notificationsQueryKey = ['notifications'] as const

export function useNotifications(enabled = true) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: notificationsQueryKey,
    queryFn: () => getNotifications(),
    enabled: enabled && tokenStorage.hasSession(),
    staleTime: 30_000,
  })

  const handleIncoming = useCallback(
    (notification: NotificationDto) => {
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
      // Reconcile with API so an in-flight fetch cannot overwrite the socket update.
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
    [queryClient],
  )

  useEffect(() => {
    if (!enabled || !tokenStorage.hasSession()) return undefined

    const refresh = () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    }

    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    document.addEventListener('visibilitychange', onVisibility)
    const pollId = window.setInterval(refresh, 60_000)

    const unsubscribe = realtimeSocketClient.onNotification(handleIncoming)

    return () => {
      unsubscribe()
      document.removeEventListener('visibilitychange', onVisibility)
      window.clearInterval(pollId)
    }
  }, [enabled, handleIncoming, queryClient])

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
