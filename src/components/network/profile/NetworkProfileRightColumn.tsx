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

  const extraMutuals = Math.max(0, mutuals.length - 5)

  return (
    <div className="np-col np-col--right">
      <NetworkProfileReputationCard profile={profile} posts={posts} />

      {!isYou && mutuals.length > 0 && (
        <section className="np-card">
          <h2 className="np-card__title">{mutuals.length} Mutual</h2>
          <ul className="np-mutual-stack">
            {mutuals.slice(0, 5).map((m) => (
              <li key={m.userId}>
                <Link to={networkProfilePath(m.handle)} title={m.displayName}>
                  {m.avatarUrl ? (
                    <IOSImage src={m.avatarUrl} alt="" width={40} className="np-mutual-avatar" />
                  ) : (
                    <span className="np-mutual-fallback">{m.displayName.charAt(0)}</span>
                  )}
                </Link>
              </li>
            ))}
            {extraMutuals > 0 && <li className="np-mutual-more">+{extraMutuals}</li>}
          </ul>
        </section>
      )}

      {crew && (
        <section className="np-card">
          <h2 className="np-card__title">Member of</h2>
          <Link to="/community#crew" className="np-crew-row">
            <span className="np-crew-mark">{crew.name.charAt(0)}</span>
            <span className="np-crew-info">
              <strong>{crew.name}</strong>
              <span>{crew.memberCount.toLocaleString()} members</span>
            </span>
          </Link>
          {onViewCrews ? (
            <button type="button" className="np-card__link np-card__link--block" onClick={onViewCrews}>
              View crew →
            </button>
          ) : null}
        </section>
      )}

      {fandomRecognitions.length > 0 && (
        <FandomPublicRecognitions
          recognitions={fandomRecognitions}
          className="np-card np-card--recognition"
        />
      )}

      {!isYou && suggested.length > 0 && (
        <section className="np-card">
          <h2 className="np-card__title">Suggested for you</h2>
          <ul className="np-suggest">
            {suggested.slice(0, 2).map((person) => (
              <li key={person.userId} className="np-suggest__row">
                <Link to={networkProfilePath(person.handle)} className="np-suggest__who">
                  {person.avatarUrl ? (
                    <IOSImage src={person.avatarUrl} alt="" width={44} className="np-suggest__avatar" />
                  ) : (
                    <span className="np-suggest__fallback">{person.displayName.charAt(0)}</span>
                  )}
                  <span>
                    <strong>{person.displayName}</strong>
                    <span className="np-suggest__handle">@{person.handle.replace(/^@/, '')}</span>
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
          <Link to="/network/people" className="np-card__link np-card__link--block">
            Discover more →
          </Link>
        </section>
      )}
    </div>
  )
}
