import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { appendMessageToCache, messengerMessagesQueryKey } from '@/modules/messenger/lib/messenger-cache'
import { useAuthStore } from '@/app/stores/auth-store'

export {
  appendMessageToCache,
  messengerMessagesQueryKey,
  patchMessageInCache,
} from '@/modules/messenger/lib/messenger-cache'
export function useMessengerMessages(threadId?: string) {
  return useInfiniteQuery({
    queryKey: messengerMessagesQueryKey(threadId ?? ''),
    queryFn: ({ pageParam }) =>
      messengerApi.listMessages(threadId!, { limit: 50, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(threadId),
    staleTime: 10_000,
  })
}

export function useSendMessengerMessage(threadId: string) {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.userId)

  return useMutation({
    mutationFn: messengerApi.sendMessage,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: messengerMessagesQueryKey(threadId) })
      const clientMessageId = input.clientMessageId ?? crypto.randomUUID()
      const optimistic: DmMessage = {
        id: `optimistic-${clientMessageId}`,
        threadId,
        senderId: userId ?? 'me',
        type: input.type ?? 'text',
        body: input.body ?? '',
        mediaUrl: input.mediaUrl,
        mediaMimeType: input.mediaMimeType,
        mediaFileName: input.mediaFileName,
        replyToId: input.replyToId,
        reactions: [],
        clientMessageId,
        createdAt: new Date().toISOString(),
        optimistic: true,
      }

      queryClient.setQueryData(messengerMessagesQueryKey(threadId), (current: unknown) => {
        if (!current || typeof current !== 'object' || !('pages' in current)) {
          return { pages: [{ messages: [optimistic], nextCursor: null }], pageParams: [undefined] }
        }
        const data = current as { pages: Array<{ messages: DmMessage[]; nextCursor: string | null }>; pageParams: unknown[] }
        const pages = [...data.pages]
        const lastIndex = pages.length - 1
        const lastPage = pages[lastIndex]
        if (!lastPage) {
          pages.push({ messages: [optimistic], nextCursor: null })
        } else {
          pages[lastIndex] = { ...lastPage, messages: [...lastPage.messages, optimistic] }
        }
        return { ...data, pages }
      })

      return { clientMessageId }
    },
    onSuccess: (message) => {
      appendMessageToCache(queryClient, message)
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(messengerMessagesQueryKey(threadId), (current: unknown) => {
        if (!current || typeof current !== 'object' || !('pages' in current)) return current
        const data = current as { pages: Array<{ messages: DmMessage[]; nextCursor: string | null }>; pageParams: unknown[] }
        const pages = data.pages.map((page) => ({
          ...page,
          messages: page.messages.map((entry) =>
            entry.clientMessageId === context?.clientMessageId
              ? { ...entry, failed: true, optimistic: false }
              : entry,
          ),
        }))
        return { ...data, pages }
      })
    },
  })
}
