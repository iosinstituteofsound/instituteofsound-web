function formatFeedClockTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function formatFeedTimestamp(value: string) {
  const date = new Date(value)
  const day = date.getDate()
  const month = date.toLocaleString(undefined, { month: 'long' })
  return `${day} ${month} at ${formatFeedClockTime(date)}`
}

export function formatFeedTimestampDetail(value: string) {
  const date = new Date(value)
  const weekday = date.toLocaleString(undefined, { weekday: 'long' })
  const day = date.getDate()
  const month = date.toLocaleString(undefined, { month: 'long' })
  const year = date.getFullYear()
  return `${weekday} ${day} ${month} ${year} at ${formatFeedClockTime(date)}`
}

export function formatCommentTimestamp(value: string) {
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`

  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks}w`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
