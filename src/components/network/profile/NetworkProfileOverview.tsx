import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { MemberProfileFeed } from '@/components/community/member/MemberProfileFeed'
import { NetworkProfileComposerStrip } from '@/components/network/profile/NetworkProfileComposerStrip'

interface NetworkProfileOverviewProps {
  profile: PublicMemberProfile
  posts: CommunityFeedPost[]
  isYou: boolean
  onRefresh: () => void | Promise<void>
  onViewAllPosts: () => void
}

const PREVIEW_COUNT = 5

export function NetworkProfileOverview({
  profile,
  posts,
  isYou,
  onRefresh,
  onViewAllPosts,
}: NetworkProfileOverviewProps) {
  const handle = profile.handle.replace(/^@/, '')
  const preview = posts.slice(0, PREVIEW_COUNT)

  return (
    <div className="network-profile-overview">
      <NetworkProfileComposerStrip isYou={isYou} onPosted={onRefresh} />

      <header className="network-profile-feed-head">
        <div>
          <p className="network-profile-feed-kicker">Timeline</p>
          <h2 className="network-profile-feed-title">Recent transmissions</h2>
        </div>
        {posts.length > PREVIEW_COUNT && (
          <button type="button" className="network-rail-cta" onClick={onViewAllPosts}>
            All posts ({profile.postCount}) →
          </button>
        )}
      </header>

      <MemberProfileFeed
        posts={preview}
        isYou={isYou}
        handle={handle}
        onRefresh={onRefresh}
      />

      {posts.length === 0 && isYou && (
        <p className="network-profile-feed-hint">
          Share a spin or drop from the composer above, or{' '}
          <Link to="/feed">open the full feed</Link>.
        </p>
      )}
    </div>
  )
}
