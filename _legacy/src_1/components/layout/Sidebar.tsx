import { Link, useLocation } from 'react-router-dom'
import { useNavGate } from '@/hooks/useNavGate'
import clsx from 'clsx'
import { useShell } from '@/context/ShellContext'
import { useAuth } from '@/context/AuthContext'
import { useDmUnread } from '@/hooks/useDmUnread'
import { isNavActive } from '@/lib/nav/routeModes'
import { SIDEBAR_NAV } from '@/lib/nav/sidebar'
import { NETWORK_NAV } from '@/lib/nav/networkNav'
import { fetchUnreadNotificationCount } from '@/lib/community/notificationService'
import { useEffect, useState } from 'react'
import { IosBrandLockup } from '@/components/layout/IosBrandLockup'

type Props = {
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: Props) {
  const { pathname } = useLocation()
  const { meta } = useShell()
  const { user } = useAuth()
  const { guardNavClick } = useNavGate()
  const dmUnread = useDmUnread()
  const [notifUnread, setNotifUnread] = useState(0)

  useEffect(() => {
    if (!user) return
    void fetchUnreadNotificationCount(user.id).then(setNotifUnread)
    const onChange = () => void fetchUnreadNotificationCount(user.id).then(setNotifUnread)
    window.addEventListener('ios-community-notification-change', onChange)
    return () => window.removeEventListener('ios-community-notification-change', onChange)
  }, [user])

  return (
    <aside
      className={clsx(
        'v2-sidebar relative flex h-full min-h-0 max-h-full shrink-0 flex-col',
        className,
      )}
    >
      <div className="v2-sidebar-brand border-b border-border/80">
        <IosBrandLockup to="/" onClick={onNavigate} size="md" />
      </div>

      <nav className="v2-sidebar-nav" aria-label="Site navigation">
        {user && (
          <div className="v2-nav-group">
            <p className="v2-nav-group-title">Network</p>
            <ul className="v2-nav-list">
              {NETWORK_NAV.map((item) => {
                const active =
                  item.href === '/network'
                    ? pathname === '/network'
                    : pathname.startsWith(item.href)
                const badge =
                  item.href === '/messages' && dmUnread > 0
                    ? dmUnread > 9
                      ? '9+'
                      : String(dmUnread)
                    : item.href === '/network' && notifUnread > 0
                      ? notifUnread > 9
                        ? '9+'
                        : String(notifUnread)
                      : undefined
                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={onNavigate}
                      className={clsx('v2-nav-link', active && 'v2-nav-link-active')}
                    >
                      <span>{item.label}</span>
                      {badge && <span className="v2-nav-badge">{badge}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        {SIDEBAR_NAV.map((group) => (
          <div key={group.title} className="v2-nav-group">
            <p className="v2-nav-group-title">{group.title}</p>
            <ul className="v2-nav-list">
              {group.items.map((item) => {
                const active = isNavActive(pathname, item.href, meta.navHref)
                return (
                  <li key={`${group.title}-${item.label}`}>
                    <Link
                      to={item.href}
                      onClick={(e) => {
                        guardNavClick(e, item.href, onNavigate)
                      }}
                      className={clsx('v2-nav-link', active && 'v2-nav-link-active')}
                    >
                      <span>{item.label}</span>
                      {item.badge && <span className="v2-nav-badge">{item.badge}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="v2-sidebar-footer border-t border-border/80">
        <div className="v2-sidebar-promo">
          <div
            className="v2-sidebar-promo-visual"
            style={{
              backgroundImage:
                'linear-gradient(165deg, color-mix(in srgb, var(--color-mh-red) 35%, transparent) 0%, transparent 45%), linear-gradient(to top, var(--color-mh-black) 0%, transparent 55%), url(https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&q=80)',
            }}
          />
          <div className="v2-sidebar-promo-body">
            <p className="v2-sidebar-promo-kicker">Transmission</p>
            <p className="v2-sidebar-promo-quote">
              Culture is built,
              <br />
              not posted
            </p>
            <Link
              to="/register"
              onClick={onNavigate}
              className="ios-btn ios-btn-primary mt-3 w-full !px-3 !py-2.5 !text-xs"
            >
              Join the movement
            </Link>
          </div>
        </div>
        <p className="v2-sidebar-copyright">© 2026 Institute of Sound</p>
      </div>
    </aside>
  )
}
