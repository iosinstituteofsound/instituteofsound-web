import { Link } from 'react-router-dom'
import { CommunityFeedCard } from '@/components/community/CommunityFeedCard'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { formatRelativeTime } from '@/lib/community/relativeTime'
import type { CollabBoardPost } from '@/lib/collab/types'
import type { SceneEvent } from '@/lib/events/types'
import {
  activityRecentIcon,
  engagementStreakDays,
  type FeedActivityFilterId,
  type FeedDeskItem,
  leaderboardAsTrending,
  signalCardsFromStats,
  spinPostsForSidebar,
  tabSummaryCopy,
} from '@/lib/dashboard/feedActivityDesk'
import type { useMemberFeedDesk } from '@/hooks/useMemberFeedDesk'

type Desk = ReturnType<typeof useMemberFeedDesk>

function FeedIcon({ name, size = 18 }: { name: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
  }
  switch (name) {
    case 'wave':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" strokeLinecap="round" />
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
    case 'disc':
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
      )
    case 'signal':
      return (
        <svg {...common} aria-hidden>
          <path d="M4 12h2M8 8v8M12 5v14M16 8v8M20 12h2" strokeLinecap="round" />
        </svg>
      )
    case 'at':
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        </svg>
      )
    case 'flame':
      return (
        <svg {...common} aria-hidden>
          <path d="M12 22c4-2 6-5 6-9 0-3-2-5-4-7-1 2-2 3-2 5 0-2-2-4-4-6-2 3-4 6-4 9 0 4 2 7 6 9z" />
        </svg>
      )
    case 'heart':
    case 'comment':
    case 'play':
      return (
        <svg {...common} aria-hidden>
          {name === 'heart' && (
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          )}
          {name === 'comment' && (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
          {name === 'play' && <polygon points="8,5 19,12 8,19" fill="currentColor" stroke="none" />}
        </svg>
      )
    default:
      return null
  }
}

function FeedEmpty({ filter }: { filter: FeedActivityFilterId }) {
  return (
    <article className="mfa-feed-card">
      <p className="mfa-feed-body">
        {filter === 'mentions'
          ? 'No @mentions on the wire yet.'
          : filter === 'following'
            ? 'Follow artists on the network to see their drops here.'
            : 'Nothing on this wire yet — be the first to post.'}
      </p>
      <Link to="/community#feed" className="ios-btn ios-btn-primary !text-xs mt-3 inline-flex">
        Open live feed →
      </Link>
    </article>
  )
}

function LiveEventCard({ event }: { event: SceneEvent }) {
  const when = new Date(event.startsAt)
  const dateLabel = when.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  const timeLabel = when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  return (
    <article className="mfa-feed-card">
      <header className="mfa-feed-head">
        <span className="mfa-avatar mfa-avatar--guild" />
        <div className="mfa-feed-head-copy">
          <p className="mfa-feed-author">{event.sceneCity || 'IOS Events'}</p>
          <p className="mfa-feed-meta">
            {event.eventKind} · {formatRelativeTime(event.startsAt)}
          </p>
        </div>
      </header>
      <div className="mfa-event-banner">
        <div className="mfa-event-banner-copy">
          <p className="mfa-event-kicker">{event.title}</p>
          <p className="mfa-event-meta">
            {dateLabel} · {timeLabel} · {event.venueName}
          </p>
        </div>
        <Link to="/events" className="mfa-join-btn">
          {event.viewerRsvped ? 'Going' : 'RSVP'}
        </Link>
      </div>
      <p className="mfa-feed-meta mt-2">{event.rsvpCount.toLocaleString()} going on IOS</p>
    </article>
  )
}

