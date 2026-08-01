import { useQuery } from '@tanstack/react-query'
import * as nationApi from '@/modules/feed/api/nation.api'
import {
  normalizeNationRankTier,
  rankMetaFromDbScore,
} from '@/modules/feed/lib/nation-rank-meta'
import { tokenStorage } from '@/shared/services/api/token-storage'

export const nationHubQueryKey = ['nation', 'hub'] as const

export function useNationHub() {
  const query = useQuery({
    queryKey: nationHubQueryKey,
    queryFn: nationApi.getNationHub,
    enabled: tokenStorage.hasSession(),
    staleTime: 60_000,
  })

  const hub = query.data
  const dbScore = hub?.dbScore.value ?? 0
  const lifetimeEarned = hub?.lifetimeEarned ?? dbScore
  const computedRank = hub ? rankMetaFromDbScore(lifetimeEarned) : null
  const apiTier = normalizeNationRankTier(hub?.rank.tier)
  const rankTier = apiTier ?? computedRank?.tier ?? 'voyager'
  const rankTierLabel =
    hub?.rank.tierLabel ?? computedRank?.tierLabel ?? 'Voyager'
  const rankLevelLabel =
    hub?.rank.levelLabel ?? computedRank?.levelLabel ?? 'I'

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    networkScore: hub?.networkScore.value ?? 0,
    networkScoreCap: hub?.networkScore.cap ?? 10_000,
    networkTrendPct: hub?.networkScore.weeklyTrendPct ?? 0,
    networkSparkline: hub?.networkScore.sparkline ?? [],
    dbScore,
    lifetimeEarned,
    dbTrendDelta: hub?.dbScore.weeklyDelta ?? 0,
    dbSparkline: hub?.dbScore.sparkline ?? [],
    rankTier,
    rankTierLabel,
    rankLevelLabel,
    rankPercentile: hub?.rank.percentile ?? 99,
    genreWar: hub?.genreWar,
  }
}
