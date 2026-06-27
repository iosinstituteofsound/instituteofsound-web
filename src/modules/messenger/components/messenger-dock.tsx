import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { MessengerChatWindow } from '@/modules/messenger/components/messenger-chat-window'
import { MessengerDockStack } from '@/modules/messenger/components/messenger-dock-stack'
import { appendMessageToCache, patchMessageInCache } from '@/modules/messenger/hooks/use-messenger-messages'
import { useMessengerSettings } from '@/modules/messenger/hooks/use-messenger-settings'
import {
  messengerThreadsQueryKey,
  messengerUnreadQueryKey,
} from '@/modules/messenger/hooks/use-messenger-threads'
import {
  MESSENGER_OPEN_EVENT,
  selectDockedWindows,
  selectStackedWindows,
  useMessengerPopupStore,
  type MessengerOpenDetail,
} from '@/modules/messenger/store/messenger-popup-store'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { useAuthStore } from '@/app/stores/auth-store'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'
import * as messengerApi from '@/modules/messenger/api/messenger.api'

function MessengerPopupRealtime() {
  const queryClient = useQueryClient()
  const viewerId = useAuthStore((s) => s.userId)
  const windows = useMessengerPopupStore((s) => s.windows)
  const openChat = useMessengerPopupStore((s) => s.openChat)
  const setTyping = useMessengerUiStore((s) => s.setTyping)
  const { settings } = useMessengerSettings()

  const openThreadIds = windows
    .filter((window) => !window.stacked && !window.minimized)
    .map((window) => window.threadId)

  useEffect(() => {
    for (const threadId of openThreadIds) {
      void realtimeSocketClient.subscribeThread(threadId)
    }
    return () => {
      for (const threadId of openThreadIds) {
        void realtimeSocketClient.unsubscribeThread(threadId)
      }
    }
  }, [openThreadIds.join('|')])

  useEffect(() => {
    const offMessage = realtimeSocketClient.onMessengerMessage((message: DmMessage) => {
      appendMessageToCache(queryClient, message)
      void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
      void queryClient.invalidateQueries({ queryKey: messengerUnreadQueryKey })

      const isOpen = windows.some((window) => window.threadId === message.threadId)
      if (
        settings.popUpNewMessages &&
        message.senderId !== viewerId &&
        !isOpen
      ) {
        void openChat({ threadId: message.threadId })
      }

      if (openThreadIds.includes(message.threadId) && message.senderId !== viewerId) {
        void messengerApi.markThreadRead(message.threadId, message.id)
      }
    })

    const offTyping = realtimeSocketClient.onMessengerTyping((payload) => {
      setTyping(payload.threadId, payload.userId, payload.isTyping)
    })

    const offUpdated = realtimeSocketClient.onMessengerMessageUpdated((message) => {
      patchMessageInCache(queryClient, message)
    })

    return () => {
      offMessage()
      offTyping()
      offUpdated()
    }
  }, [
    openChat,
    openThreadIds,
    queryClient,
    setTyping,
    settings.popUpNewMessages,
    viewerId,
    windows,
  ])

  return null
}

export function MessengerDock() {
  const userId = useAuthStore((s) => s.userId)
  const windows = useMessengerPopupStore((s) => s.windows)
  const openChat = useMessengerPopupStore((s) => s.openChat)

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<MessengerOpenDetail>).detail
      if (detail) void openChat(detail)
    }
    window.addEventListener(MESSENGER_OPEN_EVENT, onOpen)
    return () => window.removeEventListener(MESSENGER_OPEN_EVENT, onOpen)
  }, [openChat])

  if (!userId || windows.length === 0) return null

  const dockedWindows = selectDockedWindows(windows)
  const stackedWindows = selectStackedWindows(windows)

  return (
    <>
      <MessengerPopupRealtime />
      <div className="messenger-dock" aria-label="Open conversations">
        {stackedWindows.length ? (
          <MessengerDockStack threadIds={stackedWindows.map((window) => window.threadId)} />
        ) : null}
        {[...dockedWindows].reverse().map((window) => (
          <MessengerChatWindow
            key={window.key}
            threadId={window.threadId}
            minimized={window.minimized}
          />
        ))}
      </div>
    </>
  )
}
