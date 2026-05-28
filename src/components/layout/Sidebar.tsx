import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useShell } from '@/context/ShellContext'
import { isNavActive } from '@/lib/nav/routeModes'
import { SIDEBAR_NAV } from '@/lib/nav/sidebar'
import { IosBrandLockup } from '@/components/layout/IosBrandLockup'

type Props = {
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: Props) {
  const { pathname } = useLocation()
  const { meta } = useShell()

  return (
    <aside
      className={clsx(
        'v2-sidebar relative flex h-full shrink-0 flex-col',
        className,
      )}
    >
      <div className="v2-sidebar-brand border-b border-border/80">
        <IosBrandLockup to="/" onClick={onNavigate} variant="frame" size="md" />
      </div>

      <nav className="v2-sidebar-nav" aria-label="Site navigation">
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
                      onClick={onNavigate}
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
                'linear-gradient(165deg, rgba(212,0,0,0.35) 0%, transparent 45%), linear-gradient(to top, #0a0a0a 0%, transparent 55%), url(https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&q=80)',
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
