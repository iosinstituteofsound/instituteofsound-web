import type { WheelEvent } from 'react'
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
  onViewMutuals?: () => void
  onConnectionChange?: () => void
}

const PREVIEW = 5

/** Keep wheel inside this pane — parent page must not scroll the other columns. */
function keepScrollInPane(e: WheelEvent<HTMLDivElement>) {
  const el = e.currentTarget
  if (el.scrollHeight <= el.clientHeight + 1) return

  const atTop = el.scrollTop <= 0
  const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
  const up = e.deltaY < 0
  const down = e.deltaY > 0

  if ((up && !atTop) || (down && !atBottom)) {
    e.stopPropagation()
  }
}

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
  onViewMutuals,
  onConnectionChange,
}: NetworkProfileOverviewProps) {
  const handle = profile.handle.replace(/^@/, '')
  const preview = posts.slice(0, PREVIEW)

  return (
    <div className="np-three-col" role="group" aria-label="Profile overview columns">
      <div
        className="np-pane np-pane--left"
        onWheel={keepScrollInPane}
        aria-label="About and badges"
      >
        <NetworkProfileLeftColumn
          profile={profile}
          badges={badges}
          onViewAllBadges={onViewAllBadges}
        />
      </div>

      <div
        className="np-pane np-pane--feed"
        onWheel={keepScrollInPane}
        aria-label="Posts and composer"
      >
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

      <div
        className="np-pane np-pane--right"
        onWheel={keepScrollInPane}
        aria-label="Reputation and network"
      >
        <NetworkProfileRightColumn
          profile={profile}
          posts={posts}
          mutuals={mutuals}
          suggested={suggested}
          fandomRecognitions={fandomRecognitions}
          isYou={isYou}
          onViewCrews={onViewCrews}
          onViewMutuals={onViewMutuals}
          onConnectionChange={onConnectionChange}
        />
      </div>
    </div>
  )
}
