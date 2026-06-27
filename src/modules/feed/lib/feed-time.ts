import { formatRelativeTime as formatRelativeTimeShared } from '@/shared/lib/format-relative-time'

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
  return formatRelativeTimeShared(value, 'comment')
}
