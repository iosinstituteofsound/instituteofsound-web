import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { memberHandleFromUser } from '@/lib/community/memberProfileService'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { CollabSkillsEditor } from '@/components/collab/CollabSkillsEditor'
import { MfaWaveBars } from '@/components/dashboard/memberDeskUi'

type FilterId = 'all' | 'drops' | 'spins' | 'events' | 'releases' | 'mentions'

type FilterItem = { id: FilterId; label: string; notify?: boolean }

const FILTERS: FilterItem[] = [
  { id: 'all', label: 'All' },
  { id: 'drops', label: 'Drops' },
  { id: 'spins', label: 'Spins' },
  { id: 'events', label: 'Events' },
  { id: 'releases', label: 'Releases' },
  { id: 'mentions', label: 'Mentions', notify: true },
]

const FILTER_HINT: Record<FilterId, string> = {
  all: 'Everything on your wire — posts, drops, gigs, and releases.',
  drops: 'Track drops and listening activity from artists you follow.',
  spins: 'Spins and reactions across the network feed.',
  events: 'Gigs, RSVP momentum, and scene activations.',
  releases: 'Premieres and catalog drops from the magazine desk.',
  mentions: 'Tags, replies, and @mentions waiting for you.',
}

export function MemberFeedActivity() {
  const { user } = useAuth()
  const { stats, loading } = useCommunityMemberStats()
  const [filter, setFilter] = useState<FilterId>('all')

  if (!user) return null

  const handle = memberHandleFromUser(user)
  const profilePath = `/network/${handle}`

  return (
    <div className="member-feed-activity">
      <header className="mfa-header">
        <h2 className="mfa-title">Feed &amp; activity</h2>
        <p className="mfa-subtitle">
          Your wire on Institute of Sound — post Spins and Drops, earn dB, and track scene momentum.
        </p>
      </header>

      {loading && !stats ? (
        <LoadingTransmission variant="compact" />
      ) : stats ? (
        <div className="mfa-stats">
          {[
            { label: 'dB balance', value: stats.totalDb.toLocaleString(), meta: `+${stats.weeklyDb} week` },
            { label: 'Rank', value: stats.rank, meta: 'Network tier' },
            { label: 'Tribe', value: stats.primaryGenreSlug ?? 'Open', meta: 'Primary scene' },
            { label: 'Handle', value: `@${handle}`, meta: 'Public profile' },
            { label: 'Wire', value: 'Live', meta: 'Community feed' },
          ].map((s) => (
            <article key={s.label} className="mfa-stat">
              <span className="mfa-stat-icon">◆</span>
              <div>
                <p className="mfa-stat-label">{s.label}</p>
                <p className="mfa-stat-value">{s.value}</p>
                <p className="mfa-stat-meta">{s.meta}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <div className="mfa-filters" role="tablist" aria-label="Feed filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={clsx('mfa-filter', filter === f.id && 'mfa-filter--active', f.notify && 'mfa-filter--notify')}
            onClick={() => setFilter(f.id)}
          >
            <span className="mfa-filter-icon">◆</span>
            <span className="mfa-filter-label">{f.label}</span>
            {f.notify && <span className="mfa-filter-dot" aria-hidden />}
          </button>
        ))}
      </div>

      <div className="mfa-tab-summary">
        <p className="mfa-tab-summary-title">{FILTERS.find((f) => f.id === filter)?.label} wire</p>
        <p className="mfa-tab-summary-hint">{FILTER_HINT[filter]}</p>
      </div>

      <div className="mfa-layout">
        <div className={clsx('mfa-feed', filter === 'releases' && 'mfa-feed--releases')}>
          <article className="mfa-feed-card">
            <div className="mfa-feed-head">
              <span className="mfa-avatar mfa-avatar--zypher" aria-hidden />
              <div className="mfa-feed-head-copy">
                <p className="mfa-feed-author">
                  @{handle}
                  <span className="mfa-verified">You</span>
                </p>
                <p className="mfa-feed-meta">Desk quick actions · network home</p>
              </div>
              <span className="mfa-tag mfa-tag--open">Open</span>
            </div>
            <p className="mfa-feed-body">
              Jump into the live feed, update your public profile, or open the collab board and events
              wire.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to="/community#feed" className="ios-btn ios-btn-primary !text-xs">
                Open feed →
              </Link>
              <Link to={profilePath} className="ios-btn ios-btn-secondary !text-xs">
                Profile
              </Link>
            </div>
            <div className="mfa-feed-actions">
              <Link to="/collab" className="mfa-action">
                Collab →
              </Link>
              <Link to="/events" className="mfa-action">
                Events →
              </Link>
            </div>
          </article>

          <article className="mfa-feed-card">
            <div className="mfa-feed-head">
              <span className="mfa-avatar mfa-avatar--guild" aria-hidden />
              <div className="mfa-feed-head-copy">
                <p className="mfa-feed-author">
                  Wire drop
                  <span className="mfa-check" aria-hidden>
                    ✓
                  </span>
                </p>
                <p className="mfa-feed-meta">Example · open feed for live posts</p>
              </div>
            </div>
            <p className="mfa-feed-body mfa-feed-body--title">Midnight transmission — preview card</p>
            <div className="mfa-player">
              <div className="mfa-player-art mfa-player-art--neon" aria-hidden />
              <div className="mfa-player-main">
                <p className="mfa-player-title">Vault sequence (demo)</p>
                <MfaWaveBars />
                <div className="mfa-player-controls">
                  <button type="button" className="mfa-play" aria-label="Play preview">
                    ▶
                  </button>
                  <span className="mfa-player-time">0:42</span>
                  <button type="button" className="mfa-play mfa-play--ghost" aria-label="Queue">
                    +
                  </button>
                </div>
              </div>
            </div>
          </article>

          <article className="mfa-feed-card mfa-feed-card--signal">
            <div className="mfa-signal-head">
              <span className="mfa-signal-icon">◆</span>
              <p className="mfa-signal-title">Signal pulse</p>
            </div>
            <p className="mfa-signal-body">
              Scene hubs and editorial picks update throughout the day — open Discover for the full wire.
            </p>
            <p className="mfa-signal-delta">+12% scene traffic · 30d</p>
            <Link to="/discover" className="ios-btn ios-btn-ghost !text-xs mt-3 inline-flex">
              Open discover →
            </Link>
          </article>

          <article className="mfa-feed-card">
            <div className="mfa-event-banner">
              <div>
                <p className="mfa-event-kicker">Live · Berlin modular</p>
                <p className="mfa-event-meta">Sat 22:00 · RSVP on Events wire</p>
                <div className="mfa-going">
                  <span className="mfa-going-label">Going</span>
                  <span className="mfa-avatar-stack">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className="mfa-avatar-stack-item" data-layer={String(i)} />
                    ))}
                  </span>
                  <span className="mfa-avatar-stack-count">+24</span>
                </div>
              </div>
              <Link to="/events" className="mfa-join-btn">
                RSVP
              </Link>
            </div>
          </article>
        </div>

        <aside className="mfa-sidebar">
          <div className="mfa-widget">
            <div className="mfa-widget-head">
              <h3>Recent</h3>
              <Link to="/community#feed">View all</Link>
            </div>
            <ul className="mfa-recent">
              <li>
                <span className="mfa-recent-icon">◆</span>
                <span className="mfa-recent-avatar" aria-hidden />
                <p className="mfa-recent-text">Opened network feed</p>
                <span className="mfa-recent-time">Now</span>
              </li>
              <li>
                <span className="mfa-recent-icon">◆</span>
                <span className="mfa-recent-avatar" aria-hidden />
                <p className="mfa-recent-text">Desk workspace sync</p>
                <span className="mfa-recent-time">Today</span>
              </li>
            </ul>
            <Link to="/community#feed" className="mfa-show-more">
              Show more on feed →
            </Link>
          </div>

          <div className="mfa-widget">
            <h3>Trending</h3>
            <ul className="mfa-trend-list">
              {['Mira Volkov', 'Echo Guild', 'Luna Wire'].map((name, i) => (
                <li key={name}>
                  <span className="mfa-rank">{i + 1}</span>
                  <span className={clsx('mfa-trend-avatar', `mfa-trend-avatar--${i + 1}`)} aria-hidden />
                  <div className="mfa-trend-copy">
                    <p className="mfa-trend-name">{name}</p>
                    <p className="mfa-trend-meta">Artist · network</p>
                  </div>
                  <span className="mfa-trend-db">+{(3 - i) * 120} dB</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mfa-widget mfa-widget--pulse">
            <h3>Wire pulse</h3>
            <p className="mfa-pulse-value">{stats ? stats.weeklyDb.toLocaleString() : '—'}</p>
            <p className="mfa-pulse-meta">dB earned this week</p>
            <p className="mfa-widget-note">Keep posting Spins and Drops to rank up.</p>
            <Link to="/community#feed" className="mfa-widget-cta">
              Post on feed →
            </Link>
          </div>
        </aside>
      </div>

      <CollabSkillsEditor />
    </div>
  )
}
