import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmThreadSummary, MessengerFilter } from '@/modules/messenger/types/messenger.types'

export const messengerThreadsQueryKey = ['messenger', 'threads'] as const
export const messengerUnreadQueryKey = ['messenger', 'unread'] as const

function filterThreads(threads: DmThreadSummary[], filter: MessengerFilter, search: string) {
  let list = threads
  const needle = search.trim().toLowerCase()

  if (filter === 'unread') {
    list = list.filter((thread) => thread.unreadCount > 0)
  } else if (filter === 'groups') {
    list = list.filter((thread) => thread.kind === 'group')
  } else if (filter === 'communities') {
    list = list.filter((thread) => thread.kind === 'community')
  } else if (filter === 'requests') {
    list = list.filter((thread) => thread.isPendingRequest)
  }

  if (needle) {
    list = list.filter(
      (thread) =>
        thread.title.toLowerCase().includes(needle) ||
        thread.subtitle?.toLowerCase().includes(needle) ||
        thread.otherName?.toLowerCase().includes(needle) ||
        thread.otherHandle?.toLowerCase().includes(needle) ||
        thread.lastMessageBody?.toLowerCase().includes(needle),
    )
  }

  return list
}

export function useMessengerThreads() {
  const filter = useMessengerUiStore((s) => s.filter)
  const searchQuery = useMessengerUiStore((s) => s.searchQuery)

  const bucket = filter === 'requests' ? 'requests' : undefined

  const query = useQuery({
    queryKey: [...messengerThreadsQueryKey, bucket],
    queryFn: () => messengerApi.listThreads({ bucket }),
    staleTime: 15_000,
  })

  const allThreadsQuery = useQuery({
    queryKey: [...messengerThreadsQueryKey, 'all'],
    queryFn: () => messengerApi.listThreads({ includeArchived: true }),
    staleTime: 15_000,
    enabled: filter === 'unread' || filter === 'groups' || filter === 'communities' || filter === 'all',
  })

  const source = filter === 'requests' ? query.data : allThreadsQuery.data ?? query.data

  const filteredThreads = useMemo(
    () => filterThreads(source ?? [], filter, searchQuery),
    [filter, searchQuery, source],
  )

  const requestCount = useMemo(
    () => (allThreadsQuery.data ?? []).filter((t) => t.isPendingRequest).length,
    [allThreadsQuery.data],
  )

  return {
    ...query,
    threads: filteredThreads,
    requestCount,
    isLoading: query.isLoading || allThreadsQuery.isLoading,
  }
}

export function useMessengerUnread() {
  const query = useQuery({
    queryKey: messengerUnreadQueryKey,
    queryFn: messengerApi.getUnreadCount,
    staleTime: 20_000,
  })
  return query
}

export function upsertThreadInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  thread: DmThreadSummary,
) {
  const keys = [
    messengerThreadsQueryKey,
    [...messengerThreadsQueryKey, 'inbox'],
    [...messengerThreadsQueryKey, 'requests'],
    [...messengerThreadsQueryKey, 'all'],
  ]

  for (const key of keys) {
    queryClient.setQueryData<DmThreadSummary[]>(key, (current) => {
      const list = current ?? []
      const without = list.filter((entry) => entry.threadId !== thread.threadId)
      return [thread, ...without].sort((a, b) => {
        const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
        const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
        return bTime - aTime
      })
    })
  }
}
