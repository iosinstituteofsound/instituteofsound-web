import { useInfiniteQuery } from '@tanstack/react-query'
import { getReleasesPage } from '@/modules/explore/api/explore.api'
import type { ReleasesPageFilter } from '@/modules/explore/types/explore.types'

const PAGE_SIZE = 24

export function useReleasesPage(filter: ReleasesPageFilter, genreSlug: string | null) {
  return useInfiniteQuery({
    queryKey: ['explore', 'releases-page', filter, genreSlug],
    queryFn: ({ pageParam }) =>
      getReleasesPage({
        page: pageParam,
        limit: PAGE_SIZE,
        filter,
        genre: genreSlug ?? undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
    staleTime: 60_000,
  })
}
