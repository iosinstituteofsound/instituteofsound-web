/** Compact stat display for profile headers (e.g. 4.2K). */
export function formatNetworkCount(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}M`
  }
  if (n >= 10_000) return `${Math.round(n / 1000)}K`
  if (n >= 1000) {
    const v = n / 1000
    return `${v >= 10 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, '')}K`
  }
  return n.toLocaleString()
}
