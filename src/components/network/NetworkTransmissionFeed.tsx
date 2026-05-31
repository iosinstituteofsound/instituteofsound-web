import { Link } from 'react-router-dom'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { CommunityFeedCard } from '@/components/community/CommunityFeedCard'

interface NetworkTransmissionFeedProps {
  posts: CommunityFeedPost[]
  isYou: boolean
  handle: string
  onRefresh?: () => void
}

export function NetworkTransmissionFeed({
  posts,
  isYou,
  handle,
  onRefresh,
}: NetworkTransmissionFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="net-transmissions-empty">
        <span className="net-transmissions-empty__mark" aria-hidden>
          ◎
        </span>
        <p className="net-transmissions-empty__title">Wire is quiet</p>
        <p className="net-transmissions-empty__text">
          @{handle} hasn&apos;t broadcast a spin or drop yet.
        </p>
        {isYou && (
          <Link to="/feed" className="net-dossier__btn net-dossier__btn--primary net-transmissions-empty__cta">
            First broadcast →
          </Link>
        )}
      </div>
    )
  }

  return (
    <ol className="net-transmissions" aria-label="Transmissions on the wire">
      {posts.map((post, index) => (
        <li key={post.id} className="net-transmission">
          <div className="net-transmission__rail" aria-hidden>
            <span className="net-transmission__idx">{String(index + 1).padStart(2, '0')}</span>
            <span className="net-transmission__line" />
          </div>
          <div className="net-transmission__card">
            <CommunityFeedCard
              post={post}
              isYou={isYou}
              linkProfile={false}
              variant="profile"
              onHidden={onRefresh}
              onReactionChange={onRefresh}
            />
          </div>
        </li>
      ))}
    </ol>
  )
}
