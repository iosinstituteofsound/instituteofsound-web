import { Link } from 'react-router-dom'
import clsx from 'clsx'
import type { User } from '@/lib/auth/types'
import { roleLabel } from '@/lib/auth/roles'
import { MetalBadge } from '@/components/ui/MetalBadge'
import { IOSImage } from '@/components/ui/IOSImage'

export type SuperEditorTab =
  | 'analytics'
  | 'preview'
  | 'verification'
  | 'applications'
  | 'queue'
  | 'wire'
  | 'events'
  | 'write'
  | 'drafts'
  | 'network'
  | 'profile'

const NAV_GROUPS: {
  title: string
  items: { id: SuperEditorTab; label: string; badgeKey?: 'pending' | 'drafts' }[]
}[] = [
  {
    title: 'Command',
    items: [
      { id: 'analytics', label: 'Overview' },
      { id: 'preview', label: 'Dashboard preview' },
      { id: 'verification', label: 'Verification queue' },
      { id: 'applications', label: 'Editor applications' },
    ],
  },
  {
    title: 'Editorial desk',
    items: [
      { id: 'queue', label: 'Submission queue', badgeKey: 'pending' },
      { id: 'wire', label: 'Wire picks' },
      { id: 'write', label: 'Write editorial' },
      { id: 'drafts', label: 'My drafts', badgeKey: 'drafts' },
      { id: 'events', label: 'Events board' },
    ],
  },
  {
    title: 'Your account',
    items: [
      { id: 'network', label: 'Network & feed' },
      { id: 'profile', label: 'Editor profile' },
    ],
  },
]

type Props = {
  user: User
  mode: string
  tab: SuperEditorTab
  onTabChange: (tab: SuperEditorTab) => void
  counts: {
    pending: number
    in_review: number
    approved: number
    rejected: number
    drafts: number
  }
  pipelineLabel?: string
  onLogout: () => void
  children: React.ReactNode
}

export function SuperEditorDeskLayout({
  user,
  mode,
  tab,
  onTabChange,
  counts,
  pipelineLabel,
  onLogout,
  children,
}: Props) {
  const badges: Record<'pending' | 'drafts', number> = {
    pending: counts.pending,
    drafts: counts.drafts,
  }

  return (
    <div className="editor-dashboard super-editor-dashboard">
      <div className="editor-dashboard-inner">
        <header className="editor-dashboard-header">
          <div className="editor-dashboard-header-main">
            <p className="editor-dashboard-kicker">
              Editorial command
              {mode === 'supabase' && (
                <span className="editor-dashboard-kicker-live">· live cloud</span>
              )}
            </p>
            <h1 className="editor-dashboard-title">Super editor desk</h1>
            <p className="editor-dashboard-summary">
              Run the magazine pipeline, verify roles, and steer the network — same shell as
              your member and artist dashboards.
            </p>
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
              <MetalBadge variant="live" className="shrink-0">
                Super editor
              </MetalBadge>
            </div>
          </div>
          <div className="editor-dashboard-header-actions">
            <Link to="/community#feed" className="ios-btn ios-btn-ghost !text-xs !py-2">
              Network feed
            </Link>
            <Link to="/features" className="ios-btn ios-btn-ghost !text-xs !py-2">
              Magazine
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

        <section className="super-editor-quick-strip" aria-label="Desk quick metrics">
          <button
            type="button"
            className="super-editor-quick-tile"
            onClick={() => onTabChange('queue')}
          >
            <span className="super-editor-quick-value">{counts.pending}</span>
            <span className="super-editor-quick-label">Pending</span>
          </button>
          <button
            type="button"
            className="super-editor-quick-tile"
            onClick={() => onTabChange('queue')}
          >
            <span className="super-editor-quick-value">{counts.in_review}</span>
            <span className="super-editor-quick-label">In review</span>
          </button>
          <button
            type="button"
            className="super-editor-quick-tile"
            onClick={() => onTabChange('drafts')}
          >
            <span className="super-editor-quick-value">{counts.drafts}</span>
            <span className="super-editor-quick-label">Drafts</span>
          </button>
          <button
            type="button"
            className="super-editor-quick-tile super-editor-quick-tile-accent"
            onClick={() => onTabChange('analytics')}
          >
            <span className="super-editor-quick-value">{pipelineLabel ?? '—'}</span>
            <span className="super-editor-quick-label">Pipeline</span>
          </button>
        </section>

        <div className="super-editor-layout">
          <aside className="super-editor-nav" aria-label="Desk sections">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="super-editor-nav-group">
                <p className="super-editor-nav-group-title">{group.title}</p>
                <ul className="super-editor-nav-list">
                  {group.items.map((item) => {
                    const active = tab === item.id
                    const badge = item.badgeKey ? badges[item.badgeKey] : 0
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => onTabChange(item.id)}
                          className={clsx(
                            'super-editor-nav-btn',
                            active && 'super-editor-nav-btn-active',
                          )}
                        >
                          <span className="truncate">{item.label}</span>
                          {badge > 0 && (
                            <span className="super-editor-nav-badge">{badge}</span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </aside>

          <div className="super-editor-content">{children}</div>
        </div>
      </div>
    </div>
  )
}
