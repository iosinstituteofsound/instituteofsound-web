import { useEffect, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/app/stores/auth-store'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'
import { env } from '@/shared/config/env'
import {
  initNotificationsRealtime,
  resetNotificationsRealtime,
} from '@/modules/notifications/lib/init-notifications-realtime'

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!env.wsEnabled) return undefined

    if (!isAuthenticated || !tokenStorage.hasSession()) {
      resetNotificationsRealtime()
      realtimeSocketClient.disconnect()
      return undefined
    }

    initNotificationsRealtime(queryClient)
    realtimeSocketClient.connect()

    return undefined
  }, [queryClient, isAuthenticated])

  return children
}
