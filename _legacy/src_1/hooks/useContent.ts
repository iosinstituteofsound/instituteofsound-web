import { useEffect, useState } from 'react'

interface UseContentState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useContent<T>(fetcher: () => Promise<T>): UseContentState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [fetcher])

  return { data, loading, error }
}
