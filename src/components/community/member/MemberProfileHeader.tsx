import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { EarnedBadge } from '@/lib/community/service'
import type { PublicSupporterBadgeOnArtist } from '@/lib/fandom/types'
import { FandomSupporterBadgesList } from '@/components/fandom/FandomSupporterBadges'
import { RankBadge } from '@/components/ui/RankBadge'
import { IOSImage } from '@/components/ui/IOSImage'
import { MedalIllustration } from '@/components/community/medals/MedalIllustration'
import { badgeDefBySlug } from '@/lib/community/badges'
import { IdentityCrossLinks } from '@/components/community/IdentityCrossLinks'
import { FollowButton } from '@/components/community/FollowButton'
import { MessageButton } from '@/components/community/MessageButton'
import { ConnectButton } from '@/components/network/ConnectButton'
import { MemberCollabSkills } from '@/components/collab/MemberCollabSkills'
import { formatNetworkCount } from '@/lib/network/noiseScore'

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
  fandomBadges?: PublicSupporterBadgeOnArtist[]
  artistSlug?: string | null
  pendingRequestId?: string | null
  onEditProfile?: () => void
  onOpenFollowers?: () => void
  onOpenFollowing?: () => void
  onOpenConnections?: () => void
  onConnectionChange?: () => void
}

export function MemberProfileHeader({
  profile,
  accountId,
  isYou,
  dashboardHref,
  badges,
  fandomBadges = [],
  artistSlug,
  pendingRequestId,
  onEditProfile,
  onOpenFollowers,
  onOpenFollowing,
  onOpenConnections,
  onConnectionChange,
}: MemberProfileHeaderProps) {
  const isNetwork = Boolean(onOpenConnections)

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
          {isNetwork ? (
            <li>
              <button type="button" className="member-profile-stat-btn" onClick={onOpenConnections}>
                <strong>{formatNetworkCount(profile.connectionCount)}</strong>
                <span>Links</span>
              </button>
            </li>
          ) : (
            <li>
              <strong>{profile.postCount}</strong>
              <span>Posts</span>
            </li>
          )}
          <li>
            <button type="button" className="member-profile-stat-btn" onClick={onOpenFollowers}>
              <strong>{formatNetworkCount(profile.followerCount)}</strong>
              <span>Followers</span>
            </button>
          </li>
          <li>
            <button type="button" className="member-profile-stat-btn" onClick={onOpenFollowing}>
              <strong>{formatNetworkCount(profile.followingCount)}</strong>
              <span>Following</span>
            </button>
          </li>
          <li>
            <strong>{profile.totalDb.toLocaleString()}</strong>
            <span>dB</span>
          </li>
        </ul>
      </div>

      <div className="member-profile-identity">
        <p className="member-profile-kicker">
          {isNetwork ? 'On the wire' : 'Network operator'}
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

      {fandomBadges.length > 0 && (
        <FandomSupporterBadgesList badges={fandomBadges} className="member-profile-fandom-strip" />
      )}

      <div className="member-profile-actions">
        {isYou ? (
          <>
            <Link to="/feed" className="member-profile-btn member-profile-btn-primary">
              Broadcast
            </Link>
            <button
              type="button"
              className="member-profile-btn member-profile-btn-ghost"
              onClick={() => onEditProfile?.()}
            >
              Edit profile
            </button>
          </>
        ) : (
          <>
            {isNetwork && onConnectionChange && (
              <ConnectButton
                targetUserId={profile.userId}
                status={profile.viewerConnectionStatus}
                pendingRequestId={pendingRequestId ?? undefined}
                onStatusChange={onConnectionChange}
                className="member-profile-btn member-profile-btn-primary network-connect-btn"
              />
            )}
            <FollowButton
              targetUserId={profile.userId}
              initialFollowing={profile.viewerIsFollowing}
            />
            <MessageButton targetUserId={profile.userId} />
            <Link to="/feed" className="member-profile-btn member-profile-btn-ghost">
              Wire feed
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
