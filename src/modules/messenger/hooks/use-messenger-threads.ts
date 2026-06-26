import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'

export const messengerThreadsQueryKey = ['messenger', 'threads'] as const
export const messengerUnreadQueryKey = ['messenger', 'unread'] as const

export function useMessengerThreads() {
  const filter = useMessengerUiStore((s) => s.filter)
  const searchQuery = useMessengerUiStore((s) => s.searchQuery)

  const query = useQuery({
    queryKey: messengerThreadsQueryKey,
    queryFn: messengerApi.listThreads,
    staleTime: 15_000,
  })

  const filteredThreads = useMemo(() => {
    let threads = query.data ?? []
    const needle = searchQuery.trim().toLowerCase()

    if (filter === 'unread') {
      threads = threads.filter((thread) => thread.unreadCount > 0)
    } else if (filter === 'groups') {
      threads = threads.filter((thread) => thread.isGroup)
    } else if (filter === 'communities') {
      threads = []
    }

    if (needle) {
      threads = threads.filter(
        (thread) =>
          thread.otherName.toLowerCase().includes(needle) ||
          thread.otherHandle?.toLowerCase().includes(needle) ||
          thread.lastMessageBody?.toLowerCase().includes(needle),
      )
    }

    return threads
  }, [filter, query.data, searchQuery])

  return { ...query, threads: filteredThreads }
}

export function useMessengerUnread() {
  return useQuery({
    queryKey: messengerUnreadQueryKey,
    queryFn: messengerApi.getUnreadCount,
    staleTime: 20_000,
  })
}

export function upsertThreadInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  thread: DmThreadSummary,
) {
  queryClient.setQueryData<DmThreadSummary[]>(messengerThreadsQueryKey, (current) => {
    const list = current ?? []
    const without = list.filter((entry) => entry.threadId !== thread.threadId)
    return [thread, ...without].sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return bTime - aTime
    })
  })
}
