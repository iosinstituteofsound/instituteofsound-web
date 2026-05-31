import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCrewForUserId } from '@/lib/community/crewService'
import type { PublicUserCrew } from '@/lib/community/crewTypes'

interface NetworkProfileCrewsRailProps {
  userId: string
  onViewCrews?: () => void
}

export function NetworkProfileCrewsRail({ userId, onViewCrews }: NetworkProfileCrewsRailProps) {
  const [crew, setCrew] = useState<PublicUserCrew | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchCrewForUserId(userId)
      .then((c) => {
        if (!cancelled) setCrew(c)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  if (loading) {
    return (
      <section className="network-rail-panel">
        <p className="network-rail-kicker">Crew</p>
        <p className="text-sm text-muted">Scanning roster…</p>
      </section>
    )
  }

  if (!crew) return null

  return (
    <section className="network-rail-panel">
      <p className="network-rail-kicker">Crew</p>
      <h2 className="network-rail-heading">Roster</h2>
      <Link to="/community#crew" className="network-crew-chip">
        <span className="network-crew-chip-mark" aria-hidden>
          {crew.name.charAt(0).toUpperCase()}
        </span>
        <span className="network-crew-chip-body">
          <strong>{crew.name}</strong>
          <span>
            {crew.memberCount} operators · {crew.role === 'founder' ? 'Founder' : 'Member'}
          </span>
        </span>
      </Link>
      {onViewCrews ? (
        <button type="button" className="network-rail-cta" onClick={onViewCrews}>
          Crew dossier →
        </button>
      ) : null}
    </section>
  )
}
