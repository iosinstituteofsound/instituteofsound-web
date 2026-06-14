import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCrewForUserId, fetchCrewRoster } from '@/lib/community/crewService'
import type { PublicUserCrew } from '@/lib/community/crewTypes'
import type { CrewRosterMember } from '@/lib/community/crewTypes'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { IOSImage } from '@/components/ui/IOSImage'

interface NetworkProfileCrewsProps {
  userId: string
  isYou: boolean
}

export function NetworkProfileCrews({ userId, isYou }: NetworkProfileCrewsProps) {
  const [crew, setCrew] = useState<PublicUserCrew | null>(null)
  const [roster, setRoster] = useState<CrewRosterMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchCrewForUserId(userId)
      .then(async (c) => {
        if (cancelled) return
        setCrew(c)
        if (c) {
          const members = await fetchCrewRoster(c.crewId)
          if (!cancelled) setRoster(members)
        } else {
          setRoster([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  if (loading) {
    return <p className="text-sm text-muted">Loading crew…</p>
  }

  if (!crew) {
    return (
      <div className="member-profile-panel-empty">
        <p>{isYou ? "You're not in a crew yet." : 'Not in a crew on the network.'}</p>
        {isYou && (
          <Link to="/community#crew" className="member-profile-btn member-profile-btn-primary mt-6">
            Find or create a crew →
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <section className="ios-card p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-mh-red font-bold">Crew</p>
        <h2 className="font-display text-2xl font-bold uppercase mt-2">{crew.name}</h2>
        {crew.tagline && <p className="text-sm text-muted mt-2">{crew.tagline}</p>}
        <dl className="network-profile-about-grid mt-4">
          <div>
            <dt>Role</dt>
            <dd className="capitalize">{crew.role}</dd>
          </div>
          <div>
            <dt>Members</dt>
            <dd>{crew.memberCount}</dd>
          </div>
          <div>
            <dt>Weekly dB</dt>
            <dd>{crew.weeklyDb.toLocaleString()}</dd>
          </div>
        </dl>
        <Link to="/community#crew" className="network-rail-cta inline-block mt-4">
          View crew board →
        </Link>
      </section>

      {roster.length > 0 && (
        <section className="ios-card p-5">
          <h3 className="network-rail-title">Roster</h3>
          <ul className="divide-y divide-border border border-border mt-3">
            {roster.map((member) => (
              <li key={member.userId} className="px-4 py-3 flex items-center gap-3">
                {member.avatarUrl ? (
                  <IOSImage
                    src={member.avatarUrl}
                    alt=""
                    width={40}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-surface grid place-items-center text-xs shrink-0">
                    {member.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    to={networkProfilePath(member.handle)}
                    className="font-semibold truncate block hover:text-mh-red"
                  >
                    {member.name}
                  </Link>
                  <p className="text-xs text-muted font-mono truncate">{member.handle}</p>
                </div>
                <span className="text-xs font-mono text-muted shrink-0">
                  {member.weeklyDb} dB
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
