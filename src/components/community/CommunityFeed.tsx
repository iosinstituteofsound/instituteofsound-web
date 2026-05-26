import { useCommunityFeed } from '@/hooks/useCommunityFeed'
import { CommunityFeedComposer } from '@/components/community/CommunityFeedComposer'
import { CommunityFeedCard } from '@/components/community/CommunityFeedCard'

interface CommunityFeedProps {
  highlightUserId?: string
}

export function CommunityFeed({ highlightUserId }: CommunityFeedProps) {
  const { posts, loading, refresh } = useCommunityFeed(30)

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

      <CommunityFeedComposer onPosted={() => void refresh()} />

      <div className="community-feed-list mt-8">
        {loading && posts.length === 0 && (
          <p className="text-sm text-muted text-center py-8">Loading feed…</p>
        )}
        {!loading && posts.length === 0 && (
          <div className="community-feed-empty ios-card">
            <p className="font-display font-bold">Silence on the wire</p>
            <p className="text-sm text-muted mt-2">
              Be the first to spin a track or drop a transmission this week.
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
