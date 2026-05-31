import { Link } from 'react-router-dom'
import type { MemberConnectionProfile } from '@/lib/community/memberProfileService'
import { networkProfilePath } from '@/lib/community/networkPaths'

type ConnectionsMode = 'followers' | 'following' | 'connections'

interface NetworkConnectionsPanelProps {
  mode: ConnectionsMode
  loading: boolean
  error: string
  connections: MemberConnectionProfile[]
  onClose: () => void
}

const TITLES: Record<ConnectionsMode, string> = {
  connections: 'Links',
  followers: 'Followers',
  following: 'Following',
}

export function NetworkConnectionsPanel({
  mode,
  loading,
  error,
  connections,
  onClose,
}: NetworkConnectionsPanelProps) {
  return (
    <section className="net-connections-panel" aria-labelledby="net-connections-title">
      <div className="net-connections-panel__head">
        <div>
          <p className="net-dossier__kicker">Roster</p>
          <h2 id="net-connections-title" className="net-connections-panel__title">
            {TITLES[mode]}
          </h2>
        </div>
        <button type="button" className="net-connections-panel__close" onClick={onClose}>
          Close
        </button>
      </div>

      {loading && <p className="net-connections-panel__msg">Scanning roster…</p>}
      {!loading && error && <p className="net-connections-panel__msg net-connections-panel__msg--err">{error}</p>}
      {!loading && !error && connections.length === 0 && (
        <p className="net-connections-panel__msg">No operators in this list yet.</p>
      )}
      {!loading && !error && connections.length > 0 && (
        <ul className="net-connections-panel__list">
          {connections.map((c) => (
            <li key={c.userId}>
              <div className="net-connections-panel__who">
                <strong>{c.displayName}</strong>
                <span>@{c.handle.replace(/^@/, '')}</span>
              </div>
              <Link to={networkProfilePath(c.handle)} className="net-connections-panel__open">
                Open →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
