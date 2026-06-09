import { Link } from 'react-router-dom'
import type { DashboardPersona } from '@/lib/auth/types'

type Props = {
  onPersonaSelect?: (persona: DashboardPersona) => void
}

const QUICK_ACTIONS: (
  | { type: 'link'; href: string; icon: string; label: string }
  | { type: 'persona'; persona: DashboardPersona; icon: string; label: string }
)[] = [
  { type: 'link', href: '/member/upgrade', icon: 'mic', label: 'Become an Artist' },
  { type: 'link', href: '/editor/apply', icon: 'quill', label: 'Apply as Editor' },
  { type: 'persona', persona: 'artist_manager', icon: 'users', label: 'Apply as Artist Manager' },
  { type: 'persona', persona: 'brand', icon: 'badge', label: 'Apply as Brand' },
  { type: 'persona', persona: 'label', icon: 'doc', label: 'Apply as Label' },
  {
    type: 'persona',
    persona: 'event_promoter',
    icon: 'calendar',
    label: 'Upgrade to Event Promoter',
  },
  {
    type: 'link',
    href: '/member/playlist-curator',
    icon: 'list',
    label: 'Apply for Playlist Curator',
  },
  { type: 'link', href: '/academy', icon: 'academy', label: 'View Academy' },
]

const TIERS = [
  {
    id: 'member',
    title: 'Member',
    role: 'Listener',
    lede: 'Join the movement. Explore. Connect. Engage.',
    icon: 'user',
    status: 'here' as const,
  },
  {
    id: 'artist',
    title: 'Artist',
    role: 'Creator',
    lede: 'Create your studio. Share your sound. Build your audience.',
    icon: 'mic',
    status: 'progress' as const,
    progress: '0/4 steps done',
  },
  {
    id: 'verified',
    title: 'Verified Artist',
    role: 'Established',
    lede: 'Get verified. Gain trust & visibility. Unlock new features.',
    icon: 'shield',
    status: 'locked' as const,
  },
] as const

const BENEFITS = [
  { icon: 'plus', title: 'Create Artist Studio', hint: 'Your own public profile' },
  { icon: 'tools', title: 'Upload & Release', hint: 'Share unlimited music' },
  { icon: 'users', title: 'Fan Network', hint: 'Build your audience' },
  { icon: 'doc', title: 'Editorial Submissions', hint: 'Get featured in IOS' },
  { icon: 'chart', title: 'Analytics Dashboard', hint: 'Track your growth' },
  { icon: 'eye', title: 'More Visibility', hint: 'Boost your reach' },
] as const

const ROADMAP = [
  { label: 'Set up your Artist Studio', state: 'done' as const },
  { label: 'Upload your first release', state: 'todo' as const },
  { label: 'Build your network', state: 'todo' as const },
  { label: 'Get featured or reviewed', state: 'todo' as const },
  { label: 'Get Verified', state: 'goal' as const },
] as const

const WHY_UPGRADE = [
  { icon: 'eye', text: 'More visibility in the IOS ecosystem' },
  { icon: 'star', text: 'Early access to new features' },
  { icon: 'users', text: 'Connect with top creators' },
  { icon: 'badge', text: 'Build your reputation' },
] as const

function PathIcon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
  }
  switch (name) {
    case 'user':
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      )
    case 'mic':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v3" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    case 'quill':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      )
    case 'crown':
      return (
        <svg {...common} aria-hidden>
          <path d="M3 8l3 4 3-6 3 6 3-4 3 4v8H3V8z" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      )
    case 'tools':
      return (
        <svg {...common} aria-hidden>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common} aria-hidden>
          <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
          <circle cx="9" cy="7" r="3" />
          <path d="M22 19v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'doc':
      return (
        <svg {...common} aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...common} aria-hidden>
          <path d="M3 3v18h18" />
          <path d="M7 14l4-4 3 3 5-6" />
        </svg>
      )
    case 'eye':
      return (
        <svg {...common} aria-hidden>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )
    case 'star':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 2l2.9 6.9L22 10l-5.5 4.5L18.5 22 12 18.2 5.5 22l2-7.5L2 10l7.1-1.1L12 2z" />
        </svg>
      )
    case 'badge':
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="8" r="5" />
          <path d="M8 14l-2 8 6-3 6 3-2-8" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      )
    case 'list':
      return (
        <svg {...common} aria-hidden>
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
        </svg>
      )
    case 'academy':
      return (
        <svg {...common} aria-hidden>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />
        </svg>
      )
    case 'lock':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      )
    case 'chevron':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'check':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M5 12l4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'arrow':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
}

function ProgressRing({ value }: { value: number }) {
  const r = 34
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <svg className="mup-progress-ring" viewBox="0 0 88 88" aria-hidden>
      <circle className="mup-progress-track" cx="44" cy="44" r={r} />
      <circle
        className="mup-progress-fill"
        cx="44"
        cy="44"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <text x="44" y="48" textAnchor="middle" className="mup-progress-text">
        {value}%
      </text>
    </svg>
  )
}

