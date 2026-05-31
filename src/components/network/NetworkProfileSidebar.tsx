import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { EarnedBadge } from '@/lib/community/service'
import type { FandomPublicRecognitionRow } from '@/lib/fandom/types'
import { MedalIllustration } from '@/components/community/medals/MedalIllustration'
import { ConnectButton } from '@/components/network/ConnectButton'
import { NetworkSignalReadout } from '@/components/network/NetworkSignalReadout'
import { NetworkProfileCrewsRail } from '@/components/network/NetworkProfileCrewsRail'
import { FandomPublicRecognitions } from '@/components/fandom/FandomPublicRecognitions'
import type { NetworkPersonCard } from '@/lib/network/connectionTypes'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { IOSImage } from '@/components/ui/IOSImage'

interface NetworkProfileSidebarProps {
  profile: PublicMemberProfile
  badges: EarnedBadge[]
  mutuals: NetworkPersonCard[]
  suggested: NetworkPersonCard[]
  fandomRecognitions?: FandomPublicRecognitionRow[]
  isYou: boolean
  hideBadges?: boolean
  onViewAllBadges?: () => void
  onViewCrews?: () => void
  onConnectionChange?: () => void
}

export function NetworkProfileSidebar({
  profile,
  badges,
  mutuals,
  suggested,
  fandomRecognitions = [],
  isYou,
  hideBadges = false,
  onViewAllBadges,
  onViewCrews,
  onConnectionChange,
}: NetworkProfileSidebarProps) {
  return (
    <aside className="network-profile-rail">
      <section className="network-rail-panel">
        <p className="network-rail-kicker">Signal</p>
        <h2 className="network-rail-heading">Readout</h2>
        <NetworkSignalReadout profile={profile} />
        <ul className="network-rail-metrics">
          <li>
            <span>Transmissions</span>
            <strong>{profile.postCount.toLocaleString()}</strong>
          </li>
          <li>
            <span>Followers</span>
            <strong>{profile.followerCount.toLocaleString()}</strong>
          </li>
        </ul>
      </section>

      {!hideBadges && badges.length > 0 && (
        <section className="network-rail-panel">
          <div className="network-rail-head">
            <div>
              <p className="network-rail-kicker">Earned</p>
              <h2 className="network-rail-heading">Medals</h2>
            </div>
            {onViewAllBadges ? (
              <button type="button" className="network-rail-link" onClick={onViewAllBadges}>
                All
              </button>
            ) : null}
          </div>
          <ul className="network-badge-grid">
            {badges.slice(0, 4).map((b) => (
              <li key={b.slug} title={b.description}>
                <MedalIllustration slug={b.slug} size={40} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <NetworkProfileCrewsRail userId={profile.userId} onViewCrews={onViewCrews} />

      {fandomRecognitions.length > 0 && (
        <FandomPublicRecognitions
          recognitions={fandomRecognitions}
          className="network-rail-panel network-rail-recognitions"
        />
      )}

      {!isYou && mutuals.length > 0 && (
        <section className="network-rail-panel">
          <p className="network-rail-kicker">Shared</p>
          <h2 className="network-rail-heading">
            {mutuals.length} mutual link{mutuals.length === 1 ? '' : 's'}
          </h2>
          <ul className="network-avatar-stack">
            {mutuals.slice(0, 6).map((m) => (
              <li key={m.userId}>
                <Link to={networkProfilePath(m.handle)} title={m.displayName}>
                  {m.avatarUrl ? (
                    <IOSImage src={m.avatarUrl} alt="" width={36} className="network-stack-avatar" />
                  ) : (
                    <span className="network-stack-fallback">{m.displayName.charAt(0)}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!isYou && suggested.length > 0 && (
        <section className="network-rail-panel">
          <p className="network-rail-kicker">Discover</p>
          <h2 className="network-rail-heading">Operators</h2>
          <ul className="network-suggest-list">
            {suggested.slice(0, 3).map((person) => (
              <li key={person.userId} className="network-suggest-item">
                <Link to={networkProfilePath(person.handle)} className="network-suggest-who">
                  {person.avatarUrl ? (
                    <IOSImage src={person.avatarUrl} alt="" width={40} className="network-suggest-avatar" />
                  ) : (
                    <span className="network-suggest-fallback">{person.displayName.charAt(0)}</span>
                  )}
                  <span>
                    <strong>{person.displayName}</strong>
                    <span className="network-suggest-handle">{person.handle}</span>
                  </span>
                </Link>
                <ConnectButton
                  targetUserId={person.userId}
                  status={person.connectionStatus}
                  size="sm"
                  onStatusChange={onConnectionChange}
                />
              </li>
            ))}
          </ul>
          <Link to="/network/people" className="network-rail-cta">
            Browse people →
          </Link>
        </section>
      )}
    </aside>
  )
}
