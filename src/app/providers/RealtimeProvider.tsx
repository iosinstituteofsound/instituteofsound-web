import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/app/stores/auth-store'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'
import { env } from '@/shared/config/env'

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  useEffect(() => {
    if (!env.wsEnabled) return undefined

    if (isAuthenticated) {
      realtimeSocketClient.refreshAuth()
      realtimeSocketClient.connect()
    } else {
      realtimeSocketClient.disconnect()
    }

    return () => {
      realtimeSocketClient.disconnect()
    }
  }, [isAuthenticated])

  return children
}
