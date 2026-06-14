import { useCallback, useEffect, useState } from 'react'
import { fetchSceneHub, type SceneHubData } from '@/lib/discovery/sceneService'

export function useSceneHub(citySlug: string, genreSlug: string) {
  const [data, setData] = useState<SceneHubData | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setData(await fetchSceneHub(citySlug, genreSlug))
    } finally {
      setLoading(false)
    }
  }, [citySlug, genreSlug])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { data, loading, refresh }
}
