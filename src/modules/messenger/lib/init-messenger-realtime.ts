import type { QueryClient } from '@tanstack/react-query'
import { registerMessengerRealtimeHandlers } from '@/modules/messenger/lib/messenger-realtime-handlers'
import { useMessengerLiveStore } from '@/modules/messenger/store/messenger-live-store'

let listenersRegistered = false

export function initMessengerRealtime(queryClient: QueryClient): void {
  if (listenersRegistered) return
  listenersRegistered = true
  registerMessengerRealtimeHandlers(queryClient)
}

export function resetMessengerRealtime(): void {
  useMessengerLiveStore.getState().reset()
}
