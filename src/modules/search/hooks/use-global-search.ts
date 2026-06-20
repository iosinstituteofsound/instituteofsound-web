import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  searchDiscoverableRoles,
  searchMusic,
  searchProfiles,
  type DiscoverRoleSearchParams,
  type MusicSearchCategory,
} from '@/modules/search/api/search.api'

function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

function musicCategoryFromFilter(category: DiscoverRoleSearchParams['category']): MusicSearchCategory {
  if (category === 'releases') return 'releases'
  if (category === 'playlists') return 'playlists'
  return 'all'
}

export function useGlobalSearch(params: DiscoverRoleSearchParams, enabled = true) {
  const debouncedQuery = useDebouncedValue(params.q ?? '', 300)
  const trimmedQuery = debouncedQuery.trim()
  const category = params.category ?? 'all'
  const isMusicOnly = category === 'releases' || category === 'playlists'
  const shouldSearchUsers = trimmedQuery.length > 0 && (category === 'all' || category === 'profiles')
  const shouldSearchRoles = trimmedQuery.length > 0 && category !== 'profiles' && !isMusicOnly
  const shouldSearchMusic =
    trimmedQuery.length > 0 && (category === 'all' || category === 'releases' || category === 'playlists')

  const rolesQuery = useQuery({
    queryKey: ['search', 'roles', trimmedQuery, category, params.limit ?? 24],
    queryFn: () =>
      searchDiscoverableRoles({
        q: trimmedQuery,
        category: isMusicOnly ? 'all' : category,
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

  const musicQuery = useQuery({
    queryKey: ['search', 'music', trimmedQuery, category, params.limit ?? 24],
    queryFn: () =>
      searchMusic(trimmedQuery, {
        limit: params.limit,
        category: musicCategoryFromFilter(category),
      }),
    enabled: enabled && shouldSearchMusic,
    staleTime: 30_000,
  })

  return {
    roles: rolesQuery.data,
    users: usersQuery.data,
    music: musicQuery.data,
    isLoading: rolesQuery.isLoading || usersQuery.isLoading || musicQuery.isLoading,
    isFetching: rolesQuery.isFetching || usersQuery.isFetching || musicQuery.isFetching,
  }
}
