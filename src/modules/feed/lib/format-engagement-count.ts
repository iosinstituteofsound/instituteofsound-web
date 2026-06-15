export function formatEngagementCount(value: number): string {
  if (value >= 1_000_000) {
    const compact = value / 1_000_000
    return `${compact >= 10 ? Math.round(compact) : compact.toFixed(1).replace(/\.0$/, '')}M`
  }

  if (value >= 1_000) {
    const compact = value / 1_000
    return `${compact >= 10 ? Math.round(compact) : compact.toFixed(1).replace(/\.0$/, '')}K`
  }

  return String(value)
}
