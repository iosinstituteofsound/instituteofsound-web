import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import {
  messengerThreadsQueryKey,
  patchMessageInCache,
} from '@/modules/messenger/lib/messenger-cache'

export function useMessageActions(_threadId: string) {
  const queryClient = useQueryClient()

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

  return {
    reactToMessage: reactMutation.mutateAsync,
    editMessage: editMutation.mutateAsync,
    deleteMessage: deleteMutation.mutateAsync,
  }
}
