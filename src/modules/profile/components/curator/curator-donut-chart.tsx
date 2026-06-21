import { useEffect, useId, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type CuratorDonutChartProps = {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  className?: string
  children?: ReactNode
  'aria-label'?: string
}

export function CuratorDonutChart({
  value,
  max = 100,
  size = 92,
  strokeWidth = 7,
  color = 'var(--primary)',
  trackColor = 'color-mix(in oklch, var(--foreground) 12%, transparent)',
  className,
  children,
  'aria-label': ariaLabel,
}: CuratorDonutChartProps) {
  const gradientId = useId().replace(/:/g, '')
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const [dash, setDash] = useState(0)

  useEffect(() => {
    const target = (pct / 100) * circumference
    const frame = requestAnimationFrame(() => setDash(target))
    return () => cancelAnimationFrame(frame)
  }, [pct, circumference])

  return (
    <div
      className={cn('curator-donut', className)}
      style={{ width: size, height: size }}
      aria-label={ariaLabel ?? `Score ${value} out of ${max}`}
    >
      <svg viewBox={`0 0 ${size} ${size}`} className="curator-donut__svg" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="55%" stopColor={color} />
            <stop offset="100%" stopColor="color-mix(in oklch, var(--ios-accent-bright, var(--primary)) 65%, #38bdf8 35%)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="curator-donut__track"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="curator-donut__arc"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeDashoffset={circumference * 0.25}
          style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>
      <div className="curator-donut__center">{children}</div>
    </div>
  )
}

type CuratorMultiDonutProps = {
  slices: Array<{ label: string; percent: number; color?: string }>
  size?: number
  strokeWidth?: number
  className?: string
}

export function CuratorMultiDonut({
  slices,
  size = 140,
  strokeWidth = 14,
  className,
}: CuratorMultiDonutProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  let offset = circumference * 0.25

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={cn('curator-multi-donut', className)} aria-hidden>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="color-mix(in oklch, var(--foreground) 10%, transparent)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      {slices.map((slice) => {
        const dash = (slice.percent / 100) * circumference
        const element = (
          <circle
            key={slice.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={slice.color ?? 'var(--primary)'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        )
        offset += dash
        return element
      })}
    </svg>
  )
}
