import type { RankLevel, RankTier } from '@/components/ui/RankEmblem'
import type { User, UserAuthorization } from '@/lib/auth/types'
import type { CommunityRank } from '@/types'
import { roleLabel } from '@/lib/auth/roles'

const RANK_EMBLEM: Record<CommunityRank, { tier: RankTier; level: RankLevel }> = {
  Listener: { tier: 'iron', level: 'I' },
  Scout: { tier: 'bronze', level: 'II' },
  Curator: { tier: 'silver', level: 'III' },
  Archivist: { tier: 'gold', level: 'IV' },
  'Signal Host': { tier: 'platinum', level: 'V' },
  Operator: { tier: 'signal', level: 'V' },
}

export function memberProfileCompletion(user: User): number {
  const checks = [
    Boolean(user.name?.trim()),
    Boolean(user.email?.trim()),
    Boolean(user.username?.trim()),
    Boolean(user.avatarUrl?.trim()),
    Boolean(user.bio?.trim()),
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

export function rankEmblemForCommunityRank(rank: CommunityRank) {
  return RANK_EMBLEM[rank]
}

export function rankMetaLine(
  rank: CommunityRank,
  rankProgressPct: number,
  nextRank: CommunityRank | null,
  dbToNextRank: number,
): string {
  if (!nextRank) return `${rank} · max tier`
  if (dbToNextRank > 0) {
    return `${rankProgressPct}% to ${nextRank} · ${dbToNextRank.toLocaleString()} dB`
  }
  return `${rankProgressPct}% to ${nextRank}`
}

export function communityActivityLabel(weeklyDb: number, postCount: number): {
  label: string
  meta: string
} {
  if (weeklyDb >= 100 || postCount >= 5) {
    return { label: 'High', meta: "You're very active!" }
  }
  if (weeklyDb >= 25 || postCount >= 1) {
    return { label: 'Steady', meta: 'Keep posting on the wire.' }
  }
  return { label: 'Quiet', meta: 'Open the feed to engage.' }
}

export function workspaceRoleLabel(authorization?: UserAuthorization): string {
  return `Listener / ${roleLabel(authorization)}`
}
