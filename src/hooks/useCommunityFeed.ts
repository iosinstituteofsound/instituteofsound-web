import { useCallback, useEffect, useState } from 'react'
import {
  COMMUNITY_FEED_EVENT,
  fetchCommunityFeed,
  type CommunityFeedPost,
} from '@/lib/community/feedService'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'

export function useCommunityFeed(limit = 30) {
  const [posts, setPosts] = useState<CommunityFeedPost[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setPosts(await fetchCommunityFeed(limit))
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    void refresh()
    const onFeed = () => void refresh()
    window.addEventListener(COMMUNITY_FEED_EVENT, onFeed)
    window.addEventListener(COMMUNITY_DB_EVENT, onFeed)
    return () => {
      window.removeEventListener(COMMUNITY_FEED_EVENT, onFeed)
      window.removeEventListener(COMMUNITY_DB_EVENT, onFeed)
    }
  }, [refresh])

  return { posts, loading, refresh }
}
