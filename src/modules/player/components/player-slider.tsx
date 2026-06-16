import * as React from 'react'
import { cn } from '@/shared/lib/cn'

export interface PlayerSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: number
  max?: number
  variant?: 'progress' | 'volume'
  onValueChange?: (value: number) => void
}

export const PlayerSlider = React.forwardRef<HTMLInputElement, PlayerSliderProps>(
  ({ className, value, max = 1, variant = 'progress', onValueChange, onChange, ...props }, ref) => {
    const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0

    return (
      <div
        className={cn(
          'ios-player-slider',
          variant === 'progress' && 'ios-player-slider--progress',
          variant === 'volume' && 'ios-player-slider--volume',
          className,
        )}
        style={{ '--ios-slider-progress': `${percent}%` } as React.CSSProperties}
      >
        <input
          ref={ref}
          type="range"
          min={0}
          max={max}
          step={variant === 'volume' ? 0.01 : 0.25}
          value={value}
          className="ios-player-slider__input"
          onChange={(event) => {
            onChange?.(event)
            onValueChange?.(Number(event.target.value))
          }}
          {...props}
        />
      </div>
    )
  },
)

PlayerSlider.displayName = 'PlayerSlider'
