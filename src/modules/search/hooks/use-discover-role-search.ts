import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  searchDiscoverableRoles,
  type DiscoverRoleSearchParams,
} from '@/modules/search/api/search.api'

function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

export function useDiscoverRoleSearch(params: DiscoverRoleSearchParams, enabled = true) {
  const debouncedQuery = useDebouncedValue(params.q ?? '', 300)

  return useQuery({
    queryKey: ['search', 'roles', debouncedQuery, params.category ?? 'all', params.limit ?? 24],
    queryFn: () =>
      searchDiscoverableRoles({
        q: debouncedQuery,
        category: params.category,
        limit: params.limit,
      }),
    enabled,
    staleTime: 30_000,
  })
}
