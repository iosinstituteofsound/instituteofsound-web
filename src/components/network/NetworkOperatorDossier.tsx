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
import { NetworkSignalTower } from '@/components/network/NetworkSignalTower'
import { formatNetworkCount } from '@/lib/network/noiseScore'

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

interface NetworkOperatorDossierProps {
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

export function NetworkOperatorDossier({
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
}: NetworkOperatorDossierProps) {
  const handle = profile.handle.replace(/^@/, '')

  return (
    <header className="net-dossier">
      <div className="net-dossier__glow" aria-hidden />
      <div className="net-dossier__scan" aria-hidden />
      <div className="net-dossier__corner net-dossier__corner--tl" aria-hidden />
      <div className="net-dossier__corner net-dossier__corner--br" aria-hidden />

      <div className="net-dossier__mast">
        <p className="net-dossier__kicker">
          Institute of Sound · Network
          {isYou && <span className="net-dossier__you"> · your dossier</span>}
        </p>
        <div className="net-dossier__mast-row">
          <span className="net-dossier__idx" aria-hidden>
            OP
          </span>
          <span className="net-dossier__id">ID {accountId}</span>
        </div>
      </div>

      <div className="net-dossier__grid">
        <div className="net-dossier__portrait">
          <div className="net-dossier__avatar-ring">
            <div className="net-dossier__avatar">
              {profile.avatarUrl ? (
                <IOSImage
                  src={profile.avatarUrl}
                  alt=""
                  width={160}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="net-dossier__avatar-fallback" aria-hidden>
                  {profile.displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <div className="net-dossier__portrait-rank">
            <RankBadge rank={profile.rank} size="sm" />
          </div>
        </div>

        <div className="net-dossier__core">
          <h1 className="net-dossier__name">{profile.displayName}</h1>
          <p className="net-dossier__handle">@{handle}</p>

          <div className="net-dossier__chips">
            {profile.primaryGenreSlug && (
              <span className="net-dossier__chip">{formatGenre(profile.primaryGenreSlug)}</span>
            )}
            <span className="net-dossier__chip net-dossier__chip--muted">
              Since{' '}
              {new Date(profile.memberSince).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>

          {profile.bio && <p className="net-dossier__bio">{profile.bio}</p>}

          <MemberCollabSkills handle={profile.handle} userId={profile.userId} />

          <IdentityCrossLinks
            artistSlug={artistSlug}
            networkHandle={profile.handle}
            className="net-dossier__crosslinks"
            compact
          />
        </div>

        <div className="net-dossier__tower-wrap">
          <NetworkSignalTower profile={profile} variant="hero" />
        </div>
      </div>

      <ul className="net-dossier__stats" aria-label="Network stats">
        <li>
          <button type="button" className="net-dossier__stat" onClick={onOpenConnections}>
            <strong>{formatNetworkCount(profile.connectionCount)}</strong>
            <span>Links</span>
          </button>
        </li>
        <li>
          <button type="button" className="net-dossier__stat" onClick={onOpenFollowers}>
            <strong>{formatNetworkCount(profile.followerCount)}</strong>
            <span>Followers</span>
          </button>
        </li>
        <li>
          <button type="button" className="net-dossier__stat" onClick={onOpenFollowing}>
            <strong>{formatNetworkCount(profile.followingCount)}</strong>
            <span>Following</span>
          </button>
        </li>
        <li className="net-dossier__stat net-dossier__stat--highlight">
          <strong>{profile.postCount.toLocaleString()}</strong>
          <span>Transmissions</span>
        </li>
      </ul>

      <div className="net-dossier__actions">
        {isYou ? (
          <>
            <Link to="/feed" className="net-dossier__btn net-dossier__btn--primary">
              Broadcast
            </Link>
            <button
              type="button"
              className="net-dossier__btn net-dossier__btn--ghost"
              onClick={() => onEditProfile?.()}
            >
              Edit dossier
            </button>
            {dashboardHref && (
              <Link to={dashboardHref} className="net-dossier__btn net-dossier__btn--ghost">
                Desk
              </Link>
            )}
          </>
        ) : (
          <>
            {onConnectionChange && (
              <ConnectButton
                targetUserId={profile.userId}
                status={profile.viewerConnectionStatus}
                pendingRequestId={pendingRequestId ?? undefined}
                onStatusChange={onConnectionChange}
                className="net-dossier__btn net-dossier__btn--primary network-connect-btn"
              />
            )}
            <FollowButton
              targetUserId={profile.userId}
              initialFollowing={profile.viewerIsFollowing}
              className="net-dossier__btn net-dossier__btn--ghost !flex-none !min-w-0"
            />
            <MessageButton
              targetUserId={profile.userId}
              className="net-dossier__btn net-dossier__btn--ghost"
            />
            <Link to="/feed" className="net-dossier__btn net-dossier__btn--ghost">
              Wire
            </Link>
          </>
        )}
        <button
          type="button"
          className="net-dossier__btn net-dossier__btn--ghost net-dossier__btn--share"
          onClick={() => void navigator.clipboard?.writeText(window.location.href)}
        >
          Copy URL
        </button>
      </div>

      {badges.length > 0 && (
        <ul className="net-dossier__medals" aria-label="Medals">
          {badges.slice(0, 8).map((b) => (
            <li key={b.slug} title={b.description}>
              <MedalIllustration slug={b.slug} size={32} />
              <span>{badgeDefBySlug(b.slug)?.name ?? b.name}</span>
            </li>
          ))}
          {badges.length > 8 && <li className="net-dossier__medals-more">+{badges.length - 8}</li>}
        </ul>
      )}

      {fandomBadges.length > 0 && (
        <FandomSupporterBadgesList badges={fandomBadges} className="net-dossier__fandom" />
      )}
    </header>
  )
}
