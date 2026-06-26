import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/app/stores/auth-store'
import { getNotifications } from '@/modules/notifications/api/notifications.api'
import { notificationsQueryKey } from '@/modules/notifications/hooks/use-notifications'
import { applyIncomingNotification } from '@/modules/notifications/lib/notifications-cache'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'

/** Keep notification socket + query cache in sync app-wide (not tied to bell mount). */
export function useNotificationsRealtime() {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated || !tokenStorage.hasSession()) return undefined

    realtimeSocketClient.connect()

    void queryClient.prefetchQuery({
      queryKey: notificationsQueryKey,
      queryFn: () => getNotifications(),
      staleTime: 30_000,
    })

    const unsubscribe = realtimeSocketClient.onNotification((notification) => {
      applyIncomingNotification(queryClient, notification)
    })

    const offConnect = realtimeSocketClient.onConnect(() => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    })

    return () => {
      unsubscribe()
      offConnect()
    }
  }, [isAuthenticated, queryClient])
}
