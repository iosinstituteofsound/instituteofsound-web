import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { messengerThreadsQueryKey, messengerUnreadQueryKey } from '@/modules/messenger/lib/messenger-cache'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmThreadSummary, MessengerFilter } from '@/modules/messenger/types/messenger.types'

export {
  getMessengerThreadListQueryKeys,
  messengerThreadsQueryKey,
  messengerUnreadQueryKey,
  upsertThreadInCache,
} from '@/modules/messenger/lib/messenger-cache'

function filterThreads(threads: DmThreadSummary[], filter: MessengerFilter, search: string) {
  let list = threads
  const needle = search.trim().toLowerCase()

  if (filter === 'unread') {
    list = list.filter((thread) => thread.unreadCount > 0)
  } else if (filter === 'groups') {
    list = list.filter((thread) => thread.kind === 'group' || thread.isGroup)
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
