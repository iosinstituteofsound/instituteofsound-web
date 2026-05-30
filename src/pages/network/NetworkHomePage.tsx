import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { networkProfilePath } from '@/lib/community/networkPaths'
import {
  fetchPendingConnectionRequests,
  respondConnectionRequest,
  NETWORK_CONNECTION_EVENT,
} from '@/lib/network/connectionService'
import type { NetworkPendingRequest } from '@/lib/network/connectionTypes'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { useDmUnread } from '@/hooks/useDmUnread'
import { fetchUnreadNotificationCount } from '@/lib/community/notificationService'
import { RankBadge } from '@/components/ui/RankBadge'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'
import { useSeo } from '@/hooks/useSeo'

export default function NetworkHomePage() {
  const { user } = useAuth()
  const { stats, loading: statsLoading } = useCommunityMemberStats()
  const dmUnread = useDmUnread()
  const [notifUnread, setNotifUnread] = useState(0)
  const [requests, setRequests] = useState<NetworkPendingRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)

  useSeo({
    title: 'Network',
    description: 'Your Institute of Sound network — connections, feed, and messages.',
    canonicalPath: '/network',
  })

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true)
    try {
      setRequests(await fetchPendingConnectionRequests())
      setNotifUnread(await fetchUnreadNotificationCount(user?.id))
    } catch {
      setRequests([])
    } finally {
      setRequestsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void loadRequests()
    const onChange = () => void loadRequests()
    window.addEventListener(NETWORK_CONNECTION_EVENT, onChange)
    return () => window.removeEventListener(NETWORK_CONNECTION_EVENT, onChange)
  }, [loadRequests])

  const handle = user ? memberHandleFromUser(user) : ''

  return (
    <div className="network-home">
      <header className="network-home-hero ios-card">
        <p className="network-kicker">The network</p>
        <h1 className="network-home-title">Operator home</h1>
        <p className="network-home-lede">
          Connect with artists, editors, and members. Post on the feed, message your circle, and
          grow your signal.
        </p>

        {statsLoading && !stats ? (
          <LoadingTransmission variant="compact" />
        ) : stats ? (
          <div className="network-home-stats">
            <RankBadge rank={stats.rank} size="md" />
            <div>
              <p className="network-home-db">{stats.totalDb.toLocaleString()} dB</p>
              <p className="text-xs text-muted">{stats.weeklyDb.toLocaleString()} this week</p>
            </div>
            {handle && (
              <Link to={networkProfilePath(handle)} className="network-home-profile-link">
                @{handle} →
              </Link>
            )}
          </div>
        ) : null}

        <div className="network-home-quick">
          <Link to="/feed" className="network-quick-tile">
            <span className="network-quick-label">Feed</span>
            <span className="network-quick-hint">Spins & drops</span>
          </Link>
          <Link to="/network/people" className="network-quick-tile">
            <span className="network-quick-label">People</span>
            <span className="network-quick-hint">Find operators</span>
          </Link>
          <Link to="/messages" className="network-quick-tile">
            <span className="network-quick-label">Messages</span>
            {dmUnread > 0 && <span className="network-quick-badge">{dmUnread}</span>}
          </Link>
          <Link to="/community#feed" className="network-quick-tile">
            <span className="network-quick-label">Community</span>
            <span className="network-quick-hint">Tribes & crews</span>
          </Link>
        </div>
      </header>

      <section className="network-home-section ios-card">
        <div className="network-section-head">
          <h2 className="network-section-title">Connection requests</h2>
          {notifUnread > 0 && (
            <span className="network-section-meta">{notifUnread} alerts in bell</span>
          )}
        </div>

        {requestsLoading ? (
          <LoadingTransmission variant="compact" />
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted py-6 border border-dashed border-border text-center">
            No pending requests. Discover people and send a connect invite.
          </p>
        ) : (
          <ul className="network-request-list">
            {requests.map((req) => (
              <li key={req.requestId} className="network-request-item">
                <Link to={networkProfilePath(req.fromHandle)} className="network-request-who">
                  {req.fromAvatarUrl ? (
                    <IOSImage
                      src={req.fromAvatarUrl}
                      alt=""
                      width={48}
                      className="network-request-avatar"
                    />
                  ) : (
                    <span className="network-request-fallback">{req.fromName.charAt(0)}</span>
                  )}
                  <span>
                    <strong>{req.fromName}</strong>
                    <span className="text-xs text-muted font-mono">@{req.fromHandle}</span>
                  </span>
                </Link>
                <div className="network-request-actions">
                  <button
                    type="button"
                    className="network-connect-btn network-connect-btn--primary network-connect-btn--sm"
                    onClick={() =>
                      void respondConnectionRequest(req.requestId, true).then(() => loadRequests())
                    }
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="network-connect-btn network-connect-btn--ghost network-connect-btn--sm"
                    onClick={() =>
                      void respondConnectionRequest(req.requestId, false).then(() => loadRequests())
                    }
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link to="/network/people" className="network-section-cta">
          Find people to connect →
        </Link>
      </section>
    </div>
  )
}
