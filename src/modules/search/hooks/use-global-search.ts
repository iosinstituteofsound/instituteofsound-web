import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  searchDiscoverableRoles,
  searchProfiles,
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

export function useGlobalSearch(params: DiscoverRoleSearchParams, enabled = true) {
  const debouncedQuery = useDebouncedValue(params.q ?? '', 300)
  const trimmedQuery = debouncedQuery.trim()
  const category = params.category ?? 'all'
  const shouldSearchUsers = trimmedQuery.length > 0 && (category === 'all' || category === 'profiles')
  const shouldSearchRoles = category !== 'profiles'

  const rolesQuery = useQuery({
    queryKey: ['search', 'roles', trimmedQuery, category, params.limit ?? 24],
    queryFn: () =>
      searchDiscoverableRoles({
        q: trimmedQuery,
        category,
        limit: params.limit,
      }),
    enabled: enabled && shouldSearchRoles,
    staleTime: 30_000,
  })

  const usersQuery = useQuery({
    queryKey: ['search', 'users', trimmedQuery, params.limit ?? 24],
    queryFn: () => searchProfiles(trimmedQuery, params.limit),
    enabled: enabled && shouldSearchUsers,
    staleTime: 30_000,
  })

  return {
    roles: rolesQuery.data,
    users: usersQuery.data,
    isLoading: rolesQuery.isLoading || usersQuery.isLoading,
    isFetching: rolesQuery.isFetching || usersQuery.isFetching,
  }
}
