import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  fetchOnlineConnections,
  ONLINE_CONNECTS_POLL_MS,
} from '@/lib/network/presenceService'
import type { OnlineConnection } from '@/lib/network/presenceService'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { NETWORK_CONNECTION_EVENT } from '@/lib/network/connectionService'
import { IOSImage } from '@/components/ui/IOSImage'

export function NetworkProfileConnectsCard() {
  const { user } = useAuth()
  const [online, setOnline] = useState<OnlineConnection[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setOnline([])
      setLoading(false)
      return
    }
    setOnline(await fetchOnlineConnections())
    setLoading(false)
  }, [user])

  useEffect(() => {
    void refresh()
    const poll = window.setInterval(() => void refresh(), ONLINE_CONNECTS_POLL_MS)
    const onConn = () => void refresh()
    window.addEventListener(NETWORK_CONNECTION_EVENT, onConn)
    return () => {
      window.clearInterval(poll)
      window.removeEventListener(NETWORK_CONNECTION_EVENT, onConn)
    }
  }, [refresh])

  if (!user) return null

  return (
    <section className="np-rail-card np-connects">
      <div className="np-rail-card__head">
        <h2 className="np-rail-card__title">Connects</h2>
        {!loading && online.length > 0 && (
          <span className="np-rail-card__accent">{online.length} online</span>
        )}
      </div>

      {loading ? (
        <p className="np-rail-empty">Checking who&apos;s online…</p>
      ) : online.length === 0 ? (
        <p className="np-rail-empty">No connects online right now.</p>
      ) : (
        <ul className="np-connects__list">
          {online.map((person) => (
            <li key={person.userId}>
              <Link to={networkProfilePath(person.handle)} className="np-connects__row">
                <span className="np-connects__avatar-wrap">
                  {person.avatarUrl ? (
                    <IOSImage
                      src={person.avatarUrl}
                      alt=""
                      width={40}
                      className="np-connects__avatar"
                    />
                  ) : (
                    <span className="np-connects__fallback" aria-hidden>
                      {person.displayName.charAt(0)}
                    </span>
                  )}
                  <span className="np-connects__online" title="Online" aria-hidden />
                </span>
                <span className="np-connects__name">{person.displayName}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link to="/messages" className="np-rail-foot-link">
        Open messages →
      </Link>
    </section>
  )
}
