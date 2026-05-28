import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import type { User } from '@/lib/auth/types'
import { roleLabel } from '@/lib/auth/roles'
import { IOSImage } from '@/components/ui/IOSImage'

export type DeskQuickTile = {
  label: string
  value: string | number
  onClick?: () => void
  accent?: boolean
}

export type DeskNavItem<T extends string> = {
  id: T
  label: string
  badge?: number
}

export type DeskNavGroup<T extends string> = {
  title: string
  items: DeskNavItem<T>[]
}

type Props<T extends string> = {
  user: User
  mode: string
  kicker: string
  title: string
  summary: string
  badge?: ReactNode
  tab: T
  onTabChange: (tab: T) => void
  navGroups: DeskNavGroup<T>[]
  quickTiles?: DeskQuickTile[]
  onLogout: () => void
  headerExtra?: ReactNode
  children: ReactNode
  rootClassName?: string
}

export function RoleDeskLayout<T extends string>({
  user,
  mode,
  kicker,
  title,
  summary,
  badge,
  tab,
  onTabChange,
  navGroups,
  quickTiles = [],
  onLogout,
  headerExtra,
  children,
  rootClassName,
}: Props<T>) {
  return (
    <div className={clsx('editor-dashboard role-desk', rootClassName)}>
      <div className="editor-dashboard-inner">
        <header className="editor-dashboard-header">
          <div className="editor-dashboard-header-main">
            <p className="editor-dashboard-kicker">
              {kicker}
              {mode === 'supabase' && (
                <span className="editor-dashboard-kicker-live">· live cloud</span>
              )}
            </p>
            <h1 className="editor-dashboard-title">{title}</h1>
            <p className="editor-dashboard-summary">{summary}</p>
            <div className="editor-dashboard-identity">
              {user.avatarUrl ? (
                <IOSImage
                  src={user.avatarUrl}
                  alt=""
                  width={40}
                  className="editor-dashboard-avatar"
                />
              ) : (
                <span className="editor-dashboard-avatar editor-dashboard-avatar-fallback">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <p className="editor-dashboard-identity-name">
                  {user.name}
                  {user.username && (
                    <span className="text-mh-red"> @{user.username}</span>
                  )}
                </p>
                <p className="editor-dashboard-identity-meta">
                  {user.email} · {roleLabel(user.role)}
                </p>
              </div>
              {badge}
            </div>
          </div>
          <div className="editor-dashboard-header-actions">
            {headerExtra}
            <Link to="/community#feed" className="ios-btn ios-btn-ghost !text-xs !py-2">
              Network feed
            </Link>
            <Link to="/" className="ios-btn ios-btn-ghost !text-xs !py-2">
              Site
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="ios-btn ios-btn-secondary !text-xs !py-2"
            >
              Logout
            </button>
          </div>
        </header>

        {quickTiles.length > 0 && (
          <section className="desk-quick-strip" aria-label="Desk quick metrics">
            {quickTiles.map((tile) => {
              const inner = (
                <>
                  <span
                    className={clsx(
                      'desk-quick-value',
                      tile.accent && 'desk-quick-value-accent',
                    )}
                  >
                    {tile.value}
                  </span>
                  <span className="desk-quick-label">{tile.label}</span>
                </>
              )
              return tile.onClick ? (
                <button
                  key={tile.label}
                  type="button"
                  className={clsx('desk-quick-tile', tile.accent && 'desk-quick-tile-accent')}
                  onClick={tile.onClick}
                >
                  {inner}
                </button>
              ) : (
                <div
                  key={tile.label}
                  className={clsx('desk-quick-tile desk-quick-tile-static', tile.accent && 'desk-quick-tile-accent')}
                >
                  {inner}
                </div>
              )
            })}
          </section>
        )}

        <div className="desk-layout">
          <aside className="desk-nav" aria-label="Desk sections">
            {navGroups.map((group) => (
              <div key={group.title} className="desk-nav-group">
                <p className="desk-nav-group-title">{group.title}</p>
                <ul className="desk-nav-list">
                  {group.items.map((item) => {
                    const active = tab === item.id
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onTabChange(item.id)}
                          className={clsx('desk-nav-btn', active && 'desk-nav-btn-active')}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.badge != null && item.badge > 0 && (
                            <span className="desk-nav-badge">{item.badge}</span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </aside>

          <div className="desk-content">{children}</div>
        </div>
      </div>
    </div>
  )
}
