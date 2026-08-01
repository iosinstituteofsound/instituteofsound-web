import {
  feedHomeTabToScope,
  useFeedScopeStore,
  type FeedHomeTab,
} from '@/modules/feed/stores/feed-scope-store'
import { cn } from '@/shared/lib/cn'
import './feed-scope-picker.css'

const TABS: Array<{ value: FeedHomeTab; label: string }> = [
  { value: 'my', label: 'My' },
  { value: 'artist', label: 'Artist' },
  { value: 'nation', label: 'Nation' },
]

export function FeedScopePicker({ className }: { className?: string }) {
  const homeTab = useFeedScopeStore((state) => state.homeTab)
  const setHomeTab = useFeedScopeStore((state) => state.setHomeTab)

  return (
    <div
      className={cn('feed-scope-picker', className)}
      role="tablist"
      aria-label="Home scope"
    >
      {TABS.map((tab) => {
        const active = homeTab === tab.value
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn('feed-scope-picker__tab', active && 'feed-scope-picker__tab--active')}
            onClick={() => setHomeTab(tab.value)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

export { feedHomeTabToScope, useFeedScopeStore }
export type { FeedHomeTab }
