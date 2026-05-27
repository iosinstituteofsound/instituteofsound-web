import clsx from 'clsx'

export type MemberProfileTab = 'feed' | 'signal' | 'medals' | 'academy'

const TABS: { id: MemberProfileTab; label: string; hint: string }[] = [
  { id: 'feed', label: 'Transmissions', hint: 'Spins & drops' },
  { id: 'signal', label: 'Signal log', hint: 'Activity' },
  { id: 'medals', label: 'Medals', hint: 'Badges' },
  { id: 'academy', label: 'Academy', hint: 'Certs & tracks' },
]

interface MemberProfileTabsProps {
  active: MemberProfileTab
  onChange: (tab: MemberProfileTab) => void
  postCount: number
  badgeCount: number
}

export function MemberProfileTabs({
  active,
  onChange,
  postCount,
  badgeCount,
}: MemberProfileTabsProps) {
  return (
    <div className="member-profile-tabs-wrap" role="tablist" aria-label="Profile sections">
      <div className="member-profile-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`member-panel-${tab.id}`}
            id={`member-tab-${tab.id}`}
            className={clsx('member-profile-tab', active === tab.id && 'member-profile-tab-active')}
            onClick={() => onChange(tab.id)}
          >
            <span className="member-profile-tab-label">{tab.label}</span>
            <span className="member-profile-tab-hint">{tab.hint}</span>
            {tab.id === 'feed' && postCount > 0 && (
              <span className="member-profile-tab-count">{postCount}</span>
            )}
            {tab.id === 'medals' && badgeCount > 0 && (
              <span className="member-profile-tab-count">{badgeCount}</span>
            )}
          </button>
        ))}
      </div>
      <div
        className="member-profile-tab-indicator"
        style={{
          transform: `translateX(${TABS.findIndex((t) => t.id === active) * 100}%)`,
        }}
        aria-hidden
      />
    </div>
  )
}
