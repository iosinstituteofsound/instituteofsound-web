import { cn } from '@/shared/lib/cn'

export type SegmentedControlOption<T extends string> = {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: Array<SegmentedControlOption<T>>
  onChange: (value: T) => void
  className?: string
  'aria-label'?: string
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
  'aria-label': ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex rounded-full border border-border/80 bg-muted/40 p-1',
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
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
