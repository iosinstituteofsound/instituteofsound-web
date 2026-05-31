import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { EarnedBadge } from '@/lib/community/service'
import type { PublicSupporterBadgeOnArtist } from '@/lib/fandom/types'
import { FandomSupporterBadgesList } from '@/components/fandom/FandomSupporterBadges'
import { roleLabel } from '@/lib/auth/roles'
import { formatNetworkCount } from '@/lib/network/noiseScore'
import { IOSImage } from '@/components/ui/IOSImage'
import { FollowButton } from '@/components/community/FollowButton'
import { MessageButton } from '@/components/community/MessageButton'
import { ConnectButton } from '@/components/network/ConnectButton'
import { IdentityCrossLinks } from '@/components/community/IdentityCrossLinks'

const DEFAULT_COVER =
  'linear-gradient(180deg, transparent 0%, rgba(5,5,5,0.92) 85%), url(https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=85)'

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function personaLabel(persona: string) {
  return persona.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface NetworkProfileHeaderProps {
  profile: PublicMemberProfile
  isYou: boolean
  badges: EarnedBadge[]
  fandomBadges?: PublicSupporterBadgeOnArtist[]
  artistSlug?: string | null
  pendingRequestId?: string | null
  dashboardHref?: string
  onEditProfile?: () => void
  onOpenFollowers?: () => void
  onOpenFollowing?: () => void
  onOpenConnections?: () => void
  onConnectionChange?: () => void
}

export function NetworkProfileHeader({
  profile,
  isYou,
  badges,
  fandomBadges = [],
  artistSlug,
  pendingRequestId,
  dashboardHref,
  onEditProfile,
  onOpenFollowers,
  onOpenFollowing,
  onOpenConnections,
  onConnectionChange,
}: NetworkProfileHeaderProps) {
  const handleDisplay = profile.handle.replace(/^@/, '')
  const isVerifiedStaff =
    profile.profileRole === 'editor' || profile.profileRole === 'super_editor'

  const rolePills: { label: string; tone: string }[] = []
  if (profile.profileRole === 'super_editor') {
    rolePills.push({ label: 'Founder', tone: 'founder' })
  }
  rolePills.push({ label: roleLabel(profile.profileRole), tone: 'role' })
  if (profile.dashboardPersona) {
    rolePills.push({ label: personaLabel(profile.dashboardPersona), tone: 'persona' })
  }
  if (isVerifiedStaff) {
    rolePills.push({ label: 'Verified', tone: 'verified' })
  }

  const memberSince = new Date(profile.memberSince).toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  })

  return (
    <header className="network-profile-hero">
      <div
        className="network-profile-cover"
        style={{ backgroundImage: DEFAULT_COVER }}
      />

      <div className="network-profile-hero-inner">
        <div className="network-profile-identity-row">
          <div className="network-profile-avatar-wrap">
            {profile.avatarUrl ? (
              <IOSImage
                src={profile.avatarUrl}
                alt=""
                width={128}
                className="network-profile-avatar"
              />
            ) : (
              <span className="network-profile-avatar-fallback" aria-hidden>
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="network-profile-title-block">
            <div className="network-profile-name-row">
              <h1 className="network-profile-name">{profile.displayName}</h1>
              {isVerifiedStaff && (
                <span className="network-profile-verified" title="IOS verified">
                  ✓
                </span>
              )}
            </div>
            <p className="network-profile-handle">
              @{handleDisplay} · {roleLabel(profile.profileRole)} · Member since {memberSince}
            </p>
            {profile.bio && <p className="network-profile-bio">{profile.bio}</p>}

            <ul className="network-profile-pills">
              {rolePills.map((pill) => (
                <li
                  key={`${pill.tone}-${pill.label}`}
                  className={`network-profile-pill network-profile-pill--${pill.tone}`}
                >
                  {pill.label}
                </li>
              ))}
              {profile.primaryGenreSlug && (
                <li className="network-profile-pill network-profile-pill--genre">
                  {formatGenre(profile.primaryGenreSlug)}
                </li>
              )}
            </ul>

            <IdentityCrossLinks
              artistSlug={artistSlug}
              networkHandle={profile.handle}
              className="network-profile-crosslinks"
              compact
            />
          </div>

          <div className="network-profile-stats-col">
            <ul className="network-profile-stats" aria-label="Profile stats">
              <li>
                <button type="button" className="network-profile-stat" onClick={onOpenConnections}>
                  <strong>{formatNetworkCount(profile.connectionCount)}</strong>
                  <span>Connections</span>
                </button>
              </li>
              <li>
                <button type="button" className="network-profile-stat" onClick={onOpenFollowers}>
                  <strong>{formatNetworkCount(profile.followerCount)}</strong>
                  <span>Followers</span>
                </button>
              </li>
              <li>
                <button type="button" className="network-profile-stat" onClick={onOpenFollowing}>
                  <strong>{formatNetworkCount(profile.followingCount)}</strong>
                  <span>Following</span>
                </button>
              </li>
            </ul>

            <div className="network-profile-actions network-profile-actions--inline">
              {isYou ? (
                <>
                  <Link to="/feed" className="network-profile-btn network-profile-btn--primary">
                    New transmission
                  </Link>
                  <button
                    type="button"
                    className="network-profile-btn network-profile-btn--ghost"
                    onClick={() => onEditProfile?.()}
                  >
                    Edit profile
                  </button>
                  {dashboardHref && (
                    <Link to={dashboardHref} className="network-profile-btn network-profile-btn--ghost">
                      Desk
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <ConnectButton
                    targetUserId={profile.userId}
                    status={profile.viewerConnectionStatus}
                    pendingRequestId={pendingRequestId ?? undefined}
                    onStatusChange={onConnectionChange}
                    className="network-profile-connect"
                  />
                  <MessageButton
                    targetUserId={profile.userId}
                    className="network-profile-btn network-profile-btn--ghost"
                  />
                  <FollowButton
                    targetUserId={profile.userId}
                    initialFollowing={profile.viewerIsFollowing}
                    className="network-profile-follow"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {fandomBadges.length > 0 && (
          <FandomSupporterBadgesList
            badges={fandomBadges}
            className="network-profile-fandom-badges"
          />
        )}

        {badges.length > 0 && (
          <ul className="network-profile-header-badges" aria-label="Top badges">
            {badges.slice(0, 5).map((b) => (
              <li key={b.slug} className="network-profile-header-badge" title={b.description}>
                {b.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}
