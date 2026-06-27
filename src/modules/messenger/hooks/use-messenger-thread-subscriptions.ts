import { useEffect, useMemo } from 'react'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'
import { getOpenThreadIds } from '@/modules/messenger/lib/open-threads'
import { useMessengerPopupStore } from '@/modules/messenger/store/messenger-popup-store'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'

export function useMessengerThreadSubscriptions() {
  const activeThreadId = useMessengerUiStore((s) => s.activeThreadId)
  const windows = useMessengerPopupStore((s) => s.windows)

  const openThreadIds = useMemo(
    () => getOpenThreadIds(activeThreadId, windows),
    [activeThreadId, windows],
  )

  const subscriptionKey = openThreadIds.join('|')

  useEffect(() => {
    const threadIds = subscriptionKey ? subscriptionKey.split('|') : []
    for (const threadId of threadIds) {
      void realtimeSocketClient.subscribeThread(threadId)
    }
    return () => {
      for (const threadId of threadIds) {
        void realtimeSocketClient.unsubscribeThread(threadId)
        realtimeSocketClient.emitTypingStop(threadId)
      }
    }
  }, [subscriptionKey])
}
