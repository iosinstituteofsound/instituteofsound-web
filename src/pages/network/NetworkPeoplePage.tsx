import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchSuggestedPeople,
  searchNetworkPeople,
  NETWORK_CONNECTION_EVENT,
} from '@/lib/network/connectionService'
import type { NetworkPersonCard } from '@/lib/network/connectionTypes'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { ConnectButton } from '@/components/network/ConnectButton'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'
import { roleLabel } from '@/lib/auth/roles'
import type { UserRole } from '@/lib/auth/types'
import { useSeo } from '@/hooks/useSeo'

export default function NetworkPeoplePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NetworkPersonCard[]>([])
  const [suggested, setSuggested] = useState<NetworkPersonCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useSeo({
    title: 'People',
    description: 'Discover and connect with operators on Institute of Sound.',
    canonicalPath: '/network/people',
  })

  const refreshSuggested = useCallback(async () => {
    try {
      setSuggested(await fetchSuggestedPeople(8))
    } catch {
      setSuggested([])
    }
  }, [])

  useEffect(() => {
    void refreshSuggested()
    const onChange = () => void refreshSuggested()
    window.addEventListener(NETWORK_CONNECTION_EVENT, onChange)
    return () => window.removeEventListener(NETWORK_CONNECTION_EVENT, onChange)
  }, [refreshSuggested])

  const runSearch = useCallback(async () => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setError('')
      return
    }
    setLoading(true)
    setError('')
    try {
      setResults(await searchNetworkPeople(q))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    const t = window.setTimeout(() => void runSearch(), 300)
    return () => window.clearTimeout(t)
  }, [runSearch])

  return (
    <div className="network-people">
      <header className="network-people-hero ios-card">
        <p className="network-kicker">Network</p>
        <h1 className="network-home-title">People</h1>
        <p className="network-home-lede">
          Search by name or @handle. Send a connect invite — when they accept, you are linked on the
          network.
        </p>
        <div className="network-people-search">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search operators…"
            className="ios-input"
            autoComplete="off"
          />
        </div>
        {error && <p className="text-sm text-mh-red mt-3">{error}</p>}
      </header>

      {query.trim().length >= 2 && (
        <section className="ios-card p-5 mt-5">
          <h2 className="network-section-title mb-4">Results</h2>
          {loading ? (
            <LoadingTransmission variant="compact" />
          ) : results.length === 0 ? (
            <p className="text-sm text-muted">No operators matched that search.</p>
          ) : (
            <PersonList people={results} onRefresh={refreshSuggested} />
          )}
        </section>
      )}

      <section className="ios-card p-5 mt-5">
        <h2 className="network-section-title mb-4">Suggested for you</h2>
        {suggested.length === 0 ? (
          <LoadingTransmission variant="compact" />
        ) : (
          <PersonList people={suggested} onRefresh={refreshSuggested} />
        )}
      </section>

      <p className="network-people-foot">
        <Link to="/network">← Network home</Link>
      </p>
    </div>
  )
}

function PersonList({
  people,
  onRefresh,
}: {
  people: NetworkPersonCard[]
  onRefresh: () => void
}) {
  return (
    <ul className="network-people-list">
      {people.map((person) => (
        <li key={person.userId} className="network-people-row">
          <Link to={networkProfilePath(person.handle)} className="network-people-who">
            {person.avatarUrl ? (
              <IOSImage src={person.avatarUrl} alt="" width={48} className="network-people-avatar" />
            ) : (
              <span className="network-people-fallback">{person.displayName.charAt(0)}</span>
            )}
            <span>
              <strong>{person.displayName}</strong>
              <span className="network-people-meta">
                @{person.handle} · {roleLabel(person.role as UserRole)} · {person.totalDb} dB
              </span>
            </span>
          </Link>
          <ConnectButton
            targetUserId={person.userId}
            status={person.connectionStatus}
            size="sm"
            onStatusChange={onRefresh}
          />
        </li>
      ))}
    </ul>
  )
}
