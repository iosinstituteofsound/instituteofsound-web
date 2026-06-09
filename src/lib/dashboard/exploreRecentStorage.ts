export type ExploreRecentEntry = {
  key: string
  title: string
  meta: string
  href: string
  tone: number
  openedAt: string
}

const KEY_PREFIX = 'ios_explore_recent_v1'

function storageKey(userId?: string): string {
  return `${KEY_PREFIX}:${userId ?? 'anon'}`
}

export function readExploreRecent(userId?: string, limit = 4): ExploreRecentEntry[] {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as ExploreRecentEntry[]
    return parsed.slice(0, limit)
  } catch {
    return []
  }
}

export function pushExploreRecent(
  entry: Omit<ExploreRecentEntry, 'openedAt'>,
  userId?: string,
): void {
  try {
    const existing = readExploreRecent(userId, 20).filter((row) => row.key !== entry.key)
    const next: ExploreRecentEntry[] = [
      { ...entry, openedAt: new Date().toISOString() },
      ...existing,
    ].slice(0, 12)
    localStorage.setItem(storageKey(userId), JSON.stringify(next))
  } catch {
    /* ignore quota / private mode */
  }
}
