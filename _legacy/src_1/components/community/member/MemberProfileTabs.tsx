import clsx from 'clsx'

/** Network profile sections (mock-aligned). */
export type MemberProfileTab =
  | 'overview'
  | 'posts'
  | 'activity'
  | 'releases'
  | 'crews'
  | 'about'

const BASE_TABS: { id: MemberProfileTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'posts', label: 'Posts' },
  { id: 'activity', label: 'Activity' },
  { id: 'releases', label: 'Releases' },
  { id: 'crews', label: 'Crews' },
  { id: 'about', label: 'About' },
]

interface MemberProfileTabsProps {
  active: MemberProfileTab
  onChange: (tab: MemberProfileTab) => void
  postCount: number
  showReleases?: boolean
}

export function MemberProfileTabs({
  active,
  onChange,
  postCount,
  showReleases = false,
}: MemberProfileTabsProps) {
  const tabs = showReleases
    ? BASE_TABS
    : BASE_TABS.filter((t) => t.id !== 'releases')

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === active),
  )

  return (
    <div className="member-profile-tabs-wrap network-profile-tabs-wrap" role="tablist" aria-label="Profile sections">
      <div className="member-profile-tabs network-profile-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`member-panel-${tab.id}`}
            id={`member-tab-${tab.id}`}
            className={clsx(
              'member-profile-tab network-profile-tab',
              active === tab.id && 'member-profile-tab-active network-profile-tab-active',
            )}
            onClick={() => onChange(tab.id)}
          >
            <span className="member-profile-tab-label">{tab.label}</span>
            {tab.id === 'posts' && postCount > 0 && (
              <span className="member-profile-tab-count">{postCount}</span>
            )}
          </button>
        ))}
      </div>
      <div
        className="member-profile-tab-indicator network-profile-tab-indicator"
        style={{
          width: `${100 / tabs.length}%`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
        aria-hidden
      />
    </div>
  )
}
