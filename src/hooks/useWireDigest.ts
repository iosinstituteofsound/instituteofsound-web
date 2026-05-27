import { useCallback, useEffect, useState } from 'react'
import { fetchWireDigest, type WireDigest } from '@/lib/community/wireEvents'

export function useWireDigest() {
  const [digest, setDigest] = useState<WireDigest | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setDigest(await fetchWireDigest())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { digest, loading, refresh }
}
