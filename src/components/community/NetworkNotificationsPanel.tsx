import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { isEditorStaff } from '@/lib/auth/roles'
import { useCommunityNotifications } from '@/hooks/useCommunityNotifications'
import { notificationActorPath } from '@/lib/community/notificationService'
import type { NotificationKind } from '@/lib/community/localNotifications'
import { IOSImage } from '@/components/ui/IOSImage'

function notificationFallbackIcon(kind: NotificationKind): string {
  switch (kind) {
    case 'role_verification':
      return '✓'
    case 'rank_up':
      return '▲'
    case 'editorial_publish':
      return '◆'
    case 'collab_response':
    case 'collab_accepted':
      return '⇄'
    case 'dm_message':
      return '✉'
    case 'post_comment':
      return '💬'
    default:
      return '◉'
  }
}

interface NetworkNotificationsPanelProps {
  className?: string
}

export function NetworkNotificationsPanel({ className }: NetworkNotificationsPanelProps) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const deskMode = user && isEditorStaff(user.role)
  const { items, unread, loading, markAllRead, markRead } = useCommunityNotifications()

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const toggle = () => setOpen((v) => !v)

  return (
    <div className={clsx('network-notifications', className)} ref={panelRef}>
      <button
        type="button"
        className="network-notifications-trigger"
        aria-expanded={open}
        aria-label={unread > 0 ? `${unread} unread notifications` : 'Notifications'}
        onClick={toggle}
      >
        <span className="network-notifications-icon" aria-hidden>
          ◉
        </span>
        {unread > 0 && (
          <span className="network-notifications-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="network-notifications-panel ios-card" role="dialog" aria-label="Network notifications">
          <div className="network-notifications-head">
            <p className="network-notifications-kicker">
              {deskMode ? 'Desk alerts' : 'Wire alerts'}
            </p>
            <button
              type="button"
              className="network-notifications-mark"
              onClick={() => void markAllRead()}
            >
              Mark all read
            </button>
          </div>

          {loading && items.length === 0 && (
            <p className="network-notifications-empty">Loading…</p>
          )}

          {!loading && items.length === 0 && (
            <p className="network-notifications-empty">
              {deskMode
                ? 'No desk alerts yet — verification requests and network activity show here.'
                : 'No alerts yet — follows, reactions, and rank-ups show here.'}
            </p>
          )}

          <ul className="network-notifications-list">
            {items.map((n) => {
              const actorPath = notificationActorPath(n)
              const href = n.href ?? actorPath ?? '/community'
              return (
                <li key={n.id}>
                  <Link
                    to={href}
                    className={clsx('network-notifications-item', !n.readAt && 'network-notifications-item-unread')}
                    onClick={() => {
                      if (!n.readAt) void markRead([n.id])
                      setOpen(false)
                    }}
                  >
                    {n.actorAvatarUrl ? (
                      <IOSImage
                        src={n.actorAvatarUrl}
                        alt=""
                        width={36}
                        className="network-notifications-avatar"
                      />
                    ) : (
                      <span className="network-notifications-avatar-fallback" aria-hidden>
                        {notificationFallbackIcon(n.kind)}
                      </span>
                    )}
                    <span className="network-notifications-copy">
                      <strong>{n.title}</strong>
                      {n.body && <span>{n.body}</span>}
                      <time dateTime={n.createdAt}>
                        {new Date(n.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
