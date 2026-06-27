import { useEffect, useMemo } from 'react'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'
import { useMessengerPopupStore } from '@/modules/messenger/store/messenger-popup-store'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'

function collectOpenThreadIds(
  activeThreadId: string | null,
  windows: Array<{ threadId: string; minimized: boolean; stacked: boolean }>,
): string[] {
  const ids = new Set<string>()
  if (activeThreadId) ids.add(activeThreadId)
  for (const window of windows) {
    if (!window.minimized && !window.stacked) {
      ids.add(window.threadId)
    }
  }
  return [...ids]
}

export function useMessengerThreadSubscriptions() {
  const activeThreadId = useMessengerUiStore((s) => s.activeThreadId)
  const windows = useMessengerPopupStore((s) => s.windows)

  const openThreadIds = useMemo(
    () => collectOpenThreadIds(activeThreadId, windows),
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
