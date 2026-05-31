/** Maps lifetime dB to a 0–10 "Noise Score" for profile reputation UI. */
export function noiseScoreFromDb(totalDb: number): number {
  if (totalDb <= 0) return 0
  const score = Math.min(10, Math.log10(totalDb + 1) * 2.2)
  return Math.round(score * 10) / 10
}

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
