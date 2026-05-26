import type { CommunityRank } from '@/types'

export const COMMUNITY_RANKS: CommunityRank[] = [
  'Listener',
  'Scout',
  'Curator',
  'Archivist',
  'Signal Host',
  'Operator',
]

export const RANK_THRESHOLDS_DB: Record<CommunityRank, number> = {
  Listener: 0,
  Scout: 500,
  Curator: 1500,
  Archivist: 4000,
  'Signal Host': 8000,
  Operator: 15000,
}

export const RANK_DESCRIPTIONS: Record<CommunityRank, string> = {
  Listener: 'Tuned in. Receiving transmissions.',
  Scout: 'Discovers hidden frequencies.',
  Curator: "Shapes the archive's direction.",
  Archivist: 'Preserves underground history.',
  'Signal Host': 'Broadcasts to the network.',
  Operator: 'Commands the entire system.',
}

export function rankFromDb(totalDb: number): CommunityRank {
  if (totalDb >= RANK_THRESHOLDS_DB.Operator) return 'Operator'
  if (totalDb >= RANK_THRESHOLDS_DB['Signal Host']) return 'Signal Host'
  if (totalDb >= RANK_THRESHOLDS_DB.Archivist) return 'Archivist'
  if (totalDb >= RANK_THRESHOLDS_DB.Curator) return 'Curator'
  if (totalDb >= RANK_THRESHOLDS_DB.Scout) return 'Scout'
  return 'Listener'
}

export function nextRankAfter(current: CommunityRank): CommunityRank | null {
  const idx = COMMUNITY_RANKS.indexOf(current)
  if (idx < 0 || idx >= COMMUNITY_RANKS.length - 1) return null
  return COMMUNITY_RANKS[idx + 1]!
}

export function dbToNextRank(totalDb: number): number {
  const rank = rankFromDb(totalDb)
  const next = nextRankAfter(rank)
  if (!next) return 0
  return Math.max(0, RANK_THRESHOLDS_DB[next] - totalDb)
}

export function rankProgressPercent(totalDb: number): number {
  const rank = rankFromDb(totalDb)
  const next = nextRankAfter(rank)
  if (!next) return 100
  const floor = RANK_THRESHOLDS_DB[rank]
  const ceiling = RANK_THRESHOLDS_DB[next]
  const span = ceiling - floor
  if (span <= 0) return 100
  return Math.min(100, Math.max(0, Math.round(((totalDb - floor) / span) * 100)))
}

export function rankInfoList() {
  return COMMUNITY_RANKS.map((rank, i) => ({
    rank,
    level: i + 1,
    description: RANK_DESCRIPTIONS[rank],
    thresholdDb: RANK_THRESHOLDS_DB[rank],
  }))
}
