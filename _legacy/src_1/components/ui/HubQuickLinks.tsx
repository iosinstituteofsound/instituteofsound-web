import { Link } from 'react-router-dom'
import clsx from 'clsx'

const HUB_LINKS = [
  { to: '/community', label: 'Network' },
  { to: '/scenes', label: 'Scenes' },
  { to: '/events', label: 'Events' },
  { to: '/collab', label: 'Collab' },
  { to: '/discover', label: 'Artists' },
] as const

interface HubQuickLinksProps {
  className?: string
  /** Hide the current route’s pill */
  activePath?: string
}

export function HubQuickLinks({ className, activePath }: HubQuickLinksProps) {
  return (
    <nav className={clsx('hub-quick-links', className)} aria-label="Quick links">
      {HUB_LINKS.map(({ to, label }) => {
        const active = activePath === to
        return (
          <Link
            key={to}
            to={to}
            className={clsx('hub-quick-link', active && 'hub-quick-link-active')}
            aria-current={active ? 'page' : undefined}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
