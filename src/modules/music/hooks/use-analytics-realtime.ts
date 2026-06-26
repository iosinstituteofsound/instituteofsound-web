import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'
import type { RealtimeAnalyticsEnvelope } from '@/shared/services/realtime/realtime.types'
import { env } from '@/shared/config/env'

type Options = {
  releaseId?: string
  artistProfileId?: string
  artistMode?: boolean
}

export function useAnalyticsRealtime({ releaseId, artistProfileId, artistMode }: Options): void {
  const queryClient = useQueryClient()
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!env.wsEnabled) return undefined

    if (releaseId) {
      void realtimeSocketClient.subscribeRelease(releaseId)
    }
    if (artistMode && artistProfileId) {
      void realtimeSocketClient.subscribeArtist(artistProfileId)
    }

    const invalidate = (envelope: RealtimeAnalyticsEnvelope) => {
      const matchesRelease = releaseId && envelope.releaseId === releaseId
      const matchesArtist =
        artistMode &&
        artistProfileId &&
        envelope.artistProfileId === artistProfileId

      if (!matchesRelease && !matchesArtist) return

      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        if (matchesRelease) {
          void queryClient.invalidateQueries({ queryKey: ['release-analytics', releaseId] })
          void queryClient.invalidateQueries({ queryKey: ['release-analytics-trends', releaseId] })
        }
        if (matchesArtist) {
          void queryClient.invalidateQueries({ queryKey: ['artist-analytics'] })
        }
      }, 1500)
    }

    const unsubscribe = realtimeSocketClient.onAnalyticsUpdated(invalidate)

    return () => {
      unsubscribe()
      window.clearTimeout(timerRef.current)
      if (releaseId) {
        void realtimeSocketClient.unsubscribeRelease(releaseId)
      }
      if (artistMode && artistProfileId) {
        void realtimeSocketClient.unsubscribeArtist(artistProfileId)
      }
    }
  }, [artistMode, artistProfileId, queryClient, releaseId])
}
