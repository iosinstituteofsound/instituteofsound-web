import { useCallback, useEffect, useState } from 'react'
import { fetchCollabBoard } from '@/lib/collab/service'
import type { CollabBoardFilters, CollabBoardPost } from '@/lib/collab/types'

export function useCollabBoard(filters: CollabBoardFilters) {
  const [posts, setPosts] = useState<CollabBoardPost[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setPosts(await fetchCollabBoard(filters))
    } finally {
      setLoading(false)
    }
  }, [filters.kind, filters.city, filters.genreSlug, filters.skill])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { posts, loading, refresh }
}
