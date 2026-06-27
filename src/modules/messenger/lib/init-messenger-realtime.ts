import type { QueryClient } from '@tanstack/react-query'
import { meQueryKey } from '@/modules/auth/hooks/use-auth'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { appendMessageToCache } from '@/modules/messenger/hooks/use-messenger-messages'
import {
  messengerThreadsQueryKey,
  messengerUnreadQueryKey,
  upsertThreadInCache,
} from '@/modules/messenger/hooks/use-messenger-threads'
import { useMessengerLiveStore } from '@/modules/messenger/store/messenger-live-store'
import { useMessengerPopupStore } from '@/modules/messenger/store/messenger-popup-store'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { MeResponse } from '@/shared/types/auth.types'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'

let listenersRegistered = false

function getViewerId(queryClient: QueryClient): string | undefined {
  const me = queryClient.getQueryData<MeResponse>(meQueryKey)
  return me?.user.id
}

function isThreadOpen(threadId: string): boolean {
  const activeThreadId = useMessengerUiStore.getState().activeThreadId
  if (activeThreadId === threadId) return true
  return useMessengerPopupStore
    .getState()
    .windows.some((window) => !window.minimized && window.threadId === threadId)
}

export function initMessengerRealtime(queryClient: QueryClient): void {
  if (listenersRegistered) return
  listenersRegistered = true

  realtimeSocketClient.onMessengerMessage((message) => {
    const viewerId = getViewerId(queryClient)
    appendMessageToCache(queryClient, message)

    if (!viewerId || message.senderId === viewerId) return
    if (isThreadOpen(message.threadId)) {
      void messengerApi.markThreadRead(message.threadId, message.id)
      return
    }

    useMessengerLiveStore.getState().incrementUnread()
    void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
  })

  realtimeSocketClient.onMessengerThread((thread) => {
    upsertThreadInCache(queryClient, thread)
  })

  realtimeSocketClient.onMessengerRead((payload) => {
    const viewerId = getViewerId(queryClient)
    if (payload.userId !== viewerId) return
    void messengerApi.getUnreadCount().then((count) => {
      useMessengerLiveStore.getState().setUnreadCount(count)
      queryClient.setQueryData(messengerUnreadQueryKey, count)
    })
    void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
  })

  realtimeSocketClient.onConnect(() => {
    if (!tokenStorage.hasSession()) return
    void messengerApi.getUnreadCount().then((count) => {
      useMessengerLiveStore.getState().setUnreadCount(count)
      queryClient.setQueryData(messengerUnreadQueryKey, count)
    })
  })
}

export function resetMessengerRealtime(): void {
  useMessengerLiveStore.getState().reset()
}
