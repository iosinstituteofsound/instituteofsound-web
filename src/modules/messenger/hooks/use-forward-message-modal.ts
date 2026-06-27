import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMessengerThreads } from '@/modules/messenger/hooks/use-messenger-threads'
import { forwardMessage } from '@/modules/messenger/utils/forward-message'
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
        await forwardMessage(queryClient, message, targetThreadId, { openPopup: true })
        onClose()
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
