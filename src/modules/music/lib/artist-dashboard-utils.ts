import type { AnalyticsTrendPointDto } from '@/modules/music/types/analytics.types'

export type DashboardAccent = 'primary' | 'success' | 'warning' | 'info'

export type AnalyticsRangePreset = '30d' | '90d' | '365d' | 'lifetime' | 'custom'

export const ANALYTICS_RANGE_PRESETS: Array<{
  id: AnalyticsRangePreset
  label: string
}> = [
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: '365d', label: 'Last 365 days' },
  { id: 'lifetime', label: 'Lifetime' },
  { id: 'custom', label: 'Custom' },
]

export function filterTrendByDateRange(
  points: AnalyticsTrendPointDto[],
  from?: string,
  to?: string,
) {
  return points.filter((p) => {
    if (from && p.date < from) return false
    if (to && p.date > to) return false
    return true
  })
}

export function filterTrendByDays(points: AnalyticsTrendPointDto[], days: number) {
  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - days)
  const cutoffKey = cutoff.toISOString().slice(0, 10)
  return points.filter((p) => p.date >= cutoffKey)
}

export function computePeriodDelta(
  points: AnalyticsTrendPointDto[],
  days: number,
  getValue: (point: AnalyticsTrendPointDto) => number,
): number | null {
  if (!points.length) return null

  const now = new Date()
  const recentCutoff = new Date(now)
  recentCutoff.setUTCDate(recentCutoff.getUTCDate() - days)
  const priorCutoff = new Date(recentCutoff)
  priorCutoff.setUTCDate(priorCutoff.getUTCDate() - days)

  const recentKey = recentCutoff.toISOString().slice(0, 10)
  const priorKey = priorCutoff.toISOString().slice(0, 10)

  const recent = points.filter((p) => p.date >= recentKey)
  const prior = points.filter((p) => p.date >= priorKey && p.date < recentKey)

  const recentSum = recent.reduce((sum, p) => sum + getValue(p), 0)
  const priorSum = prior.reduce((sum, p) => sum + getValue(p), 0)

  if (priorSum <= 0) return recentSum > 0 ? 100 : 0
  return ((recentSum - priorSum) / priorSum) * 100
}

export function formatDelta(value: number | null, suffix = '%'): string {
  if (value === null) return '—'
  const sign = value > 0 ? '+' : ''
  const formatted = suffix === '' ? String(Math.round(value)) : value.toFixed(1)
  return `${sign}${formatted}${suffix}`
}

export function deltaClass(value: number | null): 'is-up' | 'is-down' | 'is-flat' {
  if (value === null || Math.abs(value) < 0.05) return 'is-flat'
  return value > 0 ? 'is-up' : 'is-down'
}

export function estimateDbRank(qualifiedPlays: number): string {
  if (qualifiedPlays <= 0) return '—'
  const rank = Math.max(1, Math.round(1000 - Math.log10(qualifiedPlays + 1) * 120))
  return `#${rank}`
}

export function formatRelativeTime(iso?: string): string {
  if (!iso) return 'Recently'
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'Recently'

  const diffMs = Date.now() - then
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function fillTrendDateGaps(
  points: AnalyticsTrendPointDto[],
  fromDate?: string,
  toDate?: string,
): AnalyticsTrendPointDto[] {
  if (!fromDate && !toDate) {
    const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date))
    if (sorted.length <= 1) return sorted
    return fillTrendDateGaps(points, sorted[0].date, sorted[sorted.length - 1].date)
  }

  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date))
  const start = fromDate ?? sorted[0]?.date
  const end = toDate ?? sorted[sorted.length - 1]?.date
  if (!start || !end) return sorted

  const byDate = new Map(sorted.map((point) => [point.date, point]))
  const filled: AnalyticsTrendPointDto[] = []
  const cursor = new Date(`${start}T00:00:00Z`)
  const endTime = new Date(`${end}T00:00:00Z`).getTime()

  while (cursor.getTime() <= endTime) {
    const key = cursor.toISOString().slice(0, 10)
    filled.push(
      byDate.get(key) ?? {
        date: key,
        qualifiedPlays: 0,
        totalListenSec: 0,
        sessions: 0,
        completions: 0,
        skips: 0,
        likes: 0,
      },
    )
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return filled
}

export function trendToChartPoints(
  points: AnalyticsTrendPointDto[],
  valueKey: keyof Pick<AnalyticsTrendPointDto, 'qualifiedPlays' | 'sessions' | 'likes' | 'completions'> = 'qualifiedPlays',
) {
  return points.map((point) => ({
    label: point.date.slice(5).replace('-', '/'),
    value: point[valueKey],
  }))
}

export function buildSparklinePath(values: number[], width = 100, height = 36): string {
  if (!values.length) return ''
  const max = Math.max(1, ...values)
  const min = Math.min(...values)
  const range = Math.max(1, max - min)
  const step = values.length > 1 ? width / (values.length - 1) : width

  return values
    .map((value, index) => {
      const x = index * step
      const y = height - ((value - min) / range) * (height - 4) - 2
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

export function buildLineChartPaths(
  points: Array<{ label: string; value: number }>,
  width = 600,
  height = 200,
  padding = { top: 12, right: 12, bottom: 28, left: 36 },
) {
  if (!points.length) {
    return { linePath: '', areaPath: '', labels: [] as Array<{ x: number; label: string }>, yTicks: [] as number[] }
  }

  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const max = Math.max(1, ...points.map((p) => p.value))
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW

  const coords = points.map((point, index) => {
    const x = padding.left + index * step
    const y = padding.top + innerH - (point.value / max) * innerH
    return { x, y, label: point.label, value: point.value }
  })

  const linePath =
    coords.length === 1
      ? (() => {
          const c = coords[0]
          const span = Math.min(48, innerW / 2)
          return `M ${(c.x - span).toFixed(2)} ${c.y.toFixed(2)} L ${(c.x + span).toFixed(2)} ${c.y.toFixed(2)}`
        })()
      : coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(' ')

  const areaPath =
    coords.length === 1
      ? (() => {
          const c = coords[0]
          const span = Math.min(48, innerW / 2)
          const baseY = (padding.top + innerH).toFixed(2)
          return `M ${(c.x - span).toFixed(2)} ${c.y.toFixed(2)} L ${(c.x + span).toFixed(2)} ${c.y.toFixed(2)} L ${(c.x + span).toFixed(2)} ${baseY} L ${(c.x - span).toFixed(2)} ${baseY} Z`
        })()
      : `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${(padding.top + innerH).toFixed(2)} L ${coords[0].x.toFixed(2)} ${(padding.top + innerH).toFixed(2)} Z`

  const labelEvery = Math.max(1, Math.ceil(points.length / 6))
  const labels = coords
    .filter((_, index) => index % labelEvery === 0 || index === coords.length - 1)
    .map((c) => ({ x: c.x, label: c.label }))

  const yTicks = [0, max * 0.5, max].map((v) => Math.round(v))

  return { linePath, areaPath, labels, yTicks, max }
}

export function formatReleaseDate(date?: string): string {
  if (!date) return 'Release date TBD'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatEventDateBlock(date?: string) {
  if (!date) return { month: 'TBD', day: '—' }
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return { month: 'TBD', day: '—' }
  return {
    month: parsed.toLocaleDateString(undefined, { month: 'short' }),
    day: String(parsed.getDate()),
  }
}
