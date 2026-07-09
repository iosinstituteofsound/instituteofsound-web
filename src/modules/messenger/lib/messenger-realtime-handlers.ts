import type { QueryClient } from '@tanstack/react-query'
import { meQueryKey } from '@/modules/auth/hooks/use-auth'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import {
  appendMessageToCache,
  applyPresenceSync,
  messengerUnreadQueryKey,
  patchMessageInCache,
  patchThreadPresenceInCache,
  patchThreadReadReceiptInCache,
  upsertThreadInCache,
  getMessengerThreadListQueryKeys,
} from '@/modules/messenger/lib/messenger-cache'
import { getPopUpNewMessagesEnabled } from '@/modules/messenger/lib/messenger-settings'
import { getOpenThreadIdsFromStores } from '@/modules/messenger/lib/open-threads'
import { useMessengerLiveStore } from '@/modules/messenger/store/messenger-live-store'
import { useMessengerPopupStore } from '@/modules/messenger/store/messenger-popup-store'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import type { MeResponse } from '@/shared/types/auth.types'
import { playMessageAlertSound } from '@/shared/lib/alert-sounds/alert-sounds'
import { tokenStorage } from '@/shared/services/api/token-storage'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'

function getViewerId(queryClient: QueryClient): string | undefined {
  const me = queryClient.getQueryData<MeResponse>(meQueryKey)
  return me?.user.id
}

function handleIncomingMessage(queryClient: QueryClient, message: DmMessage) {
  const viewerId = getViewerId(queryClient)
  appendMessageToCache(queryClient, message)

  if (!viewerId || message.senderId === viewerId) return

  if (getOpenThreadIdsFromStores().includes(message.threadId)) {
    void messengerApi.markThreadRead(message.threadId, message.id)
    return
  }

  useMessengerLiveStore.getState().incrementUnread()
  void playMessageAlertSound()

  if (getPopUpNewMessagesEnabled()) {
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
    patchThreadReadReceiptInCache(queryClient, payload, viewerId)
    if (payload.userId !== viewerId) return
    void messengerApi.getUnreadCount().then((count) => {
      useMessengerLiveStore.getState().setUnreadCount(count)
      queryClient.setQueryData(messengerUnreadQueryKey, count)
    })
  })

  realtimeSocketClient.onMessengerPresence((payload) => {
    patchThreadPresenceInCache(queryClient, payload.userId, payload.isOnline)
  })

  realtimeSocketClient.onMessengerPresenceSync((payload) => {
    applyPresenceSync(queryClient, payload.users)
  })

  realtimeSocketClient.onConnect(() => {
    if (!tokenStorage.hasSession()) return
    for (const key of getMessengerThreadListQueryKeys()) {
      void queryClient.invalidateQueries({ queryKey: key })
    }
    void messengerApi.getUnreadCount().then((count) => {
      useMessengerLiveStore.getState().setUnreadCount(count)
      queryClient.setQueryData(messengerUnreadQueryKey, count)
    })
  })
}
