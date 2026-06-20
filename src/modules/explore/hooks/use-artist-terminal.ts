import { useEffect, useMemo, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProfileDiscography } from '@/modules/explore/api/explore.api'
import type { ArtistProfileDto, ReleaseDto } from '@/modules/explore/types/explore.types'
import {
  buildArtistTerminalStats,
  collectDiscographyReleases,
  type ArtistTerminalStats,
} from '@/modules/explore/lib/artist-terminal-data'

type UseArtistTerminalOptions = {
  fallbackArtist?: ArtistProfileDto
  listReleases: ReleaseDto[]
  statsReleases: ReleaseDto[]
}

type UseArtistTerminalResult = {
  artist?: ArtistProfileDto
  artistReleases: ReleaseDto[]
  stats: ArtistTerminalStats | null
}

export function useArtistTerminal({
  fallbackArtist,
  listReleases,
  statsReleases,
}: UseArtistTerminalOptions): UseArtistTerminalResult {
  const queryClient = useQueryClient()
  const refreshTimerRef = useRef<number | undefined>(undefined)
  const userId = fallbackArtist?.userId

  const { data: discography } = useQuery({
    queryKey: ['profile-discography', userId],
    queryFn: () => getProfileDiscography(userId!),
    enabled: Boolean(userId),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (!userId) return

    const refresh = (event?: Event) => {
      const detail = (event as CustomEvent<{ userId?: string }> | undefined)?.detail
      if (detail?.userId && detail.userId !== userId) return

      window.clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = window.setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ['profile-discography', userId] })
        void queryClient.invalidateQueries({ queryKey: ['explore'] })
        void queryClient.invalidateQueries({ queryKey: ['release-detail'] })
      }, event?.type === 'ios:listen-flushed' ? 5000 : 0)
    }

    window.addEventListener('ios:artist-updated', refresh)
    window.addEventListener('ios:listen-flushed', refresh)
    return () => {
      window.removeEventListener('ios:artist-updated', refresh)
      window.removeEventListener('ios:listen-flushed', refresh)
      window.clearTimeout(refreshTimerRef.current)
    }
  }, [queryClient, userId])

  const artist = discography?.artist ?? fallbackArtist

  const artistReleases = useMemo(() => {
    if (discography) return collectDiscographyReleases(discography)
    return listReleases
  }, [discography, listReleases])

  const stats = useMemo(
    () => (artist ? buildArtistTerminalStats(artist, discography, statsReleases) : null),
    [artist, discography, statsReleases],
  )

  return { artist, artistReleases, stats }
}
