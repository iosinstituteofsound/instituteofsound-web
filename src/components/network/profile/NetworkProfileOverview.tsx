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

      <header className="member-profile-wire-head">
        <div>
          <p className="member-profile-kicker">On the wire</p>
          <h2 className="member-profile-wire-title">Recent transmissions</h2>
        </div>
        {posts.length > PREVIEW_COUNT && (
          <button type="button" className="member-profile-wire-more" onClick={onViewAllPosts}>
            Archive ({profile.postCount}) →
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
        <p className="member-profile-wire-empty-hint">
          Your first spin or drop goes live here.{' '}
          <Link to="/feed">Tune the full wire</Link>.
        </p>
      )}
    </div>
  )
}
