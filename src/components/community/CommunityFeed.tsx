import { useState } from 'react'
import { useCommunityFeed } from '@/hooks/useCommunityFeed'
import { CommunityFeedComposer } from '@/components/community/CommunityFeedComposer'
import { CommunityFeedCard } from '@/components/community/CommunityFeedCard'
import { CommunityFeedFilters } from '@/components/community/CommunityFeedFilters'
import type { CommunityFeedFilter } from '@/lib/community/feedFilters'

interface CommunityFeedProps {
  highlightUserId?: string
  tribeSlug?: string | null
}

export function CommunityFeed({ highlightUserId, tribeSlug }: CommunityFeedProps) {
  const [filter, setFilter] = useState<CommunityFeedFilter>('all')
  const { posts, loading, refresh } = useCommunityFeed(30, filter, tribeSlug)

  return (
    <section id="feed" className="community-feed-section" aria-labelledby="network-feed-heading">
      <div className="mb-6">
        <h2 id="network-feed-heading" className="font-display text-2xl font-bold">
          Network feed
        </h2>
        <p className="text-sm text-muted mt-1">
          Spins share music · Drops are short underground transmissions
        </p>
      </div>

      <CommunityFeedFilters
        value={filter}
        onChange={setFilter}
        tribeSlug={tribeSlug}
      />

      <CommunityFeedComposer onPosted={() => void refresh()} />

      <div className="community-feed-list mt-8">
        {loading && posts.length === 0 && (
          <p className="text-sm text-muted text-center py-8">Loading feed…</p>
        )}
        {!loading && posts.length === 0 && (
          <div className="community-feed-empty ios-card">
            <p className="font-display font-bold">Silence on the wire</p>
            <p className="text-sm text-muted mt-2">
              {filter === 'tribe'
                ? 'No spins or drops from your tribe yet — be the first on the wire.'
                : filter === 'spin'
                  ? 'No spins in this view yet. Share a track from the composer above.'
                  : filter === 'drop'
                    ? 'No drops yet. Post a short underground transmission.'
                    : 'Be the first to spin a track or drop a transmission this week.'}
            </p>
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
      </div>
    </section>
  )
}
