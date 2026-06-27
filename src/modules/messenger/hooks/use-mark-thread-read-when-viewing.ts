import { useEffect, useRef } from 'react'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'

export function useMarkThreadReadWhenViewing(
  threadId: string | undefined,
  messages: DmMessage[],
  viewerId: string | null | undefined,
  enabled = true,
) {
  const lastMarkedThreadRef = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled || !threadId || !viewerId) return
    if (lastMarkedThreadRef.current === threadId) return
    if (!messages.length || messages[0]?.threadId !== threadId) return

    const last = messages[messages.length - 1]
    if (!last || last.senderId === viewerId) {
      lastMarkedThreadRef.current = threadId
      return
    }

    lastMarkedThreadRef.current = threadId
    void messengerApi.markThreadRead(threadId, last.id)
  }, [enabled, messages, threadId, viewerId])

  useEffect(() => {
    if (!threadId) lastMarkedThreadRef.current = null
  }, [threadId])
}
