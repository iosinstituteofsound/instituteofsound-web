import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import { messengerThreadsQueryKey, upsertThreadInCache } from '@/modules/messenger/hooks/use-messenger-threads'
import { useAuthStore } from '@/app/stores/auth-store'

export const messengerMessagesQueryKey = (threadId: string) => ['messenger', 'messages', threadId] as const

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
        if (!current || typeof current !== 'object' || !('pages' in current)) return current
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
    onSuccess: (message, _input, context) => {
      queryClient.setQueryData(messengerMessagesQueryKey(threadId), (current: unknown) => {
        if (!current || typeof current !== 'object' || !('pages' in current)) return current
        const data = current as { pages: Array<{ messages: DmMessage[]; nextCursor: string | null }>; pageParams: unknown[] }
        const pages = data.pages.map((page) => ({
          ...page,
          messages: page.messages.map((entry) =>
            entry.clientMessageId && entry.clientMessageId === context?.clientMessageId ? message : entry,
          ),
        }))
        return { ...data, pages }
      })
      void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
    },
    onError: (_error, input, context) => {
      queryClient.setQueryData(messengerMessagesQueryKey(threadId), (current: unknown) => {
        if (!current || typeof current !== 'object' || !('pages' in current)) return current
        const data = current as { pages: Array<{ messages: DmMessage[]; nextCursor: string | null }>; pageParams: unknown[] }
        const pages = data.pages.map((page) => ({
          ...page,
          messages: page.messages.map((entry) =>
            entry.clientMessageId === context?.clientMessageId ? { ...entry, failed: true, optimistic: false } : entry,
          ),
        }))
        return { ...data, pages }
      })
    },
  })
}

export function appendMessageToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  message: DmMessage,
) {
  const threadId = message.threadId
  queryClient.setQueryData(messengerMessagesQueryKey(threadId), (current: unknown) => {
    if (!current || typeof current !== 'object' || !('pages' in current)) return current
    const data = current as { pages: Array<{ messages: DmMessage[]; nextCursor: string | null }>; pageParams: unknown[] }
    if (!data.pages.length) {
      return { pages: [{ messages: [message], nextCursor: null }], pageParams: [undefined] }
    }
    const pages = [...data.pages]
    const lastIndex = pages.length - 1
    const lastPage = pages[lastIndex]!
    if (lastPage.messages.some((entry) => entry.id === message.id)) return current
    pages[lastIndex] = { ...lastPage, messages: [...lastPage.messages, message] }
    return { ...data, pages }
  })
}

export function patchMessageInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  message: DmMessage,
) {
  queryClient.setQueryData(messengerMessagesQueryKey(message.threadId), (current: unknown) => {
    if (!current || typeof current !== 'object' || !('pages' in current)) return current
    const data = current as { pages: Array<{ messages: DmMessage[]; nextCursor: string | null }>; pageParams: unknown[] }
    const pages = data.pages.map((page) => ({
      ...page,
      messages: page.messages.map((entry) => (entry.id === message.id ? message : entry)),
    }))
    return { ...data, pages }
  })
}

export { upsertThreadInCache }
