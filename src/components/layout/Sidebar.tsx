import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { useShell } from '@/context/ShellContext'
import { isNavActive } from '@/lib/nav/routeModes'
import { SIDEBAR_NAV } from '@/lib/nav/sidebar'

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
      <div className="border-b border-border px-5 py-6">
        <Link to="/" onClick={onNavigate} className="group block">
          <span className="font-display text-[11px] font-extrabold leading-[1.15] tracking-[0.22em] text-signal transition-colors group-hover:text-rs-red">
            INSTITUTE
            <br />
            OF SOUND
          </span>
          <span className="mt-2 block text-[9px] uppercase tracking-[0.35em] text-muted">
            Underground HQ
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {SIDEBAR_NAV.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="mb-2 px-2 font-display text-[9px] font-bold uppercase tracking-[0.28em] text-mh-red/90">
              {group.title}
            </p>
            <ul className="space-y-0.5">
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
                      {item.badge && (
                        <span className="metal-badge !py-0.5 !text-[8px]">{item.badge}</span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="ios-card overflow-hidden">
          <div
            className="h-24 bg-cover bg-center"
            style={{
              backgroundImage:
                'linear-gradient(to top, #0c0c0c, transparent 50%), url(https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&q=80)',
            }}
          />
          <div className="p-4">
            <p className="font-display text-[10px] font-bold uppercase leading-snug tracking-[0.14em] text-signal">
              Culture is built,
              <br />
              not posted
            </p>
            <Link
              to="/register"
              onClick={onNavigate}
              className="ios-btn ios-btn-primary mt-3 w-full !px-3 !py-2.5 !text-[10px]"
            >
              Join the Movement
            </Link>
          </div>
        </div>
        <p className="mt-4 text-center text-[9px] uppercase tracking-[0.2em] text-muted">
          © 2026 Institute of Sound
        </p>
      </div>
    </aside>
  )
}
