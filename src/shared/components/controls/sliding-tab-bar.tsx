import { useRef, type ReactNode } from 'react'
import { useSlidingIndicator } from '@/shared/hooks/use-sliding-indicator'
import { cn } from '@/shared/lib/cn'

export type SlidingTabOption<T extends string> = {
  value: T
  label: ReactNode
}

interface SlidingTabBarProps<T extends string> {
  value: T
  options: Array<SlidingTabOption<T>>
  onChange: (value: T) => void
  className?: string
  tabClassName?: string
  'aria-label'?: string
}

export function SlidingTabBar<T extends string>({
  value,
  options,
  onChange,
  className,
  tabClassName,
  'aria-label': ariaLabel,
}: SlidingTabBarProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const indicator = useSlidingIndicator(containerRef, value)

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-flex rounded-lg bg-muted/50 p-1', className)}
      role="tablist"
      aria-label={ariaLabel}
    >
      <span
        className="pointer-events-none absolute rounded-md bg-background shadow-sm transition-all duration-200 ease-out"
        style={{
          left: indicator.left,
          top: indicator.top,
          width: indicator.width,
          height: indicator.height,
        }}
        aria-hidden
      />
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            data-indicator-key={option.value}
            aria-selected={active}
            className={cn(
              'relative z-[1] rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              tabClassName,
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
