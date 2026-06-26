import type { FeedScope } from '@/modules/feed/hooks/use-feed'
import { cn } from '@/shared/lib/cn'

type FeedScopeToggleProps = {
  value: FeedScope
  onChange: (scope: FeedScope) => void
  className?: string
}

const OPTIONS: Array<{ value: FeedScope; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'following', label: 'Following' },
]

export function FeedScopeToggle({ value, onChange, className }: FeedScopeToggleProps) {
  return (
    <div
      className={cn(
        'inline-flex rounded-full border border-border/80 bg-muted/40 p-1',
        className,
      )}
      role="tablist"
      aria-label="Feed scope"
    >
      {OPTIONS.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
