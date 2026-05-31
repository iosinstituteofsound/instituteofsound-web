import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import { NetworkTransmissionFeed } from '@/components/network/NetworkTransmissionFeed'
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
          <p className="member-profile-kicker">Archive</p>
          <h2 className="member-profile-wire-title">On the wire</h2>
        </div>
        {posts.length > PREVIEW_COUNT && (
          <button type="button" className="member-profile-wire-more" onClick={onViewAllPosts}>
            All ({profile.postCount})
          </button>
        )}
      </header>

      <NetworkTransmissionFeed
        posts={preview}
        isYou={isYou}
        handle={handle}
        onRefresh={onRefresh}
      />

      {posts.length === 0 && isYou && (
        <p className="member-profile-wire-empty-hint">
          Broadcast from the deck above — your transmissions archive here.{' '}
          <Link to="/feed">Full wire</Link>
        </p>
      )}
    </div>
  )
}
