import { useCallback } from 'react'
import { useMessageActions } from '@/modules/messenger/hooks/use-message-actions'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'

export function useMessageBubbleActions(message: DmMessage, threadId: string) {
  const setReplyTo = useMessengerUiStore((s) => s.setReplyTo)
  const setEditingMessage = useMessengerUiStore((s) => s.setEditingMessage)
  const setForwardFrom = useMessengerUiStore((s) => s.setForwardFrom)
  const { reactToMessage, deleteMessage } = useMessageActions(threadId)

  const onReply = useCallback(() => setReplyTo(message), [message, setReplyTo])

  const onForward = useCallback(() => setForwardFrom(message), [message, setForwardFrom])

  const onEdit = useCallback(() => setEditingMessage(message), [message, setEditingMessage])

  const onDelete = useCallback(async () => {
    await deleteMessage(message.id)
  }, [deleteMessage, message.id])

  const onReact = useCallback(
    async (emoji: string) => {
      await reactToMessage({ messageId: message.id, emoji })
    },
    [message.id, reactToMessage],
  )

  return { onReply, onForward, onEdit, onDelete, onReact }
}
