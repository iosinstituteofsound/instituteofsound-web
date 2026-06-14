import { useCallback, useEffect, useRef, useState } from 'react'
import {
  COMMUNITY_FEED_EVENT,
  fetchCommunityFeed,
  type CommunityFeedCursor,
  type CommunityFeedPost,
} from '@/lib/community/feedService'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import { COMMENT_EVENT } from '@/lib/community/commentService'
import { COMMUNITY_FOLLOW_EVENT } from '@/lib/community/followService'
import { useAuth } from '@/context/AuthContext'
import {
  feedFollowingOnly,
  feedGenreParam,
  feedKindParam,
  type CommunityFeedFilter,
} from '@/lib/community/feedFilters'

function feedCursorFromPost(post: CommunityFeedPost): CommunityFeedCursor {
  return { createdAt: post.createdAt, id: post.id }
}

function mergeFeedPosts(
  prev: CommunityFeedPost[],
  next: CommunityFeedPost[]
): CommunityFeedPost[] {
  if (next.length === 0) return prev
  const seen = new Set(prev.map((p) => p.id))
  const added = next.filter((p) => !seen.has(p.id))
  return added.length === 0 ? prev : [...prev, ...added]
}

export function useCommunityFeed(
  pageSize = 30,
  filter: CommunityFeedFilter = 'all',
  tribeSlug?: string | null
) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<CommunityFeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const postsRef = useRef(posts)
  postsRef.current = posts

  const feedQuery = useCallback(
    (cursor?: CommunityFeedCursor | null) => ({
      limit: pageSize,
      kind: feedKindParam(filter),
      genreSlug: feedGenreParam(filter, tribeSlug),
      followingOnly: feedFollowingOnly(filter),
      viewerUserId: user?.id ?? null,
      cursor: cursor ?? null,
    }),
    [pageSize, filter, tribeSlug, user?.id]
  )

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const page = await fetchCommunityFeed(feedQuery())
      setPosts(page)
      setHasMore(page.length >= pageSize)
    } finally {
      setLoading(false)
    }
  }, [feedQuery, pageSize])

  const loadMore = useCallback(async () => {
    const current = postsRef.current
    if (current.length === 0 || loadingMore) return
    setLoadingMore(true)
    try {
      const cursor = feedCursorFromPost(current[current.length - 1]!)
      const page = await fetchCommunityFeed(feedQuery(cursor))
      setPosts((prev) => mergeFeedPosts(prev, page))
      setHasMore(page.length >= pageSize)
    } finally {
      setLoadingMore(false)
    }
  }, [feedQuery, loadingMore, pageSize])

  useEffect(() => {
    void refresh()
    const onFeed = () => void refresh()
    window.addEventListener(COMMUNITY_FEED_EVENT, onFeed)
    window.addEventListener(COMMUNITY_DB_EVENT, onFeed)
    window.addEventListener(COMMUNITY_FOLLOW_EVENT, onFeed)
    window.addEventListener(COMMENT_EVENT, onFeed)
    return () => {
      window.removeEventListener(COMMUNITY_FEED_EVENT, onFeed)
      window.removeEventListener(COMMUNITY_DB_EVENT, onFeed)
      window.removeEventListener(COMMUNITY_FOLLOW_EVENT, onFeed)
      window.removeEventListener(COMMENT_EVENT, onFeed)
    }
  }, [refresh])

  return { posts, loading, loadingMore, hasMore, refresh, loadMore }
}
