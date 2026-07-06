import { useQuery } from '@tanstack/react-query'
import * as tribesApi from '@/modules/tribes/api/tribes.api'

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: tribesApi.listGenres,
    staleTime: 60_000,
  })
}

export function useGenre(slug: string) {
  return useQuery({
    queryKey: ['genres', slug],
    queryFn: () => tribesApi.getGenre(slug),
    enabled: Boolean(slug),
  })
}

export function useAlliances(params?: { genre?: string; sort?: 'score' | 'weeklyDb'; limit?: number }) {
  return useQuery({
    queryKey: ['alliances', params],
    queryFn: () => tribesApi.listAlliances(params),
    staleTime: 30_000,
  })
}

export function useAlliance(slug: string) {
  return useQuery({
    queryKey: ['alliances', slug],
    queryFn: () => tribesApi.getAlliance(slug),
    enabled: Boolean(slug),
  })
}

export function useMyAlliance() {
  return useQuery({
    queryKey: ['my-alliance'],
    queryFn: tribesApi.getMyAlliance,
    staleTime: 15_000,
  })
}

export function useAllianceMembershipGate(viewingSlug?: string) {
  const mineQuery = useMyAlliance()
  const myAlliance = mineQuery.data?.alliance ?? null
  const isInAlliance = Boolean(myAlliance)
  const isViewingOwnAlliance = Boolean(viewingSlug && myAlliance && myAlliance.slug === viewingSlug)
  const isBlockedFromJoining = Boolean(
    viewingSlug && isInAlliance && myAlliance && myAlliance.slug !== viewingSlug,
  )

  return {
    myAlliance,
    membership: mineQuery.data?.membership,
    myThreadId: mineQuery.data?.threadId ?? myAlliance?.allianceThreadId,
    isInAlliance,
    isViewingOwnAlliance,
    isBlockedFromJoining,
    canJoinAlliance: !isInAlliance,
    canCreateAlliance: !isInAlliance,
    isLoading: mineQuery.isLoading,
  }
}

export function useAllianceLeaderboard(params?: {
  genre?: string
  period?: 'week' | 'season' | 'score'
  limit?: number
}) {
  return useQuery({
    queryKey: ['alliance-leaderboard', params],
    queryFn: () => tribesApi.getAllianceLeaderboard(params),
    staleTime: 30_000,
  })
}
