import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import type { DashboardPersona } from '@/lib/auth/types'

type TierItem = {
  id: string
  name: string
  role: string
  lede: string
  active?: boolean
  locked?: boolean
}

const TIERS: TierItem[] = [
  {
    id: 'member',
    name: 'Member',
    role: 'Network home',
    lede: 'Feed, scenes, collab, and explore — your IOS wire.',
    active: true,
  },
  {
    id: 'artist',
    name: 'Artist',
    role: 'My Studio',
    lede: 'Public page, releases, merch, and editor submissions.',
    locked: true,
  },
  {
    id: 'editor',
    name: 'Editor',
    role: 'Magazine desk',
    lede: 'Features, reviews, and submission curation.',
    locked: true,
  },
  {
    id: 'curator',
    name: 'Curator',
    role: 'Playlist desk',
    lede: 'Verified playlist curation on the network.',
    locked: true,
  },
]

const BENEFITS = [
  { title: 'Artist page', hint: 'Releases, merch, and studio tools' },
  { title: 'Editorial path', hint: 'Magazine desk and submission review' },
  { title: 'Persona workspaces', hint: 'Manager, label, brand, promoter' },
  { title: 'Playlist curator', hint: 'Verified curation after desk review' },
] as const

type Props = {
  persona: DashboardPersona | null | undefined
  children: ReactNode
}

function MupProgressRing({ pct }: { pct: number }) {
  const r = 36
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  return (
    <svg className="mup-progress-ring" viewBox="0 0 88 88" aria-hidden>
      <circle className="mup-progress-track" cx="44" cy="44" r={r} />
      <circle className="mup-progress-fill" cx="44" cy="44" r={r} strokeDasharray={`${dash} ${c}`} />
      <text className="mup-progress-text" x="44" y="48" textAnchor="middle">
        {pct}%
      </text>
    </svg>
  )
}

export function MemberUpgradePathsHome({ persona, children }: Props) {
  const progress = persona ? 72 : 28

  return (
    <div className="member-upgrade-path">
      <header className="mup-header">
        <h2 className="mup-title">
          Upgrade <span className="mup-title-accent">paths</span>
        </h2>
        <p className="mup-subtitle">
          Artist, editor, curator, manager, label, brand, or promoter — pick a path and apply when you
          are ready.
        </p>
      </header>

      <div className="mup-tier-strip" role="list" aria-label="Role tiers">
        {TIERS.map((tier, i) => (
          <div key={tier.id} className="mup-tier-wrap" role="listitem">
            {i > 0 && (
              <span className="mup-tier-arrow" aria-hidden>
                →
              </span>
            )}
            <article
              className={clsx(
                'mup-tier-card',
                tier.active && 'mup-tier-card--active',
                tier.locked && 'mup-tier-card--locked',
              )}
            >
              <span className="mup-tier-icon" aria-hidden>
                ◆
              </span>
              <p className="mup-tier-name">{tier.name}</p>
              <p className="mup-tier-role">{tier.role}</p>
              <p className="mup-tier-lede">{tier.lede}</p>
              <span
                className={clsx(
                  'mup-tier-pill',
                  tier.active ? 'mup-tier-pill--here' : 'mup-tier-pill--locked',
                )}
              >
                {tier.active ? 'You are here' : 'Locked'}
              </span>
            </article>
          </div>
        ))}
      </div>

      <div className="mup-body">
        <div className="mup-main">
          <section className="mup-next-step">
            <p className="mup-kicker">Next step</p>
            <div className="mup-next-step-head">
              <span className="mup-next-step-icon" aria-hidden>
                ◆
              </span>
              <div>
                <h3 className="mup-next-step-title">
                  {persona ? 'Workspace active' : 'Pick your growth path'}
                </h3>
              </div>
            </div>
            <p className="mup-next-step-lede">
              {persona
                ? 'Your persona workspace is live. Open more paths below or continue verification proofs.'
                : 'Start with artist page or editorial desk, or apply for manager, label, brand, promoter, or playlist curator.'}
            </p>
            <p className="mup-benefits-label">What unlocks</p>
            <div className="mup-benefits-grid">
              {BENEFITS.map((b) => (
                <div key={b.title} className="mup-benefit">
                  <span className="mup-benefit-icon" aria-hidden>
                    ◆
                  </span>
                  <div>
                    <p className="mup-benefit-title">{b.title}</p>
                    <p className="mup-benefit-hint">{b.hint}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mup-next-step-actions">
              <Link to="/member/upgrade" className="ios-btn ios-btn-primary mup-launch-btn">
                {persona ? 'More upgrade options →' : 'Start artist page →'}
              </Link>
              <Link to="/editor/join" className="mup-learn-link">
                Learn about the editorial programme →
              </Link>
            </div>
          </section>

          <section className="mup-roadmap">
            <h3 className="mup-roadmap-title">Roadmap</h3>
            <ol className="mup-roadmap-list">
              <li className="mup-roadmap-item mup-roadmap-item--done">
                <span className="mup-roadmap-marker">✓</span>
                <span className="mup-roadmap-label">Join the network</span>
              </li>
              <li className="mup-roadmap-item mup-roadmap-item--done">
                <span className="mup-roadmap-marker">✓</span>
                <span className="mup-roadmap-label">Open member desk</span>
              </li>
              <li
                className={clsx(
                  'mup-roadmap-item',
                  persona ? 'mup-roadmap-item--done' : 'mup-roadmap-item--goal',
                )}
              >
                <span className="mup-roadmap-marker">{persona ? '✓' : '3'}</span>
                <span className="mup-roadmap-label">Pick upgrade path</span>
              </li>
              <li className="mup-roadmap-item">
                <span className="mup-roadmap-marker">4</span>
                <span className="mup-roadmap-label">Submit verification proofs</span>
              </li>
              <li className="mup-roadmap-item mup-roadmap-item--goal">
                <span className="mup-roadmap-marker">★</span>
                <span className="mup-roadmap-label">Launch studio or desk role</span>
              </li>
            </ol>
          </section>
        </div>

        <aside className="mup-sidebar">
          <section className="mup-why">
            <h3 className="mup-sidebar-title">Why upgrade</h3>
            <ul className="mup-why-list">
              {[
                'Public artist pages with releases and merch',
                'Editorial desk access after review',
                'Verified persona workspaces for industry roles',
                'Playlist curator badge on your profile',
              ].map((line) => (
                <li key={line}>
                  <span className="mup-why-icon" aria-hidden>
                    ◆
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </section>

          <section className="mup-progress-card">
            <MupProgressRing pct={progress} />
            <p className="mup-progress-label">Path progress</p>
            <p className="mup-progress-meta">
              {persona ? 'Workspace selected — finish verification' : 'Choose a path to continue'}
            </p>
            <Link to="/member/upgrade" className="ios-btn ios-btn-secondary mup-progress-btn !text-xs">
              View paths →
            </Link>
          </section>

          <section className="mup-quick">
            <h3 className="mup-sidebar-title">Quick links</h3>
            <div className="mup-quick-list">
              {[
                { to: '/member/upgrade', label: 'Artist upgrade' },
                { to: '/editor/apply', label: 'Editor application' },
                { to: '/member/playlist-curator', label: 'Playlist curator' },
                { to: '/community#feed', label: 'Network feed' },
              ].map((link) => (
                <Link key={link.to} to={link.to} className="mup-quick-link">
                  <span aria-hidden>◆</span>
                  <span>{link.label}</span>
                  <span aria-hidden>→</span>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <div className="member-dashboard-paths">{children}</div>
    </div>
  )
}