export function MemberUpgradePathHome({ onPersonaSelect }: Props) {
  return (
    <div className="member-upgrade-path">
      <header className="mup-header">
        <h2 className="mup-title">
          Your Upgrade <span className="mup-title-accent">Path</span>
        </h2>
        <p className="mup-subtitle">From Listener to Leader. Your journey, your legacy.</p>
      </header>

      <div className="mup-tier-strip" role="list" aria-label="Upgrade tiers">
        {TIERS.map((tier, i) => (
          <div key={tier.id} className="mup-tier-wrap" role="listitem">
            <article
              className={`mup-tier-card${tier.status === 'here' ? ' mup-tier-card--active' : ''}${tier.status === 'locked' ? ' mup-tier-card--locked' : ''}`}
            >
              <span className="mup-tier-icon">
                <PathIcon name={tier.icon} />
              </span>
              <p className="mup-tier-name">{tier.title}</p>
              <p className="mup-tier-role">{tier.role}</p>
              <p className="mup-tier-lede">{tier.lede}</p>
              {tier.status === 'here' && (
                <span className="mup-tier-pill mup-tier-pill--here">You are here</span>
              )}
              {tier.status === 'progress' && (
                <span className="mup-tier-pill">{tier.progress}</span>
              )}
              {tier.status === 'locked' && (
                <span className="mup-tier-pill mup-tier-pill--locked">
                  <PathIcon name="lock" /> Locked
                </span>
              )}
            </article>
            {i < TIERS.length - 1 && (
              <span className="mup-tier-arrow" aria-hidden>
                <PathIcon name="arrow" />
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mup-body">
        <div className="mup-main">
          <section className="mup-next-step" aria-labelledby="mup-next-step-title">
            <div className="mup-next-step-head">
              <span className="mup-next-step-icon">
                <PathIcon name="mic" />
              </span>
              <div>
                <p className="mup-kicker">Next step</p>
                <h3 id="mup-next-step-title" className="mup-next-step-title">
                  Become an Artist
                </h3>
              </div>
            </div>
            <p className="mup-next-step-lede">
              Create your artist studio and start sharing your music with the world.
            </p>

            <p className="mup-benefits-label">Benefits you unlock</p>
            <div className="mup-benefits-grid">
              {BENEFITS.map((item) => (
                <div key={item.title} className="mup-benefit">
                  <span className="mup-benefit-icon">
                    <PathIcon name={item.icon} />
                  </span>
                  <div>
                    <p className="mup-benefit-title">{item.title}</p>
                    <p className="mup-benefit-hint">{item.hint}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mup-next-step-actions">
              <Link to="/member/upgrade" className="ios-btn ios-btn-primary mup-launch-btn">
                Launch Artist Studio →
              </Link>
              <Link to="/member/upgrade" className="mup-learn-link">
                Learn more about Artist Path →
              </Link>
            </div>
          </section>

          <section className="mup-roadmap" aria-labelledby="mup-roadmap-title">
            <h3 id="mup-roadmap-title" className="mup-roadmap-title">
              Upgrade Roadmap
            </h3>
            <ol className="mup-roadmap-list">
              {ROADMAP.map((step) => (
                <li
                  key={step.label}
                  className={`mup-roadmap-item mup-roadmap-item--${step.state}`}
                >
                  <span className="mup-roadmap-marker" aria-hidden>
                    {step.state === 'done' ? (
                      <PathIcon name="check" />
                    ) : step.state === 'goal' ? (
                      <PathIcon name="shield" />
                    ) : (
                      '?'
                    )}
                  </span>
                  <span className="mup-roadmap-label">{step.label}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="mup-sidebar">
          <section className="mup-why" aria-labelledby="mup-why-title">
            <h3 id="mup-why-title" className="mup-sidebar-title">
              Why Upgrade?
            </h3>
            <ul className="mup-why-list">
              {WHY_UPGRADE.map((item) => (
                <li key={item.text}>
                  <span className="mup-why-icon">
                    <PathIcon name={item.icon} />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>
          </section>

          <section className="mup-progress-card" aria-labelledby="mup-progress-title">
            <h3 id="mup-progress-title" className="mup-sidebar-title">
              Your Progress
            </h3>
            <ProgressRing value={25} />
            <p className="mup-progress-label">Overall Progress</p>
            <p className="mup-progress-meta">2 of 8 steps completed</p>
            <button type="button" className="ios-btn ios-btn-secondary mup-progress-btn">
              View Full Progress
            </button>
          </section>

          <section className="mup-quick" aria-labelledby="mup-quick-title">
            <h3 id="mup-quick-title" className="mup-sidebar-title">
              Quick Actions
            </h3>
            <div className="mup-quick-list">
              {QUICK_ACTIONS.map((action) =>
                action.type === 'link' ? (
                  <Link key={action.label} to={action.href} className="mup-quick-link">
                    <PathIcon name={action.icon} />
                    <span>{action.label}</span>
                    <PathIcon name="chevron" />
                  </Link>
                ) : (
                  <button
                    key={action.label}
                    type="button"
                    className="mup-quick-link"
                    onClick={() => onPersonaSelect?.(action.persona)}
                  >
                    <PathIcon name={action.icon} />
                    <span>{action.label}</span>
                    <PathIcon name="chevron" />
                  </button>
                ),
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
