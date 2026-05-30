import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import type { EarnedBadge } from '@/lib/community/service'
import { RankBadge } from '@/components/ui/RankBadge'
import { MedalIllustration } from '@/components/community/medals/MedalIllustration'
import { MemberProfileFeed } from '@/components/community/member/MemberProfileFeed'
import { NetworkProfileComposerStrip } from '@/components/network/profile/NetworkProfileComposerStrip'
interface NetworkProfileOverviewProps {
  profile: PublicMemberProfile
  posts: CommunityFeedPost[]
  badges: EarnedBadge[]
  isYou: boolean
  onRefresh: () => void | Promise<void>
  onViewAllPosts: () => void
  onViewAbout: () => void
}

const PREVIEW_COUNT = 5

export function NetworkProfileOverview({
  profile,
  posts,
  badges,
  isYou,
  onRefresh,
  onViewAllPosts,
  onViewAbout,
}: NetworkProfileOverviewProps) {
  const handle = profile.handle.replace(/^@/, '')
  const preview = posts.slice(0, PREVIEW_COUNT)
  const memberSince = new Date(profile.memberSince).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="network-profile-overview">
      <aside className="network-profile-overview-aside">
        <section className="network-rail-card">
          <h2 className="network-rail-title">About</h2>
          {profile.bio ? (
            <p className="network-profile-about-bio">{profile.bio}</p>
          ) : (
            <p className="text-sm text-muted">No bio yet.</p>
          )}
          <dl className="network-profile-meta-list">
            <div>
              <dt>Member since</dt>
              <dd>{memberSince}</dd>
            </div>
            {profile.primaryGenreSlug && (
              <div>
                <dt>Scene</dt>
                <dd className="capitalize">{profile.primaryGenreSlug.replace(/-/g, ' ')}</dd>
              </div>
            )}
            <div>
              <dt>Rank</dt>
              <dd className="flex items-center gap-2 mt-1">
                <RankBadge rank={profile.rank} size="sm" />
              </dd>
            </div>
          </dl>
          <button type="button" className="network-rail-cta mt-3" onClick={onViewAbout}>
            Full profile →
          </button>
        </section>

        {badges.length > 0 && (
          <section className="network-rail-card">
            <h2 className="network-rail-title">Badges</h2>
            <ul className="network-profile-badge-list">
              {badges.slice(0, 6).map((b) => (
                <li key={b.slug} title={b.description}>
                  <MedalIllustration slug={b.slug} size={44} />
                  <span className="network-profile-badge-name">{b.name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      <div className="network-profile-overview-main">
        <NetworkProfileComposerStrip isYou={isYou} onPosted={onRefresh} />

        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-lg font-bold uppercase">Recent posts</h2>
          {posts.length > PREVIEW_COUNT && (
            <button type="button" className="network-rail-cta" onClick={onViewAllPosts}>
              View all ({profile.postCount}) →
            </button>
          )}
        </div>

        <MemberProfileFeed
          posts={preview}
          isYou={isYou}
          handle={handle}
          onRefresh={onRefresh}
        />

        {posts.length === 0 && isYou && (
          <p className="text-sm text-muted mt-4">
            Share a spin or drop from the composer above, or{' '}
            <Link to="/feed" className="text-mh-red hover:underline">
              open the feed
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}
