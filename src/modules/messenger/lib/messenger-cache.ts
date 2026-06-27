import type { QueryClient } from '@tanstack/react-query'
import type { DmMessage, DmThreadSummary } from '@/modules/messenger/types/messenger.types'

export const messengerThreadsQueryKey = ['messenger', 'threads'] as const
export const messengerUnreadQueryKey = ['messenger', 'unread'] as const

export const messengerMessagesQueryKey = (threadId: string) =>
  ['messenger', 'messages', threadId] as const

type MessagesInfiniteData = {
  pages: Array<{ messages: DmMessage[]; nextCursor: string | null }>
  pageParams: unknown[]
}

export function getMessengerThreadListQueryKeys() {
  return [
    [...messengerThreadsQueryKey, undefined],
    [...messengerThreadsQueryKey, 'requests'],
    [...messengerThreadsQueryKey, 'all'],
  ] as const
}

function sortThreads(list: DmThreadSummary[]) {
  return [...list].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return bTime - aTime
  })
}

export function upsertThreadInCache(queryClient: QueryClient, thread: DmThreadSummary) {
  for (const key of getMessengerThreadListQueryKeys()) {
    queryClient.setQueryData<DmThreadSummary[]>(key, (current) => {
      const list = current ?? []
      const without = list.filter((entry) => entry.threadId !== thread.threadId)
      return sortThreads([thread, ...without])
    })
  }
}

export function patchThreadPresenceInCache(
  queryClient: QueryClient,
  userId: string,
  isOnline: boolean,
) {
  for (const key of getMessengerThreadListQueryKeys()) {
    queryClient.setQueryData<DmThreadSummary[]>(key, (current) =>
      (current ?? []).map((thread) =>
        thread.otherUserId === userId ? { ...thread, otherIsOnline: isOnline } : thread,
      ),
    )
  }
}

function mergeMessageIntoPage(messages: DmMessage[], message: DmMessage): DmMessage[] | null {
  if (message.clientMessageId) {
    const optimisticIndex = messages.findIndex(
      (entry) => entry.clientMessageId && entry.clientMessageId === message.clientMessageId,
    )
    if (optimisticIndex >= 0) {
      const next = [...messages]
      next[optimisticIndex] = message
      return next
    }
  }

  if (messages.some((entry) => entry.id === message.id)) {
    return null
  }

  return [...messages, message]
}

export function appendMessageToCache(queryClient: QueryClient, message: DmMessage) {
  const threadId = message.threadId
  queryClient.setQueryData<MessagesInfiniteData>(messengerMessagesQueryKey(threadId), (current) => {
    if (!current || !('pages' in current) || !current.pages.length) {
      return { pages: [{ messages: [message], nextCursor: null }], pageParams: [undefined] }
    }

    const pages = [...current.pages]
    const lastIndex = pages.length - 1
    const lastPage = pages[lastIndex]!
    const merged = mergeMessageIntoPage(lastPage.messages, message)
    if (!merged) return current

    pages[lastIndex] = { ...lastPage, messages: merged }
    return { ...current, pages }
  })
}

export function patchMessageInCache(queryClient: QueryClient, message: DmMessage) {
  queryClient.setQueryData<MessagesInfiniteData>(messengerMessagesQueryKey(message.threadId), (current) => {
    if (!current || !('pages' in current)) return current
    const pages = current.pages.map((page) => ({
      ...page,
      messages: page.messages.map((entry) => (entry.id === message.id ? message : entry)),
    }))
    return { ...current, pages }
  })
}
