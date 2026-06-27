import type { FeedScope } from '@/modules/feed/hooks/use-feed'
import { SegmentedControl } from '@/shared/components/controls/segmented-control'

type FeedScopeToggleProps = {
  value: FeedScope
  onChange: (scope: FeedScope) => void
  className?: string
}

const OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'following' as const, label: 'Following' },
]

export function FeedScopeToggle({ value, onChange, className }: FeedScopeToggleProps) {
  return (
    <SegmentedControl
      value={value}
      options={OPTIONS}
      onChange={onChange}
      className={className}
      aria-label="Feed scope"
    />
  )
}
