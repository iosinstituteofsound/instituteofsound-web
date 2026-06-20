import { useMemo } from 'react'
import type { AnalyticsTrendPointDto } from '@/modules/music/types/analytics.types'
import {
  buildLineChartPaths,
  fillTrendDateGaps,
  trendToChartPoints,
} from '@/modules/music/lib/artist-dashboard-utils'
import { formatPlays } from '@/modules/music/lib/analytics-format'

type ValueKey = keyof Pick<
  AnalyticsTrendPointDto,
  'qualifiedPlays' | 'sessions' | 'likes' | 'completions'
>

type Props = {
  points: AnalyticsTrendPointDto[]
  fromDate?: string
  toDate?: string
  valueKey?: ValueKey
  emptyMessage?: string
  ariaLabel?: string
  className?: string
  width?: number
  height?: number
}

export function DashboardLineChart({
  points,
  fromDate,
  toDate,
  valueKey = 'qualifiedPlays',
  emptyMessage = 'No trend data for this period yet.',
  ariaLabel = 'Trend chart',
  className = 'ios-artist-dashboard__modal-chart',
  width = 720,
  height = 220,
}: Props) {
  const chart = useMemo(() => {
    const filled = fillTrendDateGaps(points, fromDate, toDate)
    const chartPoints = trendToChartPoints(filled, valueKey)
    return {
      filled,
      ...buildLineChartPaths(chartPoints, width, height),
    }
  }, [fromDate, height, points, toDate, valueKey, width])

  const hasValues = chart.filled.some((point) => point[valueKey] > 0)

  if (!chart.filled.length || !hasValues) {
    return <p className="ios-artist-dashboard__modal-empty">{emptyMessage}</p>
  }

  const innerBottom = height - 28

  return (
    <div className={className} role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {chart.yTicks.map((tick) => {
          const y = 12 + (innerBottom - 12) * (1 - tick / Math.max(1, chart.max ?? 1))
          return (
            <g key={tick} className="ios-artist-dashboard__chart-grid-line">
              <line x1="40" y1={y} x2={width - 12} y2={y} />
              <text x="34" y={y + 4} textAnchor="end">
                {formatPlays(tick)}
              </text>
            </g>
          )
        })}
        <path d={chart.areaPath} className="ios-artist-dashboard__chart-area" />
        <path
          d={chart.linePath}
          className="ios-artist-dashboard__chart-line ios-artist-dashboard__chart-line--primary"
          vectorEffect="nonScalingStroke"
        />
        {chart.labels.map((label) => (
          <text
            key={`${label.x}-${label.label}`}
            x={label.x}
            y={height - 4}
            textAnchor="middle"
            className="ios-artist-dashboard__chart-axis-label"
          >
            {label.label}
          </text>
        ))}
      </svg>
    </div>
  )
}
