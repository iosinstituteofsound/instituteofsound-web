import type { QueryClient } from '@tanstack/react-query'
import { getNotifications } from '@/modules/notifications/api/notifications.api'
import { notificationsQueryKey } from '@/modules/notifications/hooks/use-notifications'
import { applyIncomingNotification } from '@/modules/notifications/lib/notifications-cache'
import { useNotificationLiveStore } from '@/modules/notifications/store/notification-live-store'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'

let listenersRegistered = false

export function initNotificationsRealtime(queryClient: QueryClient): void {
  if (!listenersRegistered) {
    listenersRegistered = true

    realtimeSocketClient.onNotification((notification) => {
      useNotificationLiveStore.getState().pushLive(notification)
      applyIncomingNotification(queryClient, notification)
    })

    realtimeSocketClient.onConnect(() => {
      if (!tokenStorage.hasSession()) return
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
      void getNotifications().then((data) => {
        useNotificationLiveStore.getState().syncFromApi(data)
      })
    })
  }
}

export function resetNotificationsRealtime(): void {
  useNotificationLiveStore.getState().reset()
}
