import { useEffect, useRef, useState } from 'react'
import { Bell, Music2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotifications } from '@/modules/notifications/hooks/use-notifications'
import type { NotificationDto } from '@/modules/notifications/types/notification.types'
import { cn } from '@/shared/lib/cn'
import '@/modules/notifications/styles/notification-bell.css'

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function notificationHref(notification: NotificationDto): string | undefined {
  if (notification.data.releaseId) {
    return `/releases/${notification.data.releaseId}`
  }
  if (notification.kind.startsWith('track_')) {
    return '/artist/analytics'
  }
  return undefined
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const { data, isLoading, markRead, markAllRead, isMarkingRead } = useNotifications()

  const unreadCount = data?.unreadCount ?? 0
  const items = data?.items ?? []

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="ios-notification-bell" ref={panelRef}>
      <button
        type="button"
        className="dashboard-header-utility ios-notification-bell__trigger"
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="ios-notification-bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        ) : null}
      </button>

      {open ? (
        <div className="ios-notification-bell__panel" role="dialog" aria-label="Notifications">
          <div className="ios-notification-bell__head">
            <p className="ios-notification-bell__title">Notifications</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                className="ios-notification-bell__mark-all"
                disabled={isMarkingRead}
                onClick={() => markAllRead()}
              >
                Mark all read
              </button>
            ) : null}
          </div>

          {isLoading ? <p className="ios-notification-bell__empty">Loading…</p> : null}

          {!isLoading && items.length === 0 ? (
            <p className="ios-notification-bell__empty">No notifications yet.</p>
          ) : null}

          <ul className="ios-notification-bell__list">
            {items.map((item) => {
              const href = notificationHref(item)
              const content = (
                <>
                  <span className="ios-notification-bell__icon" aria-hidden>
                    <Music2 size={16} />
                  </span>
                  <span className="ios-notification-bell__copy">
                    <span className="ios-notification-bell__item-title">{item.title}</span>
                    <span className="ios-notification-bell__item-body">{item.body}</span>
                    <span className="ios-notification-bell__item-time">{formatRelativeTime(item.createdAt)}</span>
                  </span>
                </>
              )

              return (
                <li key={item.id}>
                  {href ? (
                    <Link
                      to={href}
                      className={cn('ios-notification-bell__item', !item.readAt && 'is-unread')}
                      onClick={() => {
                        if (!item.readAt) markRead(item.id)
                        setOpen(false)
                      }}
                    >
                      {content}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={cn('ios-notification-bell__item', !item.readAt && 'is-unread')}
                      onClick={() => {
                        if (!item.readAt) markRead(item.id)
                      }}
                    >
                      {content}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
