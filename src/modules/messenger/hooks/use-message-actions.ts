import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import {
  messengerMessagesQueryKey,
  patchMessageInCache,
  useSendMessengerMessage,
} from '@/modules/messenger/hooks/use-messenger-messages'
import { messengerThreadsQueryKey } from '@/modules/messenger/hooks/use-messenger-threads'
import { createClientMessageId } from '@/modules/messenger/lib/messenger-utils'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '😡'] as const

export function useMessageActions(threadId: string) {
  const queryClient = useQueryClient()
  const sendMessage = useSendMessengerMessage(threadId)

  const reactMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      messengerApi.addMessageReaction(messageId, emoji),
    onSuccess: (message) => {
      patchMessageInCache(queryClient, message)
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ messageId, body }: { messageId: string; body: string }) =>
      messengerApi.editMessage(messageId, body),
    onSuccess: (message) => {
      patchMessageInCache(queryClient, message)
      void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (messageId: string) => messengerApi.deleteMessage(messageId),
    onSuccess: (message) => {
      patchMessageInCache(queryClient, message)
      void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
    },
  })

  const forwardMutation = useMutation({
    mutationFn: async ({
      targetThreadId,
      sourceMessage,
    }: {
      targetThreadId: string
      sourceMessage: DmMessage
    }) => {
      const body =
        sourceMessage.type === 'text'
          ? sourceMessage.body
          : sourceMessage.type === 'image'
            ? 'Photo'
            : sourceMessage.body || 'Forwarded message'

      return messengerApi.sendMessage({
        threadId: targetThreadId,
        body,
        type: sourceMessage.type === 'system' ? 'text' : sourceMessage.type,
        mediaUrl: sourceMessage.mediaUrl,
        mediaMimeType: sourceMessage.mediaMimeType,
        mediaFileName: sourceMessage.mediaFileName,
        forwardFromId: sourceMessage.id,
        shareData: sourceMessage.shareData,
        clientMessageId: createClientMessageId(),
      })
    },
    onSuccess: (_message, variables) => {
      void queryClient.invalidateQueries({ queryKey: messengerMessagesQueryKey(variables.targetThreadId) })
      void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
    },
  })

  return {
    reactToMessage: reactMutation.mutateAsync,
    editMessage: editMutation.mutateAsync,
    deleteMessage: deleteMutation.mutateAsync,
    forwardMessage: forwardMutation.mutateAsync,
    sendMessage: sendMessage.mutateAsync,
    isReacting: reactMutation.isPending,
    isEditing: editMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isForwarding: forwardMutation.isPending,
  }
}
