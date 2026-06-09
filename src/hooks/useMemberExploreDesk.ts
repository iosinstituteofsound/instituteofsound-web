import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCommunityLeaderboard } from '@/hooks/useCommunity'
import { fetchCommunityFeed } from '@/lib/community/feedService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import {
  editorialPickFromCover,
  editorialPickFromDraft,
  genreBarsFromFeed,
  mergeRecentEntries,
  nowPlayingFromTrending,
  recentFromPremieres,
  trendingFromLeaderboard,
  trendingFromPremieres,
  type ExploreEditorialPick,
  type ExploreTrendingRow,
} from '@/lib/dashboard/exploreDesk'
import { readExploreRecent } from '@/lib/dashboard/exploreRecentStorage'
import type { ExploreRecentEntry } from '@/lib/dashboard/exploreRecentStorage'
import { fetchDiscoverPremiereFeed } from '@/lib/discovery/premieres'
import { getHomepageCoverStory, listPublishedEditorials } from '@/lib/editorial/published'

export function useMemberExploreDesk() {
  const { user } = useAuth()
  const { entries: leaderboard, loading: leaderboardLoading } = useCommunityLeaderboard(8)

  const [premieres, setPremieres] = useState<Awaited<ReturnType<typeof fetchDiscoverPremiereFeed>>>([])
  const [feedPosts, setFeedPosts] = useState<CommunityFeedPost[]>([])
  const [editorial, setEditorial] = useState<ExploreEditorialPick | null>(null)
  const [storedRecent, setStoredRecent] = useState<ExploreRecentEntry[]>(() =>
    readExploreRecent(user?.id),
  )
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [cards, posts, cover, published] = await Promise.all([
        fetchDiscoverPremiereFeed(12),
        fetchCommunityFeed({ limit: 40, viewerUserId: user?.id }),
        getHomepageCoverStory(),
        listPublishedEditorials(),
      ])
      setPremieres(cards)
      setFeedPosts(posts)

      const pick =
        editorialPickFromCover(cover) ??
        (published[0]
          ? editorialPickFromDraft({
              title: published[0].title,
              body: published[0].body,
              slug: published[0].slug ?? published[0].title,
              coverImageUrl: published[0].coverImageUrl,
            })
          : null)
      setEditorial(pick)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    setStoredRecent(readExploreRecent(user?.id))
  }, [user?.id])

  const recent = useMemo(
    () => mergeRecentEntries(storedRecent, recentFromPremieres(premieres)),
    [storedRecent, premieres],
  )

  const trending = useMemo((): ExploreTrendingRow[] => {
    const fromPremieres = trendingFromPremieres(premieres)
    if (fromPremieres.length > 0) return fromPremieres
    return trendingFromLeaderboard(leaderboard)
  }, [premieres, leaderboard])

  const genres = useMemo(() => genreBarsFromFeed(feedPosts), [feedPosts])

  const nowPlaying = useMemo(() => nowPlayingFromTrending(trending), [trending])

  const reloadRecent = useCallback(() => {
    setStoredRecent(readExploreRecent(user?.id))
  }, [user?.id])

  return {
    user,
    recent,
    trending,
    editorial,
    genres,
    nowPlaying,
    loading: loading || leaderboardLoading,
    reloadRecent,
    refresh,
  }
}
