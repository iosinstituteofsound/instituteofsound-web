import { useMemo, useState } from 'react'
import { buildFeedItems } from '@/lib/dashboard/feedActivityDesk'
import { useMemberFeedDesk } from '@/hooks/useMemberFeedDesk'
import {
  FEED_ACTIVITY_FILTERS,
  FeedActivityContent,
  FeedActivitySidebar,
  FeedActivityStatsBar,
  FeedActivityTabSummary,
  FeedIcon,
  type FeedActivityFilterId,
} from '@/components/dashboard/MemberFeedActivityParts'

export function MemberFeedActivityHome() {
  const [filter, setFilter] = useState<FeedActivityFilterId>('all')
  const desk = useMemberFeedDesk()

  const items = useMemo(
    () =>
      buildFeedItems(
        filter,
        desk.posts,
        desk.followingPosts,
        desk.events,
        desk.collabPosts,
        desk.handle,
      ),
    [filter, desk.posts, desk.followingPosts, desk.events, desk.collabPosts, desk.handle],
  )

  return (
    <div className="member-feed-activity">
      <header className="mfa-header">
        <h2 className="mfa-title">Feed &amp; Activity</h2>
        <p className="mfa-subtitle">Stay updated with the IOS community.</p>
      </header>

      <FeedActivityStatsBar desk={desk} />

      <div className="mfa-filters" role="tablist" aria-label="Feed filters">
        {FEED_ACTIVITY_FILTERS.map((item) => {
          const active = filter === item.id
          const showDot = 'dot' in item && item.dot && desk.mentionCount > 0
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active ? 'true' : 'false'}
              className={`mfa-filter${active ? ' mfa-filter--active' : ''}${showDot ? ' mfa-filter--notify' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              <span className="mfa-filter-icon">
                <FeedIcon name={item.icon} size={15} />
              </span>
              <span className="mfa-filter-label">{item.label}</span>
              {showDot && <span className="mfa-filter-dot" aria-hidden />}
            </button>
          )
        })}
      </div>

      <FeedActivityTabSummary filter={filter} desk={desk} />

      <div className="mfa-layout">
        <div className={`mfa-feed mfa-feed--${filter}`}>
          <FeedActivityContent filter={filter} desk={desk} items={items} />
        </div>
        <FeedActivitySidebar filter={filter} desk={desk} />
      </div>
    </div>
  )
}