function LiveCollabCard({ post }: { post: CollabBoardPost }) {
  return (
    <article className="mfa-feed-card">
      <header className="mfa-feed-head">
        <span className="mfa-avatar mfa-avatar--echo" />
        <div className="mfa-feed-head-copy">
          <p className="mfa-feed-author">{post.displayName}</p>
          <p className="mfa-feed-meta">
            Collaboration {post.kind === 'need' ? 'Need' : 'Offer'} · {formatRelativeTime(post.createdAt)}
          </p>
        </div>
        <span className="mfa-tag mfa-tag--open">{post.status === 'open' ? 'Open' : post.status}</span>
      </header>
      <p className="mfa-feed-body mfa-feed-body--title">{post.title}</p>
      <p className="mfa-feed-body">{post.body}</p>
      {post.skillSlugs.length > 0 && (
        <div className="mfa-tags">
          {post.skillSlugs.slice(0, 4).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}
      <p className="mfa-feed-meta mt-2">{post.responseCount} interested · @{post.handle}</p>
      <Link to="/collab" className="ios-btn ios-btn-ghost !text-xs mt-3 inline-flex">
        Open collab board →
      </Link>
    </article>
  )
}

function SignalCard({
  title,
  body,
  delta,
  icon,
}: {
  title: string
  body: string
  delta: string
  icon: string
}) {
  return (
    <article className="mfa-feed-card mfa-feed-card--signal">
      <div className="mfa-signal-head">
        <span className="mfa-signal-icon">
          <FeedIcon name={icon} />
        </span>
        <div>
          <p className="mfa-signal-title">{title}</p>
          <p className="mfa-signal-body">{body}</p>
        </div>
        <span className="mfa-signal-delta">{delta}</span>
      </div>
    </article>
  )
}

function renderFeedItem(item: FeedDeskItem, userId?: string) {
  switch (item.type) {
    case 'post':
      return (
        <CommunityFeedCard
          key={`post-${item.post.id}`}
          post={item.post}
          isYou={Boolean(userId && item.post.userId === userId)}
          className="mfa-feed-card community-feed-card--desk"
        />
      )
    case 'event':
      return <LiveEventCard key={`event-${item.event.id}`} event={item.event} />
    case 'collab':
      return <LiveCollabCard key={`collab-${item.post.id}`} post={item.post} />
  }
}

export function FeedActivityStatsBar({ desk }: { desk: Desk }) {
  const { stats, statsLoading, profile, activity } = desk
  const streak = engagementStreakDays(activity)

  if (statsLoading && !stats) {
    return <LoadingTransmission variant="compact" />
  }

  return (
    <div className="mfa-stats">
      <article className="mfa-stat">
        <div className="mfa-stat-copy">
          <p className="mfa-stat-label">dB Score</p>
          <p className="mfa-stat-value">{stats ? stats.totalDb.toLocaleString() : '—'}</p>
          <p className="mfa-stat-meta">
            {stats ? `${stats.weeklyDb >= 0 ? '+' : ''}${stats.weeklyDb.toLocaleString()} this week` : '—'}
          </p>
        </div>
        <span className="mfa-stat-icon">
          <FeedIcon name="wave" />
        </span>
      </article>
      <article className="mfa-stat">
        <div className="mfa-stat-copy">
          <p className="mfa-stat-label">Rank</p>
          <p className="mfa-stat-value">{stats?.rank ?? '—'}</p>
          <p className="mfa-stat-meta">
            {stats?.nextRank ? `${stats.rankProgressPct}% to ${stats.nextRank}` : 'Network tier'}
          </p>
        </div>
        <span className="mfa-stat-icon">
          <FeedIcon name="shield" />
        </span>
      </article>
      <article className="mfa-stat">
        <div className="mfa-stat-copy">
          <p className="mfa-stat-label">Followers</p>
          <p className="mfa-stat-value">{profile?.followerCount?.toLocaleString() ?? '—'}</p>
          <p className="mfa-stat-meta">On your profile</p>
        </div>
        <span className="mfa-stat-icon">
          <FeedIcon name="users" />
        </span>
      </article>
      <article className="mfa-stat">
        <div className="mfa-stat-copy">
          <p className="mfa-stat-label">Following</p>
          <p className="mfa-stat-value">{profile?.followingCount?.toLocaleString() ?? '—'}</p>
          <p className="mfa-stat-meta">Creators you track</p>
        </div>
        <span className="mfa-stat-icon">
          <FeedIcon name="users" />
        </span>
      </article>
      <article className="mfa-stat">
        <div className="mfa-stat-copy">
          <p className="mfa-stat-label">Streak</p>
          <p className="mfa-stat-value">{streak > 0 ? `${streak} days` : '—'}</p>
        </div>
        <span className="mfa-stat-icon">
          <FeedIcon name="flame" />
        </span>
      </article>
    </div>
  )
}

export function FeedActivitySidebar({
  filter,
  desk,
}: {
  filter: FeedActivityFilterId
  desk: Desk
}) {
  const { activity, posts, events, stats, handle } = desk
  const trendingArtists = leaderboardAsTrending(desk.leaderboard)
  const trendingReleases = spinPostsForSidebar(posts)

  if (filter === 'releases') {
    return (
      <aside className="mfa-sidebar">
        <section className="mfa-widget">
          <h3>Trending Releases</h3>
          {trendingReleases.length === 0 ? (
            <p className="mfa-widget-note">No spins on the wire yet.</p>
          ) : (
            <ul className="mfa-release-list">
              {trendingReleases.map((release, i) => (
                <li key={release.title}>
                  <span className={`mfa-release-art mfa-release-art--${(i % 5) + 1}`} />
                  <div className="mfa-trend-copy">
                    <p className="mfa-trend-name">{release.title}</p>
                    <p className="mfa-trend-meta">{release.artist}</p>
                  </div>
                  <span className="mfa-trend-db">{release.plays}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    )
  }

  if (filter === 'events') {
    return (
      <aside className="mfa-sidebar">
        <section className="mfa-widget">
          <h3>Upcoming Events</h3>
          {events.length === 0 ? (
            <p className="mfa-widget-note">No upcoming events listed.</p>
          ) : (
            <ul className="mfa-event-list">
              {events.slice(0, 5).map((event) => {
                const when = new Date(event.startsAt)
                return (
                  <li key={event.id}>
                    <p className="mfa-event-list-title">{event.title}</p>
                    <p className="mfa-event-list-meta">
                      {when.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} ·{' '}
                      {event.sceneCity}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </aside>
    )
  }

  if (filter === 'signals') {
    return (
      <aside className="mfa-sidebar">
        <section className="mfa-widget mfa-widget--pulse">
          <h3>Signal Pulse</h3>
          <p className="mfa-pulse-value">
            {stats ? `${stats.weeklyDb >= 0 ? '+' : ''}${stats.weeklyDb.toLocaleString()} dB` : '—'}
          </p>
          <p className="mfa-pulse-meta">Network momentum this week</p>
        </section>
      </aside>
    )
  }

  if (filter === 'mentions') {
    return (
      <aside className="mfa-sidebar">
        <section className="mfa-widget">
          <h3>Mention Settings</h3>
          <p className="mfa-widget-note">
            Tags matching @{handle} appear in this tab when someone mentions you on the wire.
          </p>
          <Link to="/community" className="ios-btn ios-btn-secondary !text-xs mfa-widget-cta">
            Manage alerts →
          </Link>
        </section>
      </aside>
    )
  }

  return (
    <aside className="mfa-sidebar">
      <section className="mfa-widget">
        <div className="mfa-widget-head">
          <h3>Recent Activity</h3>
          <Link to="/community">View all</Link>
        </div>
        {activity.length === 0 ? (
          <p className="mfa-widget-note">Activity from your network profile will show here.</p>
        ) : (
          <ul className="mfa-recent">
            {activity.slice(0, 5).map((item) => (
              <li key={`${item.kind}-${item.createdAt}-${item.label}`}>
                <span className={`mfa-recent-icon mfa-recent-icon--${activityRecentIcon(item.kind)}`}>
                  <FeedIcon name={activityRecentIcon(item.kind)} size={13} />
                </span>
                <span className="mfa-recent-avatar" />
                <p className="mfa-recent-text">{item.label}</p>
                <time className="mfa-recent-time">{formatRelativeTime(item.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
        <Link to="/community#feed" className="mfa-show-more">
          Show more
        </Link>
      </section>

      {filter === 'all' && trendingArtists.length > 0 && (
        <section className="mfa-widget">
          <h3>Trending Artists</h3>
          <ol className="mfa-trend-list">
            {trendingArtists.map((artist, i) => (
              <li key={artist.handle}>
                <span className="mfa-rank">{i + 1}</span>
                <span className={`mfa-trend-avatar mfa-trend-avatar--${(i % 5) + 1}`} />
                <div className="mfa-trend-copy">
                  <p className="mfa-trend-name">{artist.name}</p>
                  <p className="mfa-trend-meta">{artist.genre}</p>
                </div>
                <span className="mfa-trend-db">{artist.db}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {filter === 'all' && trendingReleases.length > 0 && (
        <section className="mfa-widget">
          <h3>Trending Releases</h3>
          <ul className="mfa-release-list">
            {trendingReleases.map((release, i) => (
              <li key={release.title}>
                <span className={`mfa-release-art mfa-release-art--${(i % 5) + 1}`} />
                <div className="mfa-trend-copy">
                  <p className="mfa-trend-name">{release.title}</p>
                  <p className="mfa-trend-meta">{release.artist}</p>
                </div>
                <span className="mfa-trend-db">{release.plays}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {filter === 'following' && trendingArtists.length > 0 && (
        <section className="mfa-widget">
          <h3>Suggested Follows</h3>
          <ol className="mfa-trend-list">
            {trendingArtists.slice(0, 3).map((artist, i) => (
              <li key={artist.handle}>
                <span className="mfa-rank">{i + 1}</span>
                <span className={`mfa-trend-avatar mfa-trend-avatar--${(i % 5) + 1}`} />
                <div className="mfa-trend-copy">
                  <p className="mfa-trend-name">{artist.name}</p>
                  <p className="mfa-trend-meta">{artist.genre}</p>
                </div>
                <Link to={`/network/${artist.handle}`} className="mfa-follow-btn mfa-follow-btn--mini">
                  View
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}
    </aside>
  )
}

export function FeedActivityContent({
  filter,
  desk,
  items,
}: {
  filter: FeedActivityFilterId
  desk: Desk
  items: FeedDeskItem[]
}) {
  if (desk.loading) {
    return <LoadingTransmission variant="compact" />
  }

  if (filter === 'signals') {
    const cards = signalCardsFromStats(desk.stats, desk.activity, desk.profile?.followerCount ?? 0)
    if (cards.length === 0) {
      return <FeedEmpty filter={filter} />
    }
    return (
      <>
        {cards.map((card) => (
          <SignalCard key={card.title} {...card} />
        ))}
      </>
    )
  }

  if (items.length === 0) {
    return <FeedEmpty filter={filter} />
  }

  return <>{items.map((item) => renderFeedItem(item, desk.user?.id))}</>
}

export const FEED_ACTIVITY_FILTERS = [
  { id: 'all' as const, label: 'All Activity', icon: 'wave' },
  { id: 'following' as const, label: 'Following', icon: 'users' },
  { id: 'releases' as const, label: 'Releases', icon: 'disc' },
  { id: 'events' as const, label: 'Events', icon: 'calendar' },
  { id: 'signals' as const, label: 'Signals', icon: 'signal' },
  { id: 'mentions' as const, label: 'Mentions', icon: 'at', dot: true },
]

export function FeedActivityTabSummary({
  filter,
  desk,
}: {
  filter: FeedActivityFilterId
  desk: Desk
}) {
  const copy = tabSummaryCopy(filter, {
    followingCount: desk.profile?.followingCount ?? desk.followingPosts.length,
    mentionCount: desk.mentionCount,
    feedCount: desk.posts.filter((p) => p.kind === 'spin').length,
    eventCount: desk.events.length,
  })
  return (
    <div className="mfa-tab-summary">
      <p className="mfa-tab-summary-title">{copy.title}</p>
      <p className="mfa-tab-summary-hint">{copy.hint}</p>
    </div>
  )
}

export { FeedIcon, type FeedActivityFilterId }
