import { Link } from 'react-router-dom'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { EarnedBadge } from '@/lib/community/service'
import { RankBadge } from '@/components/ui/RankBadge'
import { MedalIllustration } from '@/components/community/medals/MedalIllustration'
import { ConnectButton } from '@/components/network/ConnectButton'
import type { NetworkPersonCard } from '@/lib/network/connectionTypes'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { IOSImage } from '@/components/ui/IOSImage'

interface NetworkProfileSidebarProps {
  profile: PublicMemberProfile
  badges: EarnedBadge[]
  mutuals: NetworkPersonCard[]
  suggested: NetworkPersonCard[]
  isYou: boolean
  hideBadges?: boolean
  onViewAllBadges?: () => void
  onConnectionChange?: () => void
}

export function NetworkProfileSidebar({
  profile,
  badges,
  mutuals,
  suggested,
  isYou,
  hideBadges = false,
  onViewAllBadges,
  onConnectionChange,
}: NetworkProfileSidebarProps) {
  return (
    <aside className="network-profile-rail space-y-5">
      <section className="network-rail-card">
        <h2 className="network-rail-title">Reputation</h2>
        <div className="network-reputation-row">
          <RankBadge rank={profile.rank} size="md" />
          <div>
            <p className="network-reputation-db">{profile.totalDb.toLocaleString()} dB</p>
            <p className="network-reputation-meta">
              {profile.weeklyDb.toLocaleString()} this week · {profile.postCount} posts
            </p>
          </div>
        </div>
      </section>

      {!hideBadges && badges.length > 0 && (
        <section className="network-rail-card">
          <div className="network-rail-head">
            <h2 className="network-rail-title">Badges</h2>
            {onViewAllBadges ? (
              <button type="button" className="network-rail-link" onClick={onViewAllBadges}>
                View all
              </button>
            ) : (
              <span className="network-rail-link">View all</span>
            )}
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

      {!isYou && mutuals.length > 0 && (
        <section className="network-rail-card">
          <h2 className="network-rail-title">{mutuals.length} mutual</h2>
          <ul className="network-avatar-stack">
            {mutuals.slice(0, 5).map((m) => (
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
        <section className="network-rail-card">
          <h2 className="network-rail-title">Suggested for you</h2>
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
                    <span className="network-suggest-handle">@{person.handle}</span>
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
            Discover more people →
          </Link>
        </section>
      )}
    </aside>
  )
}
