import type { IllustratorTrendPointDto } from '@/modules/illustrator/types/illustrator.types'

export type DashboardAccent = 'primary' | 'success' | 'warning' | 'info'

export function filterIllustratorTrendByDays(points: IllustratorTrendPointDto[], days: number) {
  const cutoff = new Date()
  cutoff.setUTCDate(cutoff.getUTCDate() - days)
  const cutoffKey = cutoff.toISOString().slice(0, 10)
  return points.filter((p) => p.date >= cutoffKey)
}

export function computeIllustratorPeriodDelta(
  points: IllustratorTrendPointDto[],
  days: number,
  getValue: (point: IllustratorTrendPointDto) => number,
): number | null {
  if (!points.length) return null

  const now = new Date()
  const recentCutoff = new Date(now)
  recentCutoff.setUTCDate(recentCutoff.getUTCDate() - days)
  const priorCutoff = new Date(recentCutoff)
  priorCutoff.setUTCDate(priorCutoff.getUTCDate() - days)

  const recentKey = recentCutoff.toISOString().slice(0, 10)
  const priorKey = priorCutoff.toISOString().slice(0, 10)

  const sumRange = (from: string, to: string) =>
    points
      .filter((p) => p.date >= from && p.date < to)
      .reduce((sum, p) => sum + getValue(p), 0)

  const recent = sumRange(recentKey, now.toISOString().slice(0, 10))
  const prior = sumRange(priorKey, recentKey)

  if (prior === 0) return recent > 0 ? 1 : null
  return (recent - prior) / prior
}

export function formatIllustratorCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

export function deltaClass(delta: number | null) {
  if (delta == null) return 'is-flat'
  if (delta > 0) return 'is-up'
  if (delta < 0) return 'is-down'
  return 'is-flat'
}

export function formatDelta(delta: number | null, suffix = '%') {
  if (delta == null) return '—'
  const pct = Math.round(delta * 100)
  if (pct === 0) return '0%'
  return `${pct > 0 ? '+' : ''}${pct}${suffix}`
}

export function buildSparklinePath(values: number[]) {
  if (!values.length) return ''
  const max = Math.max(...values, 1)
  const step = values.length > 1 ? 100 / (values.length - 1) : 100
  return values
    .map((value, index) => {
      const x = index * step
      const y = 36 - (value / max) * 30
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}
