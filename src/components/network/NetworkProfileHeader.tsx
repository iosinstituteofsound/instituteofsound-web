import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { EarnedBadge } from '@/lib/community/service'
import { roleLabel } from '@/lib/auth/roles'
import { IOSImage } from '@/components/ui/IOSImage'
import { FollowButton } from '@/components/community/FollowButton'
import { MessageButton } from '@/components/community/MessageButton'
import { ConnectButton } from '@/components/network/ConnectButton'
import { IdentityCrossLinks } from '@/components/community/IdentityCrossLinks'

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
  const rolePills: { label: string; tone: string }[] = []
  rolePills.push({ label: roleLabel(profile.profileRole), tone: 'role' })
  if (profile.dashboardPersona) {
    rolePills.push({ label: personaLabel(profile.dashboardPersona), tone: 'persona' })
  }
  if (profile.profileRole === 'editor' || profile.profileRole === 'super_editor') {
    rolePills.push({ label: 'Verified', tone: 'verified' })
  }

  return (
    <header className="network-profile-hero">
      <div
        className="network-profile-cover"
        style={{
          backgroundImage:
            'linear-gradient(180deg, transparent 0%, rgba(5,5,5,0.92) 85%), url(https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400&q=80)',
        }}
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
              {(profile.profileRole === 'editor' || profile.profileRole === 'super_editor') && (
                <span className="network-profile-verified" title="IOS verified">
                  ✓
                </span>
              )}
            </div>
            <p className="network-profile-handle">
              @{handleDisplay} · IOS {roleLabel(profile.profileRole)}
            </p>
            {profile.bio && <p className="network-profile-bio">{profile.bio}</p>}

            <ul className="network-profile-pills">
              {rolePills.map((pill) => (
                <li key={pill.label} className={`network-profile-pill network-profile-pill--${pill.tone}`}>
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
              className="mt-3"
              compact
            />
          </div>

          <ul className="network-profile-stats" aria-label="Profile stats">
            <li>
              <button type="button" className="network-profile-stat" onClick={onOpenConnections}>
                <strong>{profile.connectionCount.toLocaleString()}</strong>
                <span>Connections</span>
              </button>
            </li>
            <li>
              <button type="button" className="network-profile-stat" onClick={onOpenFollowers}>
                <strong>{profile.followerCount.toLocaleString()}</strong>
                <span>Followers</span>
              </button>
            </li>
            <li>
              <button type="button" className="network-profile-stat" onClick={onOpenFollowing}>
                <strong>{profile.followingCount.toLocaleString()}</strong>
                <span>Following</span>
              </button>
            </li>
          </ul>
        </div>

        <div className="network-profile-actions">
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
                  Open desk →
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
              />
              <MessageButton targetUserId={profile.userId} />
              <FollowButton
                targetUserId={profile.userId}
                initialFollowing={profile.viewerIsFollowing}
                className="network-profile-follow"
              />
            </>
          )}
        </div>

        {badges.length > 0 && (
          <ul className="network-profile-badges" aria-label="Badges">
            {badges.slice(0, 4).map((b) => (
              <li key={b.slug} className="network-profile-badge" title={b.description}>
                {b.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}
