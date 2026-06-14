import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '@/lib/auth/types'
import { IOSImage } from '@/components/ui/IOSImage'
import { RankEmblem } from '@/components/ui/RankEmblem'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import {
  fetchMemberConnections,
  fetchPublicMemberProfile,
  memberHandleFromUser,
  type MemberConnectionProfile,
  type PublicMemberProfile,
} from '@/lib/community/memberProfileService'
import { fetchUpcomingEvents } from '@/lib/events/service'
import {
  communityActivityLabel,
  memberProfileCompletion,
  rankEmblemForCommunityRank,
  rankMetaLine,
  workspaceRoleLabel,
} from '@/lib/dashboard/workspaceHome'

type Props = {
  user: User
  onOpenGrow: () => void
}

const QUICK_ACTIONS = [
  { verb: 'Explore', title: 'New Releases', href: '/discover', icon: 'plus' },
  { verb: 'Find', title: 'Artists', href: '/network/people', icon: 'users' },
  { verb: 'Explore', title: 'Events', href: '/events', icon: 'calendar' },
  { verb: 'Play', title: 'Curated Playlists', href: '/playlists', icon: 'wave' },
  { verb: 'Open', title: 'Studio Toolkit', href: '/tools', icon: 'tools' },
  { verb: 'Continue', title: 'Academy', href: '/academy', icon: 'academy' },
] as const

const NEXT_MOVE_STEPS = [
  { label: 'Engage', hint: 'Join the community', icon: 'user' },
  { label: 'Collaborate', hint: 'Work with others', icon: 'folder' },
  { label: 'Create', hint: 'Share your sound', icon: 'wave' },
  { label: 'Level Up', hint: 'Unlock new ranks', icon: 'flag' },
] as const

function DeskIcon({ name }: { name: string }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75 }
  switch (name) {
    case 'plus':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
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
    case 'calendar':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      )
    case 'wave':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" strokeLinecap="round" />
        </svg>
      )
    case 'tools':
      return (
        <svg {...common} aria-hidden>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      )
    case 'academy':
      return (
        <svg {...common} aria-hidden>
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />
        </svg>
      )
    case 'user':
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      )
    case 'folder':
      return (
        <svg {...common} aria-hidden>
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
      )
    case 'flag':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 21V4M4 4h11l-2 4 2 4H4" />
        </svg>
      )
    case 'chevron':
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return null
  }
}

function Sparkline() {
  return (
    <svg className="mws-sparkline" viewBox="0 0 120 28" preserveAspectRatio="none" aria-hidden>
      <polyline
        points="0,22 12,18 24,20 36,12 48,14 60,8 72,10 84,6 96,12 108,4 120,8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ProgressRing({ value }: { value: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <svg className="mws-ring" viewBox="0 0 64 64" aria-hidden>
      <circle className="mws-ring-track" cx="32" cy="32" r={r} />
      <circle
        className="mws-ring-fill"
        cx="32"
        cy="32"
        r={r}
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
      <text x="32" y="36" textAnchor="middle" className="mws-ring-text">
        {value}%
      </text>
    </svg>
  )
}

