import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { messengerThreadsQueryKey, messengerUnreadQueryKey } from '@/modules/messenger/lib/messenger-cache'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import { filterThreads } from '@/modules/messenger/utils/filter-threads'

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
