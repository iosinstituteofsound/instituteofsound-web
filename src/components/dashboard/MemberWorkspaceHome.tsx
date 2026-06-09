import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '@/lib/auth/types'
import type { DashboardPersona } from '@/lib/auth/types'
import { IOSImage } from '@/components/ui/IOSImage'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { RankBadge } from '@/components/ui/RankBadge'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { MwsProgressRing } from '@/components/dashboard/memberDeskUi'

type PersonaPanel = {
  badge: string
  heading: string
  summary: string
  priorities: string[]
  workflow: { stage: string; objective: string }[]
  toolkit: string[]
  actions: { to: string; label: string; primary?: boolean }[]
}

type Props = {
  user: User
  persona: DashboardPersona | null | undefined
  personaTitle: string
  personaPanel: PersonaPanel | null
  onOpenUpgradePaths: () => void
  onResetPersona: () => void
  savingPersona: boolean
  personaError: string
  children?: ReactNode
}

export function MemberWorkspaceHome({
  user,
  persona,
  personaTitle,
  personaPanel,
  onOpenUpgradePaths,
  onResetPersona,
  savingPersona,
  personaError,
  children,
}: Props) {
  const { stats, loading } = useCommunityMemberStats()
  const handle = memberHandleFromUser(user)

  return (
    <div className="member-workspace-home">
      <div className="mws-hero">
        <div className="mws-hero-main">
          {user.avatarUrl ? (
            <IOSImage src={user.avatarUrl} alt="" width={88} className="mws-avatar" />
          ) : (
            <span className="mws-avatar mws-avatar-fallback" aria-hidden>
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="mws-eyebrow">Workspace home</p>
            <h2 className="mws-title">{user.name}</h2>
            <p className="mws-tagline">
              {persona
                ? `${personaTitle} workspace is active — spins, scenes, collab, and gigs in one shell.`
                : 'Start from the network feed, then open upgrade paths when you are ready to grow.'}
            </p>
            <div className="mws-role">
              <span className="mws-role-dot" aria-hidden />
              <span className="mws-role-label">Mode</span>
              <span className="mws-role-value">{persona ? personaTitle : 'Member'}</span>
            </div>
          </div>
        </div>

        <div className="mws-hero-stats">
          {loading && !stats ? (
            <LoadingTransmission variant="compact" />
          ) : stats ? (
            <>
              <div className="mws-stat-card">
                <p className="mws-stat-label">dB balance</p>
                <p className="mws-stat-value">{stats.totalDb.toLocaleString()}</p>
                <p className="mws-stat-delta">+{stats.weeklyDb.toLocaleString()} this week</p>
              </div>
              <div className="mws-stat-card mws-stat-card--rank">
                <p className="mws-stat-label">Rank</p>
                <div className="mws-rank-row">
                  <span className="mws-rank-emblem">
                    <RankBadge rank={stats.rank} size="sm" />
                  </span>
                  <div>
                    <p className="mws-rank-title">{stats.rank}</p>
                    <p className="mws-rank-meta">@{handle}</p>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {!persona && (
        <div className="mws-next-move">
          <div>
            <p className="mws-eyebrow">Next move</p>
            <h3 className="mws-next-move-title">Open upgrade paths</h3>
            <p className="mws-next-move-lede">
              Artist page, editor desk, playlist curator, manager, label, brand, or promoter — pick
              when you are ready.
            </p>
            <div className="mws-next-move-cta">
              <button type="button" className="ios-btn ios-btn-primary" onClick={onOpenUpgradePaths}>
                Upgrade paths →
              </button>
            </div>
          </div>
          <ol className="mws-steps">
            {[
              { label: 'Feed', hint: 'Post & react' },
              { label: 'Explore', hint: 'Scenes & tools' },
              { label: 'Apply', hint: 'Pick a path' },
              { label: 'Verify', hint: 'Desk review' },
            ].map((step) => (
              <li key={step.label} className="mws-step">
                <span className="mws-step-icon" aria-hidden>
                  ◆
                </span>
                <span className="mws-step-label">{step.label}</span>
                <span className="mws-step-hint">{step.hint}</span>
                <span className="mws-step-arrow" aria-hidden />
              </li>
            ))}
          </ol>
        </div>
      )}

      {stats && (
        <>
          <h3 className="mws-section-title">Desk pulse</h3>
          <div className="mws-metrics">
            <article className="mws-metric-card">
              <p className="mws-metric-label">Profile wire</p>
              <MwsProgressRing pct={persona ? 85 : 55} />
              <Link to={`/network/${handle}`} className="mws-metric-link">
                Public profile →
              </Link>
            </article>
            <article className="mws-metric-card">
              <p className="mws-metric-label">dB balance</p>
              <p className="mws-metric-value">{stats.totalDb.toLocaleString()}</p>
              <p className="mws-metric-delta">+{stats.weeklyDb.toLocaleString()} week</p>
            </article>
            <article className="mws-metric-card">
              <p className="mws-metric-label">Network rank</p>
              <p className="mws-metric-value">{stats.rank}</p>
              <p className="mws-metric-meta">@{handle}</p>
            </article>
            <article className="mws-metric-card">
              <p className="mws-metric-label">Primary scene</p>
              <p className="mws-metric-value">{stats.primaryGenreSlug ?? 'Open'}</p>
              <p className="mws-metric-meta">Tribe hub</p>
            </article>
            <article className="mws-metric-card">
              <p className="mws-metric-label">Wire status</p>
              <p className="mws-metric-value">Live</p>
              <p className="mws-metric-meta">{persona ? personaTitle : 'Member mode'}</p>
            </article>
          </div>
        </>
      )}

      <h3 className="mws-section-title">Quick actions</h3>
      <div className="mws-quick-grid">
        <Link to="/community#feed" className="mws-quick-card">
          <span className="mws-quick-icon" aria-hidden>
            ◆
          </span>
          <span className="mws-quick-copy">
            <span className="mws-quick-verb">Network</span>
            <span className="mws-quick-title">Open feed</span>
          </span>
        </Link>
        <Link to={`/network/${handle}`} className="mws-quick-card">
          <span className="mws-quick-icon" aria-hidden>
            ◆
          </span>
          <span className="mws-quick-copy">
            <span className="mws-quick-verb">Profile</span>
            <span className="mws-quick-title">@{handle}</span>
          </span>
        </Link>
        <button type="button" className="mws-quick-card" onClick={onOpenUpgradePaths}>
          <span className="mws-quick-icon" aria-hidden>
            ◆
          </span>
          <span className="mws-quick-copy">
            <span className="mws-quick-verb">Growth</span>
            <span className="mws-quick-title">Upgrade paths</span>
          </span>
        </button>
      </div>

      {personaPanel && (
        <section className="member-desk-panel member-dashboard-persona-active">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="member-desk-kicker">{personaPanel.badge}</p>
            <span className="member-desk-meta">Workspace mode is active for this account.</span>
          </div>
          <h2 className="member-desk-heading">{personaPanel.heading}</h2>
          <p className="member-desk-lede">{personaPanel.summary}</p>
          <ul className="member-dashboard-persona-list mt-5">
            {personaPanel.priorities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="member-dashboard-workbench mt-6">
            <article className="member-dashboard-workbench-card">
              <h3>Workflow board</h3>
              <div className="member-dashboard-workflow-list mt-4">
                {personaPanel.workflow.map((step) => (
                  <div key={step.stage} className="member-dashboard-workflow-item">
                    <p className="member-dashboard-workflow-stage">{step.stage}</p>
                    <p>{step.objective}</p>
                  </div>
                ))}
              </div>
            </article>
            <article className="member-dashboard-workbench-card">
              <h3>Toolkit focus</h3>
              <ul className="member-dashboard-toolkit-list mt-4">
                {personaPanel.toolkit.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>
          <div className="member-desk-actions">
            {personaPanel.actions.map((action) => (
              <Link
                key={action.to + action.label}
                to={action.to}
                className={action.primary ? 'ios-btn ios-btn-primary' : 'ios-btn ios-btn-secondary'}
              >
                {action.label} →
              </Link>
            ))}
            <button type="button" className="ios-btn ios-btn-secondary" onClick={onOpenUpgradePaths}>
              More upgrade paths →
            </button>
            <button
              type="button"
              className="ios-btn ios-btn-ghost"
              onClick={onResetPersona}
              disabled={savingPersona}
            >
              Reset and start over
            </button>
          </div>
          <p className="member-desk-footnote">
            Reset clears your workspace mode. Pick a new path from Upgrade paths.
          </p>
          {personaError && <p className="text-mh-red text-sm mt-4">{personaError}</p>}
        </section>
      )}

      {children}
    </div>
  )
}