export function MemberWorkspaceHome({ user, onOpenGrow }: Props) {
  const firstName = user.name.split(' ')[0] ?? user.name
  const handle = memberHandleFromUser(user)
  const profilePath = `/network/${handle}`
  const profileCompletion = memberProfileCompletion(user)

  const { stats, loading: statsLoading } = useCommunityMemberStats()
  const [profile, setProfile] = useState<PublicMemberProfile | null>(null)
  const [connections, setConnections] = useState<MemberConnectionProfile[]>([])
  const [upcomingRsvps, setUpcomingRsvps] = useState(0)
  const [networkLoading, setNetworkLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setNetworkLoading(true)
    void (async () => {
      try {
        const [publicProfile, followers, events] = await Promise.all([
          fetchPublicMemberProfile(handle),
          fetchMemberConnections(handle, 'followers', 4),
          fetchUpcomingEvents({}, 40, user.id),
        ])
        if (cancelled) return
        setProfile(publicProfile)
        setConnections(followers)
        setUpcomingRsvps(events.filter((e) => e.viewerRsvped).length)
      } finally {
        if (!cancelled) setNetworkLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [handle, user.id])

  const emblem = stats ? rankEmblemForCommunityRank(stats.rank) : null
  const activity = communityActivityLabel(stats?.weeklyDb ?? 0, profile?.postCount ?? 0)
  const networkCount =
    profile?.connectionCount ?? profile?.followerCount ?? connections.length ?? 0
  const discoverPct = stats?.rankProgressPct ?? 0

  return (
    <div className="member-workspace-home">
      <header className="mws-hero">
        <div className="mws-hero-main">
          {user.avatarUrl ? (
            <IOSImage src={user.avatarUrl} alt="" width={88} className="mws-avatar" />
          ) : (
            <span className="mws-avatar mws-avatar-fallback">{user.name.charAt(0).toUpperCase()}</span>
          )}
          <div className="mws-hero-copy">
            <p className="mws-eyebrow">Welcome back,</p>
            <h2 className="mws-title">{user.name}</h2>
            <p className="mws-tagline">Your sound. Your network. Your movement.</p>
            <div className="mws-role">
              <span className="mws-role-dot" aria-hidden />
              <span className="mws-role-label">Role</span>
              <span className="mws-role-value">{workspaceRoleLabel(user.authorization)}</span>
            </div>
          </div>
        </div>

        <div className="mws-hero-stats">
          {statsLoading && !stats ? (
            <LoadingTransmission variant="compact" />
          ) : stats ? (
            <>
              <article className="mws-stat-card">
                <p className="mws-stat-label">Network dB Score</p>
                <p className="mws-stat-value">{stats.totalDb.toLocaleString()} dB</p>
                <p className="mws-stat-delta">
                  {stats.weeklyDb > 0 ? '+' : ''}
                  {stats.weeklyDb.toLocaleString()} dB this week
                </p>
                <Sparkline />
              </article>
              <article className="mws-stat-card mws-stat-card--rank">
                <p className="mws-stat-label">Current Rank</p>
                <div className="mws-rank-row">
                  {emblem ? (
                    <RankEmblem
                      tier={emblem.tier}
                      level={emblem.level}
                      size="lg"
                      className="mws-rank-emblem"
                    />
                  ) : null}
                  <div>
                    <p className="mws-rank-title">{stats.rank}</p>
                    <p className="mws-rank-meta">
                      {rankMetaLine(
                        stats.rank,
                        stats.rankProgressPct,
                        stats.nextRank,
                        stats.dbToNextRank,
                      )}
                    </p>
                  </div>
                </div>
              </article>
            </>
          ) : null}
        </div>
      </header>

      <section className="mws-section" aria-labelledby="mws-quick-actions">
        <h3 id="mws-quick-actions" className="mws-section-title">
          Quick Actions
        </h3>
        <div className="mws-quick-grid">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.title} to={action.href} className="mws-quick-card">
              <span className="mws-quick-icon">
                <DeskIcon name={action.icon} />
              </span>
              <span className="mws-quick-copy">
                <span className="mws-quick-verb">{action.verb}</span>
                <span className="mws-quick-title">{action.title}</span>
              </span>
              <DeskIcon name="chevron" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mws-next-move" aria-labelledby="mws-next-move-title">
        <div className="mws-next-move-copy">
          <p className="mws-eyebrow">Your Next Move</p>
          <h3 id="mws-next-move-title" className="mws-next-move-title">
            Build your network.
            <br />
            Grow your influence.
          </h3>
          <p className="mws-next-move-lede">
            Engage with the community, collaborate on projects, and level up your rank on IOS.
          </p>
          <button type="button" className="ios-btn ios-btn-primary mws-next-move-cta" onClick={onOpenGrow}>
            See How →
          </button>
        </div>
        <ol className="mws-steps">
          {NEXT_MOVE_STEPS.map((step, i) => (
            <li key={step.label} className="mws-step">
              <span className="mws-step-icon">
                <DeskIcon name={step.icon} />
              </span>
              <span className="mws-step-label">{step.label}</span>
              <span className="mws-step-hint">{step.hint}</span>
              {i < NEXT_MOVE_STEPS.length - 1 && <span className="mws-step-arrow" aria-hidden />}
            </li>
          ))}
        </ol>
      </section>

      <section className="mws-metrics" aria-label="Workspace metrics">
        <article className="mws-metric-card">
          <p className="mws-metric-label">Profile Completion</p>
          <ProgressRing value={profileCompletion} />
          <Link to={profilePath} className="mws-metric-link">
            {profileCompletion >= 100 ? 'View profile →' : 'Complete your profile →'}
          </Link>
        </article>
        <article className="mws-metric-card">
          <p className="mws-metric-label">Network Strength</p>
          <div className="mws-avatars" aria-hidden>
            {connections.length > 0
              ? connections.slice(0, 4).map((c) => (
                  <span key={c.userId} className="mws-mini-avatar inline-flex items-center justify-center overflow-hidden text-[10px] font-bold">
                    {c.avatarUrl ? (
                      <IOSImage src={c.avatarUrl} alt="" width={24} height={24} className="!w-full !h-full object-cover" />
                    ) : (
                      c.displayName.charAt(0).toUpperCase()
                    )}
                  </span>
                ))
              : [1, 2, 3, 4].map((n) => <span key={n} className="mws-mini-avatar" />)}
          </div>
          <p className="mws-metric-value">
            {networkLoading ? '—' : networkCount.toLocaleString()}
          </p>
          <p className="mws-metric-delta">
            {profile?.followerCount != null
              ? `${profile.followerCount.toLocaleString()} followers on IOS`
              : 'Grow your circle on the network'}
          </p>
        </article>
        <article className="mws-metric-card">
          <p className="mws-metric-label">Community Activity</p>
          <svg className="mws-pulse" viewBox="0 0 80 24" aria-hidden>
            <polyline
              points="0,12 8,12 12,4 16,20 20,8 28,16 32,12 40,12 44,6 48,18 52,10 60,14 64,12 72,12 80,12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <p className="mws-metric-value">{activity.label}</p>
          <p className="mws-metric-meta">{activity.meta}</p>
        </article>
        <article className="mws-metric-card">
          <p className="mws-metric-label">Discover Engagement</p>
          <p className="mws-metric-value mws-metric-value--eye">
            {stats ? `${discoverPct}%` : '—'}
          </p>
          <p className="mws-metric-meta">
            {stats?.nextRank ? `Progress toward ${stats.nextRank}` : 'Network rank progress'}
          </p>
        </article>
        <article className="mws-metric-card">
          <p className="mws-metric-label">Event Participation</p>
          <p className="mws-metric-value mws-metric-value--ticket">
            {networkLoading ? '—' : upcomingRsvps}
          </p>
          <p className="mws-metric-meta">
            {upcomingRsvps === 1 ? 'Upcoming event' : 'Upcoming events'}
          </p>
        </article>
      </section>

      <p className="mws-footnote">
        Hey {firstName} — your workspace is live. Pick a quick action above or open upgrade paths when
        you&apos;re ready to grow.
      </p>
    </div>
  )
}
