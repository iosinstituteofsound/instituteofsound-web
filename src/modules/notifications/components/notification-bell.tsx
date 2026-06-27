import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AtSign, Bell, MessageCircle, Music2, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useNotifications } from '@/modules/notifications/hooks/use-notifications'
import { useNotificationLiveStore } from '@/modules/notifications/store/notification-live-store'
import type { NotificationDto, NotificationKind } from '@/modules/notifications/types/notification.types'
import { useHeaderPopoverPosition } from '@/shared/hooks/use-header-popover-position'
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
  if (notification.data.feedItemId) {
    const base = `/feed/${notification.data.feedItemId}`
    return notification.data.commentId ? `${base}#comment-${notification.data.commentId}` : base
  }

  if (notification.kind === 'follow' && notification.data.actorUserId) {
    return `/profile/${notification.data.actorUserId}`
  }

  if (notification.data.releaseId) {
    return `/releases/${notification.data.releaseId}`
  }

  if (notification.data.threadId) {
    return `/messenger?t=${notification.data.threadId}`
  }

  if (notification.kind.startsWith('track_')) {
    return '/artist/analytics'
  }

  return undefined
}

function notificationIcon(kind: NotificationKind) {
  switch (kind) {
    case 'follow':
      return UserPlus
    case 'post_comment':
    case 'comment_reply':
      return MessageCircle
    case 'mention':
      return AtSign
    case 'dm_message':
    case 'dm_request':
    case 'dm_request_accepted':
      return MessageCircle
    default:
      return Music2
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelStyle = useHeaderPopoverPosition(open, triggerRef, {
    width: 360,
    maxHeight: 420,
    minHeight: 180,
  })

  const { isLoading, markRead, markAllRead, isMarkingRead, refetch } = useNotifications()
  const unreadCount = useNotificationLiveStore((s) => s.unreadCount)
  const items = useNotificationLiveStore((s) => s.items)
  const liveReady = useNotificationLiveStore((s) => s.ready)

  useEffect(() => {
    if (open) void refetch()
  }, [open, refetch])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
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

  const panel = open ? (
    <div
      ref={panelRef}
      className="ios-notification-bell__panel"
      style={panelStyle}
      role="dialog"
      aria-label="Notifications"
    >
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

      {isLoading && !liveReady ? <p className="ios-notification-bell__empty">Loading…</p> : null}

      {!isLoading && liveReady && items.length === 0 ? (
        <p className="ios-notification-bell__empty">No notifications yet.</p>
      ) : null}

      <ul className="ios-notification-bell__list">
        {items.map((item) => {
          const href = notificationHref(item)
          const Icon = notificationIcon(item.kind)
          const avatarUrl = item.data.actorAvatarUrl
          const content = (
            <>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="ios-notification-bell__avatar"
                  width={32}
                  height={32}
                />
              ) : (
                <span className="ios-notification-bell__icon" aria-hidden>
                  <Icon size={16} />
                </span>
              )}
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
  ) : null

  return (
    <div className="ios-notification-bell" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={cn('dashboard-header-utility ios-notification-bell__trigger', open && 'is-open')}
        aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="ios-notification-bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        ) : null}
      </button>

      {panel ? createPortal(panel, document.body) : null}
    </div>
  )
}
