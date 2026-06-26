import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'
import {
  appendMessageToCache,
  patchMessageInCache,
} from '@/modules/messenger/hooks/use-messenger-messages'
import {
  messengerThreadsQueryKey,
  messengerUnreadQueryKey,
  upsertThreadInCache,
} from '@/modules/messenger/hooks/use-messenger-threads'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmMessage, DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import * as messengerApi from '@/modules/messenger/api/messenger.api'

export function useMessengerRealtime(activeThreadId?: string | null) {
  const queryClient = useQueryClient()
  const setTyping = useMessengerUiStore((s) => s.setTyping)

  useEffect(() => {
    if (!activeThreadId) return
    void realtimeSocketClient.subscribeThread(activeThreadId)
    return () => {
      void realtimeSocketClient.unsubscribeThread(activeThreadId)
      realtimeSocketClient.emitTypingStop(activeThreadId)
    }
  }, [activeThreadId])

  useEffect(() => {
    const offMessage = realtimeSocketClient.onMessengerMessage((message: DmMessage) => {
      appendMessageToCache(queryClient, message)
      void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
      void queryClient.invalidateQueries({ queryKey: messengerUnreadQueryKey })
      if (activeThreadId === message.threadId) {
        void messengerApi.markThreadRead(message.threadId, message.id)
      }
    })

    const offUpdated = realtimeSocketClient.onMessengerMessageUpdated((message) => {
      patchMessageInCache(queryClient, message)
    })

    const offThread = realtimeSocketClient.onMessengerThread((thread: DmThreadSummary) => {
      upsertThreadInCache(queryClient, thread)
    })

    const offTyping = realtimeSocketClient.onMessengerTyping((payload) => {
      setTyping(payload.threadId, payload.userId, payload.isTyping)
    })

    const offRead = realtimeSocketClient.onMessengerRead(() => {
      void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
    })

    const offPresence = realtimeSocketClient.onMessengerPresence((payload) => {
      queryClient.setQueryData<DmThreadSummary[]>(messengerThreadsQueryKey, (current) =>
        (current ?? []).map((thread) =>
          thread.otherUserId === payload.userId
            ? { ...thread, otherIsOnline: payload.isOnline }
            : thread,
        ),
      )
    })

    return () => {
      offMessage()
      offUpdated()
      offThread()
      offTyping()
      offRead()
      offPresence()
    }
  }, [activeThreadId, queryClient, setTyping])
}
