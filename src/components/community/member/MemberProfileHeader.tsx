import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { EarnedBadge } from '@/lib/community/service'
import { RankBadge } from '@/components/ui/RankBadge'
import { IOSImage } from '@/components/ui/IOSImage'
import { MedalIllustration } from '@/components/community/medals/MedalIllustration'
import { badgeDefBySlug } from '@/lib/community/badges'
import { IdentityCrossLinks } from '@/components/community/IdentityCrossLinks'
import { FollowButton } from '@/components/community/FollowButton'
import { MemberCollabSkills } from '@/components/collab/MemberCollabSkills'

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

interface MemberProfileHeaderProps {
  profile: PublicMemberProfile
  accountId: string
  isYou: boolean
  dashboardHref?: string
  badges: EarnedBadge[]
  artistSlug?: string | null
}

export function MemberProfileHeader({
  profile,
  accountId,
  isYou,
  dashboardHref,
  badges,
  artistSlug,
}: MemberProfileHeaderProps) {
  return (
    <header className="member-profile-hero">
      <div className="member-profile-hero-glow" aria-hidden />
      <div className="member-profile-hero-scan" aria-hidden />

      <div className="member-profile-hero-row">
        <div className="member-profile-avatar-ring">
          <div className="member-profile-avatar">
            {profile.avatarUrl ? (
              <IOSImage
                src={profile.avatarUrl}
                alt=""
                width={112}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="member-profile-avatar-fallback" aria-hidden>
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <ul className="member-profile-stat-bar" aria-label="Profile stats">
          <li>
            <strong>{profile.postCount}</strong>
            <span>Posts</span>
          </li>
          <li>
            <strong>{profile.followerCount.toLocaleString()}</strong>
            <span>Followers</span>
          </li>
          <li>
            <strong>{profile.followingCount.toLocaleString()}</strong>
            <span>Following</span>
          </li>
          <li>
            <strong>{profile.totalDb.toLocaleString()}</strong>
            <span>dB</span>
          </li>
        </ul>
      </div>

      <div className="member-profile-identity">
        <p className="member-profile-kicker">
          Network operator
          {isYou && <span className="member-profile-you-tag">· you</span>}
        </p>
        <h1 className="member-profile-name">{profile.displayName}</h1>
        <p className="member-profile-handle">{profile.handle}</p>
        <p className="member-profile-account-id">ACCOUNT ID {accountId}</p>
      </div>

      <div className="member-profile-chips">
        <RankBadge rank={profile.rank} size="md" />
        {profile.primaryGenreSlug && (
          <span className="member-profile-tribe">{formatGenre(profile.primaryGenreSlug)}</span>
        )}
        <span className="member-profile-since">
          Since {new Date(profile.memberSince).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
        </span>
      </div>

      {profile.bio && <p className="member-profile-bio">{profile.bio}</p>}

      <MemberCollabSkills handle={profile.handle} userId={profile.userId} />

      <IdentityCrossLinks
        artistSlug={artistSlug}
        networkHandle={profile.handle}
        className="mt-3"
        compact
      />

      {badges.length > 0 && (
        <ul className="member-profile-badge-strip" aria-label="Badges">
          {badges.slice(0, 6).map((b) => (
            <li key={b.slug} title={b.description} className="member-profile-badge-chip">
              <MedalIllustration slug={b.slug} size={28} />
              <span>{badgeDefBySlug(b.slug)?.name ?? b.name}</span>
            </li>
          ))}
          {badges.length > 6 && (
            <li className="member-profile-badge-more">+{badges.length - 6}</li>
          )}
        </ul>
      )}

      <div className="member-profile-actions">
        {isYou ? (
          <Link to="/community#feed" className="member-profile-btn member-profile-btn-primary">
            New transmission
          </Link>
        ) : (
          <>
            <FollowButton
              targetUserId={profile.userId}
              initialFollowing={profile.viewerIsFollowing}
            />
            <Link to="/community#feed" className="member-profile-btn member-profile-btn-ghost">
              Explore network
            </Link>
          </>
        )}
        <button
          type="button"
          className="member-profile-btn member-profile-btn-ghost member-profile-btn-share"
          onClick={() => void navigator.clipboard?.writeText(window.location.href)}
        >
          Copy link
        </button>
      </div>

      {/* Desk link — secondary, tucked below actions so profile context stays primary */}
      {isYou && dashboardHref && (
        <p className="member-profile-desk-link">
          <Link to={dashboardHref}>
            ↗ Open {dashboardHref.includes('editor') ? 'editorial desk' : 'studio'}
          </Link>
        </p>
      )}
    </header>
  )
}
