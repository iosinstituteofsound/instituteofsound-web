import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { PublicSupporterBadgeOnArtist } from '@/lib/fandom/types'
import { roleLabel } from '@/lib/auth/roles'
import { getSiteHost, getSiteUrl } from '@/lib/auth/siteUrl'
import { formatNetworkCount } from '@/lib/network/noiseScore'
import { IOSImage } from '@/components/ui/IOSImage'
import { ConnectButton } from '@/components/network/ConnectButton'
import { FollowButton } from '@/components/community/FollowButton'
import { MessageButton } from '@/components/community/MessageButton'
import { IdentityCrossLinks } from '@/components/community/IdentityCrossLinks'
import { FandomSupporterBadgesList } from '@/components/fandom/FandomSupporterBadges'

const COVER_IMAGE =
  'linear-gradient(180deg, rgba(5,5,5,0.2) 0%, rgba(5,5,5,0.95) 100%), url(https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1600&q=85)'

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function personaLabel(persona: string) {
  return persona.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function rolePills(profile: PublicMemberProfile): string[] {
  const pills: string[] = []
  if (profile.profileRole === 'super_editor') pills.push('Founder')
  if (profile.profileRole === 'editor' || profile.profileRole === 'super_editor') pills.push('Editor')
  if (profile.profileRole === 'artist') pills.push('Artist')
  if (profile.dashboardPersona) pills.push(personaLabel(profile.dashboardPersona))
  if (profile.rank === 'Operator' || profile.rank === 'Curator') {
    pills.push(profile.rank)
  }
  if (profile.primaryGenreSlug) pills.push(formatGenre(profile.primaryGenreSlug))
  return [...new Set(pills)]
}

function subtitleLine(profile: PublicMemberProfile): string {
  const parts: string[] = []
  if (profile.bio) {
    const first = profile.bio.split('\n')[0]?.trim()
    if (first) parts.push(first)
  }
  const roles: string[] = []
  if (profile.rank !== 'Listener') {
    roles.push(profile.rank)
  }
  if (profile.profileRole === 'editor' || profile.profileRole === 'super_editor') roles.push('Editor')
  if (roles.length) parts.push(roles.join(' · '))
  return parts.join(' · ') || 'On the Institute of Sound network'
}

interface NetworkProfileCoverHeaderProps {
  profile: PublicMemberProfile
  isYou: boolean
  artistSlug?: string | null
  fandomBadges?: PublicSupporterBadgeOnArtist[]
  pendingRequestId?: string | null
  onEditProfile?: () => void
  onOpenFollowers?: () => void
  onOpenFollowing?: () => void
  onOpenConnections?: () => void
  onConnectionChange?: () => void
}

export function NetworkProfileCoverHeader({
  profile,
  isYou,
  artistSlug,
  fandomBadges = [],
  pendingRequestId,
  onEditProfile,
  onOpenFollowers,
  onOpenFollowing,
  onOpenConnections,
  onConnectionChange,
}: NetworkProfileCoverHeaderProps) {
  const handle = profile.handle.replace(/^@/, '')
  const pills = rolePills(profile)
  const memberBadge =
    profile.profileRole === 'editor' || profile.profileRole === 'super_editor'
      ? 'IOS Editor'
      : profile.profileRole === 'artist'
        ? 'IOS Artist'
        : 'IOS Member'

  return (
    <header className="np-header">
      <div className="np-header__cover" style={{ backgroundImage: COVER_IMAGE }} aria-hidden />

      <div className="np-header__body">
        <div className="np-header__identity">
          <div className="np-header__avatar-wrap">
            {profile.avatarUrl ? (
              <IOSImage
                src={profile.avatarUrl}
                alt=""
                width={128}
                className="np-header__avatar"
              />
            ) : (
              <span className="np-header__avatar-fallback" aria-hidden>
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="np-header__online" title="On the network" aria-hidden />
          </div>

          <div className="np-header__meta">
            <div className="np-header__name-row">
              <h1 className="np-header__name">{profile.displayName}</h1>
            </div>
            <p className="np-header__handle-row">
              <span className="np-header__handle">@{handle}</span>
              <span className="np-header__member-badge">{memberBadge}</span>
            </p>
            <p className="np-header__subtitle">{subtitleLine(profile)}</p>
            {profile.bio && profile.bio.includes('\n') && (
              <p className="np-header__subtitle np-header__subtitle--secondary">
                {profile.bio.split('\n').slice(1).join(' · ')}
              </p>
            )}
            <p className="np-header__loc">
              <span>Institute of Sound</span>
              <span className="np-header__loc-dot">·</span>
              <a href={getSiteUrl()} target="_blank" rel="noopener noreferrer">
                {getSiteHost()}
              </a>
            </p>

            <IdentityCrossLinks
              artistSlug={artistSlug}
              networkHandle={profile.handle}
              className="np-header__crosslinks"
              compact
            />
          </div>
        </div>

        <div className="np-header__actions-col">
          <div className="np-header__actions">
            {isYou ? (
              <>
                <Link to="/feed" className="np-btn np-btn--primary">
                  Broadcast
                </Link>
                <button type="button" className="np-btn np-btn--outline" onClick={() => onEditProfile?.()}>
                  Edit profile
                </button>
              </>
            ) : (
              <>
                {onConnectionChange && (
                  <ConnectButton
                    targetUserId={profile.userId}
                    status={profile.viewerConnectionStatus}
                    pendingRequestId={pendingRequestId ?? undefined}
                    onStatusChange={onConnectionChange}
                    className="np-btn np-btn--primary network-connect-btn"
                  />
                )}
                <MessageButton
                  targetUserId={profile.userId}
                  className="np-btn np-btn--outline"
                />
                <FollowButton
                  targetUserId={profile.userId}
                  initialFollowing={profile.viewerIsFollowing}
                  className="np-btn np-btn--outline"
                />
              </>
            )}
            <button
              type="button"
              className="np-btn np-btn--icon"
              aria-label="More actions"
              onClick={() => void navigator.clipboard?.writeText(window.location.href)}
              title="Copy profile URL"
            >
              ⋯
            </button>
          </div>

          <ul className="np-header__stats">
            <li>
              <button type="button" className="np-header__stat" onClick={onOpenConnections}>
                <strong>{formatNetworkCount(profile.connectionCount)}</strong>
                <span>Connections</span>
              </button>
            </li>
            <li>
              <button type="button" className="np-header__stat" onClick={onOpenFollowers}>
                <strong>{formatNetworkCount(profile.followerCount)}</strong>
                <span>Followers</span>
              </button>
            </li>
            <li>
              <button type="button" className="np-header__stat" onClick={onOpenFollowing}>
                <strong>{formatNetworkCount(profile.followingCount)}</strong>
                <span>Following</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {pills.length > 0 && (
        <ul className="np-header__pills">
          {pills.map((label) => (
            <li key={label} className="np-header__pill">
              {label}
            </li>
          ))}
        </ul>
      )}

      {fandomBadges.length > 0 && (
        <FandomSupporterBadgesList badges={fandomBadges} className="np-header__fandom" />
      )}

      <p className="np-header__role-foot">
        {roleLabel(profile.profileRole)} · {profile.totalDb.toLocaleString()} dB lifetime
      </p>
    </header>
  )
}
