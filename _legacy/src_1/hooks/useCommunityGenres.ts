import { useEffect, useState } from 'react'
import { fetchCommunityGenres, type CommunityGenre } from '@/lib/community/service'

export function useCommunityGenres() {
  const [genres, setGenres] = useState<CommunityGenre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchCommunityGenres()
      .then((g) => {
        if (!cancelled) setGenres(g)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { genres, loading }
}
