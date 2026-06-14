import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { CollabSkillsEditor } from '@/components/collab/CollabSkillsEditor'

export function DashboardCommunityHub() {
  const { user } = useAuth()
  const { stats, loading } = useCommunityMemberStats()

  if (!user) return null

  const handle = memberHandleFromUser(user)
  const profilePath = `/network/${handle}`

  return (
    <div className="member-feed-activity">
      <header className="mfa-header">
        <h2 className="mfa-title">Feed &amp; activity</h2>
        <p className="mfa-subtitle">
          Post Spins and Drops on the live feed, earn dB, rank up, and show activity on your public
          member profile.
        </p>
      </header>

      {loading && !stats ? (
        <LoadingTransmission variant="compact" />
      ) : stats ? (
        <div className="mfa-stats">
          <article className="mfa-stat">
            <span className="mfa-stat-icon" aria-hidden>
              ◆
            </span>
            <div>
              <p className="mfa-stat-label">dB balance</p>
              <p className="mfa-stat-value">{stats.totalDb.toLocaleString()}</p>
              <p className="mfa-stat-meta">+{stats.weeklyDb.toLocaleString()} this week</p>
            </div>
          </article>
          <article className="mfa-stat">
            <span className="mfa-stat-icon" aria-hidden>
              ◆
            </span>
            <div>
              <p className="mfa-stat-label">Rank</p>
              <p className="mfa-stat-value">{stats.rank}</p>
              <p className="mfa-stat-meta">@{handle}</p>
            </div>
          </article>
          <article className="mfa-stat">
            <span className="mfa-stat-icon" aria-hidden>
              ◆
            </span>
            <div>
              <p className="mfa-stat-label">Tribe</p>
              <p className="mfa-stat-value">{stats.primaryGenreSlug ?? 'Open'}</p>
              <p className="mfa-stat-meta">Primary scene</p>
            </div>
          </article>
        </div>
      ) : (
        <p className="text-sm text-muted">Sign in with cloud auth to sync dB and posts across devices.</p>
      )}

      <div className="mfa-layout">
        <div className="mfa-feed">
          <article className="mfa-feed-card">
            <div className="mfa-feed-head">
              <div className="mfa-feed-head-copy">
                <p className="mfa-feed-author">Your network desk</p>
                <p className="mfa-feed-meta">Quick actions for feed, profile, collab, and events.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link to="/community#feed" className="ios-btn ios-btn-primary !text-xs">
                Open network feed →
              </Link>
              <Link to={profilePath} className="ios-btn ios-btn-secondary !text-xs">
                My public profile
              </Link>
              <Link to="/community" className="ios-btn ios-btn-ghost !text-xs">
                Full community hub
              </Link>
              <Link to="/collab" className="ios-btn ios-btn-ghost !text-xs">
                Collab board →
              </Link>
              <Link to="/events" className="ios-btn ios-btn-ghost !text-xs">
                Events →
              </Link>
            </div>
          </article>

          <CollabSkillsEditor />
        </div>

        <aside className="mfa-sidebar">
          <div className="mfa-widget">
            <h3>Quick guide</h3>
            <ul className="mfa-recent">
              <li>
                <span className="mfa-recent-icon" aria-hidden>
                  ◆
                </span>
                <span className="mfa-recent-text">
                  <strong>Feed</strong> — Spins &amp; Drops at /community
                </span>
              </li>
              <li>
                <span className="mfa-recent-icon" aria-hidden>
                  ◆
                </span>
                <span className="mfa-recent-text">
                  <strong>Profile</strong> — {profilePath}
                </span>
              </li>
              <li>
                <span className="mfa-recent-icon" aria-hidden>
                  ◆
                </span>
                <span className="mfa-recent-text">Set @username in profile settings to share your link.</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
