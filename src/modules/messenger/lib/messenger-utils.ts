export function formatMessengerTime(iso?: string) {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  if (now.getFullYear() === date.getFullYear()) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatMessageDateSeparator(iso: string) {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function groupMessagesByDate<T extends { createdAt: string }>(messages: T[]) {
  const groups: Array<{ key: string; label: string; items: T[] }> = []
  for (const message of messages) {
    const key = message.createdAt.slice(0, 10)
    const last = groups[groups.length - 1]
    if (last?.key === key) {
      last.items.push(message)
    } else {
      groups.push({
        key,
        label: formatMessageDateSeparator(message.createdAt),
        items: [message],
      })
    }
  }
  return groups
}

export function createClientMessageId() {
  return crypto.randomUUID()
}
