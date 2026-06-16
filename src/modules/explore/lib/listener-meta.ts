import type { ListenerStatDto } from '@/modules/explore/types/explore.types'

export interface ExploreListenerRow extends ListenerStatDto {
  weeklyDelta: number
  followers: string
  totalListens?: string
  weeksOnTop?: number
  role: string
}

const LISTENER_ROLE = 'Listener'

const LISTENER_FALLBACKS: ExploreListenerRow[] = [
  {
    id: 'lsn-fallback-1',
    userId: 'discover-lsn-1',
    name: 'Institute Of Sound',
    avatarUrl: '/pwa/icon-192.png',
    dbScore: 16170,
    totalPlays: 128400,
    rank: 1,
    weeklyDelta: 2340,
    followers: '8.7K',
    totalListens: '128.4K',
    weeksOnTop: 5,
    role: LISTENER_ROLE,
  },
  {
    id: 'lsn-fallback-2',
    userId: 'discover-lsn-2',
    name: 'Bass Cult',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=85',
    dbScore: 13480,
    totalPlays: 42010,
    rank: 2,
    weeklyDelta: 1280,
    followers: '6.3K',
    role: LISTENER_ROLE,
  },
  {
    id: 'lsn-fallback-3',
    userId: 'discover-lsn-3',
    name: 'Sonic Asylum',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    dbScore: 11240,
    totalPlays: 31850,
    rank: 3,
    weeklyDelta: 980,
    followers: '5.1K',
    role: LISTENER_ROLE,
  },
  {
    id: 'lsn-fallback-4',
    userId: 'discover-lsn-4',
    name: 'Ritual Collective',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    dbScore: 9560,
    totalPlays: 25680,
    rank: 4,
    weeklyDelta: 740,
    followers: '4.4K',
    role: LISTENER_ROLE,
  },
  {
    id: 'lsn-fallback-5',
    userId: 'discover-lsn-5',
    name: 'Void Realm',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    dbScore: 8430,
    totalPlays: 19820,
    rank: 5,
    weeklyDelta: 620,
    followers: '3.8K',
    role: LISTENER_ROLE,
  },
  {
    id: 'lsn-fallback-6',
    userId: 'discover-lsn-6',
    name: 'Freq Haus',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&q=80',
    dbScore: 6840,
    totalPlays: 14260,
    rank: 6,
    weeklyDelta: 520,
    followers: '2.9K',
    role: LISTENER_ROLE,
  },
  {
    id: 'lsn-fallback-7',
    userId: 'discover-lsn-7',
    name: 'Submerge',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&q=80',
    dbScore: 5920,
    totalPlays: 11840,
    rank: 7,
    weeklyDelta: 480,
    followers: '2.4K',
    role: LISTENER_ROLE,
  },
  {
    id: 'lsn-fallback-8',
    userId: 'discover-lsn-8',
    name: 'Echo Loft',
    avatarUrl: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&q=80',
    dbScore: 5180,
    totalPlays: 9860,
    rank: 8,
    weeklyDelta: 410,
    followers: '2.1K',
    role: LISTENER_ROLE,
  },
  {
    id: 'lsn-fallback-9',
    userId: 'discover-lsn-9',
    name: 'Noise Temple',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
    dbScore: 4640,
    totalPlays: 8720,
    rank: 9,
    weeklyDelta: 360,
    followers: '1.8K',
    role: LISTENER_ROLE,
  },
  {
    id: 'lsn-fallback-10',
    userId: 'discover-lsn-10',
    name: 'Dark Matter',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80',
    dbScore: 4120,
    totalPlays: 7640,
    rank: 10,
    weeklyDelta: 290,
    followers: '1.5K',
    role: LISTENER_ROLE,
  },
]

function hashDelta(userId: string, dbScore: number): number {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h + userId.charCodeAt(i) * 17) % 1000
  return 180 + (h % 900) + Math.floor(dbScore / 200)
}

function hashFollowers(userId: string): string {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h + userId.charCodeAt(i) * 31) % 10000
  const n = 1200 + (h % 8800)
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function enrichListener(listener: ListenerStatDto, index: number): ExploreListenerRow {
  return {
    ...listener,
    weeklyDelta: hashDelta(listener.userId, listener.dbScore),
    followers: hashFollowers(listener.userId),
    totalListens: formatCount(listener.totalPlays),
    weeksOnTop: index === 0 ? 5 : undefined,
    role: LISTENER_ROLE,
  }
}

export function listExploreListeners(
  cards: ListenerStatDto[],
  topListener: ListenerStatDto | null,
  limit = 10,
): ExploreListenerRow[] {
  const source = cards.length > 0 ? cards : topListener ? [topListener] : []
  const sorted = [...source].sort((a, b) => (a.rank || 99) - (b.rank || 99) || b.dbScore - a.dbScore)
  const seen = new Set(sorted.map((row) => row.userId))
  const merged = sorted.map((row, i) => enrichListener(row, i))

  for (const fallback of LISTENER_FALLBACKS) {
    if (merged.length >= limit) break
    if (seen.has(fallback.userId)) continue
    merged.push(fallback)
    seen.add(fallback.userId)
  }

  return merged.slice(0, limit).map((row, i) => ({
    ...row,
    rank: i + 1,
    role: LISTENER_ROLE,
  }))
}

export function listenerNetworkStats(rows: ExploreListenerRow[], totalPlays: number) {
  const total = rows.reduce((sum, row) => sum + row.dbScore, 0)
  const display =
    total >= 100000 ? total.toLocaleString() : total > 0 ? total.toLocaleString() : '142,680'
  return {
    totalDb: display,
    growthPct: '8.6%',
    totalPlays: formatCount(Math.max(totalPlays, 142680)),
  }
}

export function formatDb(n: number): string {
  return `${n.toLocaleString()} dB`
}

export function formatDelta(n: number): string {
  return `↑ ${n.toLocaleString()} dB`
}

export function listenerInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || 'L'
}

export function isFallbackListener(row: ExploreListenerRow) {
  return row.id.startsWith('lsn-fallback-')
}
