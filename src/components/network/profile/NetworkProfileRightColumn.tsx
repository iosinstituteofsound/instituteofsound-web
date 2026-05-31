import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import type { PublicMemberProfile } from '@/lib/community/memberProfileService'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import type { FandomPublicRecognitionRow } from '@/lib/fandom/types'
import { fetchCrewForUserId } from '@/lib/community/crewService'
import type { PublicUserCrew } from '@/lib/community/crewTypes'
import { ConnectButton } from '@/components/network/ConnectButton'
import { NetworkProfileReputationCard } from '@/components/network/profile/NetworkProfileReputationCard'
import { FandomPublicRecognitions } from '@/components/fandom/FandomPublicRecognitions'
import type { NetworkPersonCard } from '@/lib/network/connectionTypes'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { IOSImage } from '@/components/ui/IOSImage'

interface NetworkProfileRightColumnProps {
  profile: PublicMemberProfile
  posts: CommunityFeedPost[]
  mutuals: NetworkPersonCard[]
  suggested: NetworkPersonCard[]
  fandomRecognitions?: FandomPublicRecognitionRow[]
  isYou: boolean
  onViewCrews?: () => void
  onViewMutuals?: () => void
  onConnectionChange?: () => void
}

export function NetworkProfileRightColumn({
  profile,
  posts,
  mutuals,
  suggested,
  fandomRecognitions = [],
  isYou,
  onViewCrews,
  onViewMutuals,
  onConnectionChange,
}: NetworkProfileRightColumnProps) {
  const [crew, setCrew] = useState<PublicUserCrew | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetchCrewForUserId(profile.userId).then((c) => {
      if (!cancelled) setCrew(c)
    })
    return () => {
      cancelled = true
    }
  }, [profile.userId])

  const visibleMutuals = mutuals.slice(0, 5)
  const extraMutuals = Math.max(0, mutuals.length - visibleMutuals.length)
  const connectionAccent = isYou
    ? `${profile.connectionCount} Connection${profile.connectionCount === 1 ? '' : 's'}`
    : `${mutuals.length} Mutual`

  return (
    <aside className="np-rail" aria-label="Profile sidebar">
      <NetworkProfileReputationCard profile={profile} posts={posts} />

      {(isYou || mutuals.length > 0) && (
        <section className="np-rail-card">
          <div className="np-rail-card__head">
            <h2 className="np-rail-card__title">{isYou ? 'Your Connections' : 'Mutual Connections'}</h2>
            <span className="np-rail-card__accent">{connectionAccent}</span>
          </div>
          {mutuals.length > 0 ? (
            <ul className="np-rail-mutuals">
              {visibleMutuals.map((m) => (
                <li key={m.userId}>
                  <Link to={networkProfilePath(m.handle)} title={m.displayName}>
                    {m.avatarUrl ? (
                      <IOSImage src={m.avatarUrl} alt="" width={40} className="np-rail-mutuals__avatar" />
                    ) : (
                      <span className="np-rail-mutuals__fallback">{m.displayName.charAt(0)}</span>
                    )}
                  </Link>
                </li>
              ))}
              {extraMutuals > 0 && <li className="np-rail-mutuals__more">+{extraMutuals}</li>}
            </ul>
          ) : (
            <p className="np-rail-empty">No connections yet — discover operators on the network.</p>
          )}
          {onViewMutuals ? (
            <button type="button" className="np-rail-foot-link" onClick={onViewMutuals}>
              {isYou ? 'Find people to connect →' : 'View all connections →'}
            </button>
          ) : (
            <Link to="/network/people" className="np-rail-foot-link">
              {isYou ? 'Find people to connect →' : 'View all connections →'}
            </Link>
          )}
        </section>
      )}

      <section className="np-rail-card">
        <h2 className="np-rail-card__title">Member Of Crews</h2>
        {crew ? (
          <ul className="np-rail-crews">
            <li>
              <Link to="/community#crew" className="np-rail-crew-row">
                <span className="np-rail-crew-row__logo">{crew.name.charAt(0)}</span>
                <span className="np-rail-crew-row__info">
                  <strong>{crew.name}</strong>
                  <span>{crew.memberCount.toLocaleString()} Members</span>
                </span>
              </Link>
            </li>
          </ul>
        ) : (
          <p className="np-rail-empty">Not in a crew yet — join one from Community.</p>
        )}
        {onViewCrews ? (
          <button type="button" className="np-rail-foot-link" onClick={onViewCrews}>
            View all crews →
          </button>
        ) : (
          <Link to="/community#crew" className="np-rail-foot-link">
            View all crews →
          </Link>
        )}
      </section>

      {suggested.length > 0 && (
        <section className="np-rail-card">
          <div className="np-rail-card__head">
            <h2 className="np-rail-card__title">Suggested For You</h2>
            <Link to="/network/people" className="np-rail-card__accent np-rail-card__accent--link">
              See All
            </Link>
          </div>
          <ul className="np-rail-suggest">
            {suggested.slice(0, 3).map((person) => (
              <li key={person.userId} className="np-rail-suggest__row">
                <Link to={networkProfilePath(person.handle)} className="np-rail-suggest__who">
                  <span className="np-rail-suggest__avatar-wrap">
                    {person.avatarUrl ? (
                      <IOSImage
                        src={person.avatarUrl}
                        alt=""
                        width={44}
                        className="np-rail-suggest__avatar"
                      />
                    ) : (
                      <span className="np-rail-suggest__fallback">{person.displayName.charAt(0)}</span>
                    )}
                    <span className="np-rail-suggest__online" aria-hidden />
                  </span>
                  <span className="np-rail-suggest__meta">
                    <strong>{person.displayName}</strong>
                    <span>@{person.handle.replace(/^@/, '')}</span>
                  </span>
                </Link>
                <ConnectButton
                  targetUserId={person.userId}
                  status={person.connectionStatus}
                  size="sm"
                  onStatusChange={onConnectionChange}
                  className="np-rail-suggest__connect network-connect-btn"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {fandomRecognitions.length > 0 && (
        <FandomPublicRecognitions
          recognitions={fandomRecognitions}
          className="np-rail-card np-rail-card--fandom"
        />
      )}
    </aside>
  )
}
