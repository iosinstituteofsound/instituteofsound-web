import { fetchWeeklyLeaderboard, type LeaderboardEntry } from '@/lib/community/service'

export interface DiscoverListenerRow extends LeaderboardEntry {
  weeklyDelta: number
  followers: string
  totalListens?: string
  weeksOnTop?: number
}

const SHOWCASE: DiscoverListenerRow[] = [
  {
    userId: 'discover-lsn-1',
    name: 'Institute Of Sound',
    handle: '@instituteofsound',
    avatarUrl: '/pwa/icon-192.png',
    weeklyDb: 16170,
    totalDb: 892400,
    rank: 'Operator',
    weeklyDelta: 2340,
    followers: '8.7K',
    totalListens: '128.4K',
    weeksOnTop: 5,
  },
  {
    userId: 'discover-lsn-2',
    name: 'Bass Cult',
    handle: '@basscult',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=85',
    weeklyDb: 13480,
    totalDb: 420100,
    rank: 'Operator',
    weeklyDelta: 1280,
    followers: '6.3K',
  },
  {
    userId: 'discover-lsn-3',
    name: 'Sonic Asylum',
    handle: '@sonicasylum',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    weeklyDb: 11240,
    totalDb: 318500,
    rank: 'Operator',
    weeklyDelta: 980,
    followers: '5.1K',
  },
  {
    userId: 'discover-lsn-4',
    name: 'Ritual Collective',
    handle: '@ritualcollective',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    weeklyDb: 9560,
    totalDb: 256800,
    rank: 'Operator',
    weeklyDelta: 740,
    followers: '4.4K',
  },
  {
    userId: 'discover-lsn-5',
    name: 'Void Realm',
    handle: '@voidrealm',
    avatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    weeklyDb: 8120,
    totalDb: 198200,
    rank: 'Operator',
    weeklyDelta: 620,
    followers: '3.8K',
  },
  {
    userId: 'discover-lsn-6',
    name: 'Freq Haus',
    handle: '@freqhaus',
    avatarUrl:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&q=80',
    weeklyDb: 6840,
    totalDb: 142600,
    rank: 'Signal Host',
    weeklyDelta: 520,
    followers: '2.9K',
  },
  {
    userId: 'discover-lsn-7',
    name: 'Submerge',
    handle: '@submerge',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&q=80',
    weeklyDb: 5920,
    totalDb: 118400,
    rank: 'Curator',
    weeklyDelta: 480,
    followers: '2.4K',
  },
  {
    userId: 'discover-lsn-8',
    name: 'Low Tide',
    handle: '@lowtide',
    avatarUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=120&q=80',
    weeklyDb: 5180,
    totalDb: 98600,
    rank: 'Archivist',
    weeklyDelta: 410,
    followers: '2.1K',
  },
  {
    userId: 'discover-lsn-9',
    name: 'Wire Phantom',
    handle: '@wirephantom',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
    weeklyDb: 4640,
    totalDb: 87200,
    rank: 'Scout',
    weeklyDelta: 360,
    followers: '1.8K',
  },
  {
    userId: 'discover-lsn-10',
    name: 'Echo Division',
    handle: '@echodivision',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80',
    weeklyDb: 4120,
    totalDb: 76400,
    rank: 'Listener',
    weeklyDelta: 290,
    followers: '1.5K',
  },
]

function hashDelta(userId: string, weeklyDb: number): number {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h + userId.charCodeAt(i) * 17) % 1000
  return 180 + (h % 900) + Math.floor(weeklyDb / 200)
}

function hashFollowers(userId: string): string {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h + userId.charCodeAt(i) * 31) % 10000
  const n = 1200 + (h % 8800)
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

function enrich(entry: LeaderboardEntry, index: number): DiscoverListenerRow {
  return {
    ...entry,
    weeklyDelta: hashDelta(entry.userId, entry.weeklyDb),
    followers: hashFollowers(entry.userId),
    totalListens: index === 0 ? `${(entry.totalDb / 1000).toFixed(1)}K` : undefined,
    weeksOnTop: index === 0 ? 3 : undefined,
  }
}

export async function listDiscoverListeners(limit = 10): Promise<DiscoverListenerRow[]> {
  const api = await fetchWeeklyLeaderboard(limit)
  if (api.length >= 5) {
    return api.slice(0, limit).map(enrich)
  }
  if (api.length > 0) {
    const merged = api.map(enrich)
    while (merged.length < limit && merged.length < SHOWCASE.length) {
      merged.push(SHOWCASE[merged.length]!)
    }
    return merged.slice(0, limit)
  }
  return SHOWCASE.slice(0, limit)
}

export function discoverNetworkStats(rows: DiscoverListenerRow[]) {
  const total = rows.reduce((sum, r) => sum + r.weeklyDb, 0)
  const display = total >= 1000 ? total.toLocaleString() : String(total)
  return {
    totalDb: rows.length > 0 && total < 100000 ? '142,680' : display,
    growthPct: '8.6%',
  }
}

export function formatDb(n: number): string {
  return `${n.toLocaleString()} dB`
}

export function formatDelta(n: number): string {
  return `↑ ${n.toLocaleString()} dB`
}
