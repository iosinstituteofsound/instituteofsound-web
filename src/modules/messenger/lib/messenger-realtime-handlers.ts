import type { QueryClient } from '@tanstack/react-query'
import { meQueryKey } from '@/modules/auth/hooks/use-auth'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import {
  appendMessageToCache,
  messengerUnreadQueryKey,
  patchMessageInCache,
  patchThreadPresenceInCache,
  upsertThreadInCache,
} from '@/modules/messenger/lib/messenger-cache'
import { useMessengerLiveStore } from '@/modules/messenger/store/messenger-live-store'
import { useMessengerPopupStore } from '@/modules/messenger/store/messenger-popup-store'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import type { MeResponse } from '@/shared/types/auth.types'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'

const MESSENGER_SETTINGS_KEY = 'ios-messenger-settings'

function getViewerId(queryClient: QueryClient): string | undefined {
  const me = queryClient.getQueryData<MeResponse>(meQueryKey)
  return me?.user.id
}

function isThreadOpen(threadId: string): boolean {
  const activeThreadId = useMessengerUiStore.getState().activeThreadId
  if (activeThreadId === threadId) return true
  return useMessengerPopupStore
    .getState()
    .windows.some((window) => !window.minimized && !window.stacked && window.threadId === threadId)
}

function shouldPopUpNewMessages(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(MESSENGER_SETTINGS_KEY)
    if (!raw) return true
    const parsed = JSON.parse(raw) as { popUpNewMessages?: boolean }
    return parsed.popUpNewMessages !== false
  } catch {
    return true
  }
}

function handleIncomingMessage(queryClient: QueryClient, message: DmMessage) {
  const viewerId = getViewerId(queryClient)
  appendMessageToCache(queryClient, message)

  if (!viewerId || message.senderId === viewerId) return

  if (isThreadOpen(message.threadId)) {
    void messengerApi.markThreadRead(message.threadId, message.id)
    return
  }

  useMessengerLiveStore.getState().incrementUnread()

  if (shouldPopUpNewMessages()) {
    const popupState = useMessengerPopupStore.getState()
    const isAlreadyOpen = popupState.windows.some((window) => window.threadId === message.threadId)
    if (!isAlreadyOpen) {
      void popupState.openChat({ threadId: message.threadId })
    }
  }
}

export function registerMessengerRealtimeHandlers(queryClient: QueryClient): void {
  realtimeSocketClient.onMessengerMessage((message) => {
    handleIncomingMessage(queryClient, message)
  })

  realtimeSocketClient.onMessengerMessageUpdated((message) => {
    patchMessageInCache(queryClient, message)
  })

  realtimeSocketClient.onMessengerThread((thread) => {
    upsertThreadInCache(queryClient, thread)
  })

  realtimeSocketClient.onMessengerTyping((payload) => {
    useMessengerUiStore.getState().setTyping(payload.threadId, payload.userId, payload.isTyping)
  })

  realtimeSocketClient.onMessengerRead((payload) => {
    const viewerId = getViewerId(queryClient)
    if (payload.userId !== viewerId) return
    void messengerApi.getUnreadCount().then((count) => {
      useMessengerLiveStore.getState().setUnreadCount(count)
      queryClient.setQueryData(messengerUnreadQueryKey, count)
    })
  })

  realtimeSocketClient.onMessengerPresence((payload) => {
    patchThreadPresenceInCache(queryClient, payload.userId, payload.isOnline)
  })

  realtimeSocketClient.onConnect(() => {
    if (!tokenStorage.hasSession()) return
    void messengerApi.getUnreadCount().then((count) => {
      useMessengerLiveStore.getState().setUnreadCount(count)
      queryClient.setQueryData(messengerUnreadQueryKey, count)
    })
  })
}
