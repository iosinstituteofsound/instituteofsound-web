import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCommunityFeed } from '@/hooks/useCommunityFeed'
import { CommunityFeedComposer } from '@/components/community/CommunityFeedComposer'
import { CommunityFeedCard } from '@/components/community/CommunityFeedCard'
import { CommunityFeedCardSkeleton } from '@/components/community/CommunityFeedCardSkeleton'
import { CommunityFeedFilters } from '@/components/community/CommunityFeedFilters'
import type { CommunityFeedFilter } from '@/lib/community/feedFilters'

interface CommunityFeedProps {
  highlightUserId?: string
  tribeSlug?: string | null
  defaultFilter?: CommunityFeedFilter
  /** Hide the built-in heading when the page already provides one. */
  hideHeading?: boolean
}

export function CommunityFeed({
  highlightUserId,
  tribeSlug,
  defaultFilter = 'all',
  hideHeading = false,
}: CommunityFeedProps) {
  const { user } = useAuth()
  const [filter, setFilter] = useState<CommunityFeedFilter>(defaultFilter)
  const { posts, loading, loadingMore, hasMore, refresh, loadMore } = useCommunityFeed(
    30,
    filter,
    tribeSlug
  )
  const listRef = useRef<HTMLDivElement>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el || !hasMore || loading || loadingMore) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadMore()
      },
      { rootMargin: '240px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loading, loadingMore, loadMore, posts.length])

  const scrollToNewestPost = useCallback(() => {
    requestAnimationFrame(() => {
      const first = listRef.current?.querySelector('.community-feed-card')
      first?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }, [])

  const onPosted = useCallback(async () => {
    await refresh()
    scrollToNewestPost()
  }, [refresh, scrollToNewestPost])

  return (
    <section id="feed" className="community-feed-section" aria-labelledby="network-feed-heading">
      {!hideHeading && (
        <div className="mb-6">
          <h2 id="network-feed-heading" className="font-display text-2xl font-bold">
            Network feed
          </h2>
          <p className="text-sm text-muted mt-1">
            Spins share music · Drops are short underground transmissions
          </p>
        </div>
      )}

      <div className="community-feed-sticky-tools">
        <CommunityFeedFilters
          value={filter}
          onChange={setFilter}
          tribeSlug={tribeSlug}
          isLoggedIn={Boolean(user)}
        />
        <CommunityFeedComposer onPosted={onPosted} />
      </div>

      <div ref={listRef} className="community-feed-list">
        {loading && posts.length === 0 && (
          <>
            <CommunityFeedCardSkeleton />
            <CommunityFeedCardSkeleton />
            <CommunityFeedCardSkeleton />
          </>
        )}
        {!loading && posts.length === 0 && (
          <div className="community-feed-empty ios-card">
            <p className="font-display font-bold">Silence on the wire</p>
            <p className="text-sm text-muted mt-2">
              {filter === 'following'
                ? 'Your wire is quiet — follow operators on their profiles, or see everything on All.'
                : filter === 'tribe'
                  ? 'No spins or drops from your tribe yet — be the first on the wire.'
                  : filter === 'spin'
                    ? 'No spins in this view yet. Share a track from the composer above.'
                    : filter === 'drop'
                      ? 'No drops yet. Post a short transmission or paste a link.'
                      : 'Be the first to spin a track, drop a transmission, or share a link.'}
            </p>
            {filter === 'following' && (
              <button
                type="button"
                className="ios-btn ios-btn-metal mt-4"
                onClick={() => setFilter('all')}
              >
                View all posts
              </button>
            )}
          </div>
        )}
        {posts.map((post) => (
          <CommunityFeedCard
            key={post.id}
            post={post}
            isYou={highlightUserId === post.userId}
            onHidden={() => void refresh()}
            onReactionChange={() => void refresh()}
          />
        ))}
        {hasMore && posts.length > 0 && (
          <div ref={loadMoreRef} className="community-feed-load-more">
            <button
              type="button"
              className="ios-btn ios-btn-metal w-full"
              disabled={loadingMore}
              onClick={() => void loadMore()}
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
