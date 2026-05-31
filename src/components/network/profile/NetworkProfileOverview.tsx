import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import type { EarnedBadge } from '@/lib/community/service'
import type { FandomPublicRecognitionRow } from '@/lib/fandom/types'
import type { NetworkPersonCard } from '@/lib/network/connectionTypes'
import { NetworkProfileLeftColumn } from '@/components/network/profile/NetworkProfileLeftColumn'
import { NetworkProfileRightColumn } from '@/components/network/profile/NetworkProfileRightColumn'
import { NetworkProfileComposerBar } from '@/components/network/profile/NetworkProfileComposerBar'
import { CommunityFeedCard } from '@/components/community/CommunityFeedCard'

interface NetworkProfileOverviewProps {
  profile: PublicMemberProfile
  posts: CommunityFeedPost[]
  badges: EarnedBadge[]
  mutuals: NetworkPersonCard[]
  suggested: NetworkPersonCard[]
  fandomRecognitions?: FandomPublicRecognitionRow[]
  isYou: boolean
  onRefresh: () => void | Promise<void>
  onViewAllPosts: () => void
  onViewAllBadges?: () => void
  onViewCrews?: () => void
  onConnectionChange?: () => void
}

const PREVIEW = 5

export function NetworkProfileOverview({
  profile,
  posts,
  badges,
  mutuals,
  suggested,
  fandomRecognitions = [],
  isYou,
  onRefresh,
  onViewAllPosts,
  onViewAllBadges,
  onViewCrews,
  onConnectionChange,
}: NetworkProfileOverviewProps) {
  const handle = profile.handle.replace(/^@/, '')
  const preview = posts.slice(0, PREVIEW)

  return (
    <div className="np-overview">
      <NetworkProfileLeftColumn
        profile={profile}
        badges={badges}
        onViewAllBadges={onViewAllBadges}
      />

      <div className="np-col np-col--center">
        <NetworkProfileComposerBar isYou={isYou} onPosted={onRefresh} />

        {posts.length > PREVIEW && (
          <div className="np-feed-head">
            <h2 className="np-feed-head__title">On your wire</h2>
            <button type="button" className="np-card__link" onClick={onViewAllPosts}>
              See all ({profile.postCount}) →
            </button>
          </div>
        )}

        {preview.length === 0 ? (
          <div className="np-card np-feed-empty">
            <p>@{handle} hasn&apos;t posted on the wire yet.</p>
            {isYou && (
              <Link to="/feed" className="np-btn np-btn--primary np-feed-empty__cta">
                Open wire feed
              </Link>
            )}
          </div>
        ) : (
          <ul className="np-feed">
            {preview.map((post) => (
              <li key={post.id} className="np-feed__item">
                <CommunityFeedCard
                  post={post}
                  isYou={isYou}
                  linkProfile={false}
                  variant="profile"
                  onHidden={onRefresh}
                  onReactionChange={onRefresh}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <NetworkProfileRightColumn
        profile={profile}
        posts={posts}
        mutuals={mutuals}
        suggested={suggested}
        fandomRecognitions={fandomRecognitions}
        isYou={isYou}
        onViewCrews={onViewCrews}
        onConnectionChange={onConnectionChange}
      />
    </div>
  )
}
