export type RelativeTimeStyle = 'notification' | 'dashboard' | 'comment'

export function formatRelativeTime(
  iso?: string,
  style: RelativeTimeStyle = 'notification',
): string {
  if (!iso) {
    return style === 'dashboard' ? 'Recently' : 'Just now'
  }

  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) {
    return style === 'dashboard' ? 'Recently' : 'Just now'
  }

  const diffMs = Date.now() - then
  const minutes = Math.floor(diffMs / 60_000)

  if (minutes < 1) return 'Just now'

  if (style === 'comment') {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d`
    const weeks = Math.floor(days / 7)
    if (weeks < 5) return `${weeks}w`
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  if (minutes < 60) {
    if (style === 'dashboard') return `${minutes} min ago`
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/** @deprecated Use formatRelativeTime(iso, 'comment') */
export function formatCommentTimestamp(value: string) {
  return formatRelativeTime(value, 'comment')
}
