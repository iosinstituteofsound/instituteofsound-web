import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { messengerMessagesQueryKey } from '@/modules/messenger/hooks/use-messenger-messages'
import { messengerThreadsQueryKey, useMessengerThreads } from '@/modules/messenger/hooks/use-messenger-threads'
import { createClientMessageId } from '@/modules/messenger/lib/messenger-utils'
import { openMessengerPopup } from '@/modules/messenger/lib/messenger-popup-open'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'

export function useForwardMessageModal(message: DmMessage | null, onClose: () => void) {
  const queryClient = useQueryClient()
  const { threads } = useMessengerThreads()
  const [busy, setBusy] = useState(false)

  const forwardToThread = useCallback(
    async (targetThreadId: string) => {
      if (!message) return
      setBusy(true)
      try {
        const body =
          message.type === 'text'
            ? message.body
            : message.type === 'image'
              ? 'Photo'
              : message.body || 'Forwarded message'

        await messengerApi.sendMessage({
          threadId: targetThreadId,
          body,
          type: message.type === 'system' ? 'text' : message.type,
          mediaUrl: message.mediaUrl,
          mediaMimeType: message.mediaMimeType,
          mediaFileName: message.mediaFileName,
          forwardFromId: message.id,
          shareData: message.shareData,
          clientMessageId: createClientMessageId(),
        })

        onClose()
        void queryClient.invalidateQueries({ queryKey: messengerMessagesQueryKey(targetThreadId) })
        void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
        void openMessengerPopup({ threadId: targetThreadId })
      } finally {
        setBusy(false)
      }
    },
    [message, onClose, queryClient],
  )

  return {
    threads: threads.filter((thread) => thread.status !== 'declined'),
    busy,
    forwardToThread,
  }
}
