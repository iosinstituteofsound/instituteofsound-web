import { Link } from 'react-router-dom'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { CommunityFeedCard } from '@/components/community/CommunityFeedCard'

interface MemberProfileFeedProps {
  posts: CommunityFeedPost[]
  isYou: boolean
  handle: string
  onRefresh?: () => void
}

export function MemberProfileFeed({ posts, isYou, handle, onRefresh }: MemberProfileFeedProps) {
  if (posts.length === 0) {
    return (
      <div className="member-profile-feed-empty">
        <div className="member-profile-feed-empty-icon" aria-hidden>
          ◎
        </div>
        <p className="member-profile-feed-empty-title">No transmissions yet</p>
        <p className="member-profile-feed-empty-text">
          @{handle} hasn&apos;t dropped a spin or signal on the wire.
        </p>
        {isYou && (
          <Link to="/community#feed" className="member-profile-btn member-profile-btn-primary mt-6">
            Broadcast your first spin →
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="member-profile-feed" role="feed" aria-label="Profile post feed">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="member-profile-feed-item"
          style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
        >
          <CommunityFeedCard
            post={post}
            isYou={isYou}
            linkProfile={false}
            variant="profile"
            onHidden={onRefresh}
            onReactionChange={onRefresh}
          />
        </div>
      ))}
    </div>
  )
}
