import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { searchEditorialPickCandidates } from '@/modules/explore/api/explore.api'

function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}

export function useEditorialPickSearch(query: string, enabled: boolean) {
  const debouncedQuery = useDebouncedValue(query, 300)
  const trimmed = debouncedQuery.trim()

  return useQuery({
    queryKey: ['editorial-pick-search', trimmed],
    queryFn: () => searchEditorialPickCandidates(trimmed),
    enabled: enabled && trimmed.length >= 2,
    staleTime: 30_000,
  })
}
