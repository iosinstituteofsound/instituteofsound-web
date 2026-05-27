import clsx from 'clsx'
import { FEED_FILTER_OPTIONS, type CommunityFeedFilter } from '@/lib/community/feedFilters'

interface CommunityFeedFiltersProps {
  value: CommunityFeedFilter
  onChange: (filter: CommunityFeedFilter) => void
  tribeSlug?: string | null
}

export function CommunityFeedFilters({ value, onChange, tribeSlug }: CommunityFeedFiltersProps) {
  return (
    <div className="community-feed-filters" role="tablist" aria-label="Feed filters">
      {FEED_FILTER_OPTIONS.map((opt) => {
        const disabled = opt.id === 'tribe' && !tribeSlug
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            title={disabled ? 'Pick a tribe to filter by your genre' : undefined}
            className={clsx(
              'community-feed-filter',
              active && 'community-feed-filter-active',
              disabled && 'community-feed-filter-disabled'
            )}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
