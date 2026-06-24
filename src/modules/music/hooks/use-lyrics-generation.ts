import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  generateTrackLyrics,
  getLyricsGenerationStatus,
  type LyricsGenerationStage,
  type LyricsGenerationStatus,
} from '@/modules/agents/api/agents.api'
import { getArtistTrack } from '@/modules/music/api/music.api'
import { invalidateTrackLyricsQueries } from '@/modules/music/lib/invalidate-track-lyrics'
import { lyricsGenerationStageLabel } from '@/modules/music/lib/lyrics-generation-labels'
import type { SyncedLyricLineDto } from '@/modules/music/types/lyrics-sync.types'

const POLL_INTERVAL_MS = 1000
const ACTIVE_STATUSES: LyricsGenerationStatus[] = ['queued', 'processing']

interface UseLyricsGenerationOptions {
  trackId?: string
  onLyricsChange?: (lyrics: string) => void
  onSyncedLyricsSave?: (
    payload: { lyrics: string; syncedLyrics: SyncedLyricLineDto[] },
  ) => void | Promise<void>
}

export function useLyricsGeneration({
  trackId,
  onLyricsChange,
  onSyncedLyricsSave,
}: UseLyricsGenerationOptions) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<LyricsGenerationStatus>('idle')
  const [stage, setStage] = useState<LyricsGenerationStage | undefined>()
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const applyTrackLyrics = useCallback(
    async (apiTrackId: string) => {
      const track = await getArtistTrack(apiTrackId)
      if (track.lyrics) onLyricsChange?.(track.lyrics)
      if (track.lyrics && track.syncedLyrics?.length) {
        await onSyncedLyricsSave?.({
          lyrics: track.lyrics,
          syncedLyrics: track.syncedLyrics,
        })
      }
      invalidateTrackLyricsQueries(queryClient, { trackId: apiTrackId })
    },
    [onLyricsChange, onSyncedLyricsSave, queryClient],
  )

  const applyStatusPayload = useCallback((result: Awaited<ReturnType<typeof getLyricsGenerationStatus>>) => {
    setStatus(result.status)
    setStage(result.stage)
    setProgress(result.progress ?? (result.status === 'queued' ? 5 : 0))
    setError(result.error ?? null)
  }, [])

  const pollStatus = useCallback(
    async (apiTrackId: string) => {
      try {
        const result = await getLyricsGenerationStatus(apiTrackId)
        applyStatusPayload(result)

        if (result.status === 'completed') {
          stopPolling()
          setProgress(100)
          await applyTrackLyrics(apiTrackId)
          toast.success('Lyrics generated successfully')
          return
        }

        if (result.status === 'failed') {
          stopPolling()
          toast.error(result.error ?? 'Lyrics generation failed')
        }
      } catch (err) {
        stopPolling()
        const message = err instanceof Error ? err.message : 'Failed to check lyrics status'
        setError(message)
        setStatus('failed')
        toast.error(message)
      }
    },
    [applyStatusPayload, applyTrackLyrics, stopPolling],
  )

  const startPolling = useCallback(
    (apiTrackId: string) => {
      stopPolling()
      void pollStatus(apiTrackId)
      pollRef.current = setInterval(() => {
        void pollStatus(apiTrackId)
      }, POLL_INTERVAL_MS)
    },
    [pollStatus, stopPolling],
  )

  const generate = useCallback(async () => {
    if (!trackId) {
      toast.error('Save the track before generating lyrics')
      return
    }

    setError(null)
    setStatus('queued')
    setStage('queued')
    setProgress(5)

    try {
      const result = await generateTrackLyrics(trackId)
      applyStatusPayload(result)
      if (ACTIVE_STATUSES.includes(result.status)) {
        startPolling(trackId)
        return
      }
      if (result.status === 'completed') {
        setProgress(100)
        await applyTrackLyrics(trackId)
        toast.success('Lyrics generated successfully')
        return
      }
      if (result.status === 'failed') {
        toast.error('Lyrics generation failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start lyrics generation'
      setError(message)
      setStatus('failed')
      toast.error(message)
    }
  }, [applyStatusPayload, applyTrackLyrics, startPolling, trackId])

  useEffect(() => {
    if (!trackId) {
      setStatus('idle')
      setStage(undefined)
      setProgress(0)
      setError(null)
      stopPolling()
      return
    }

    let cancelled = false

    void (async () => {
      try {
        const result = await getLyricsGenerationStatus(trackId)
        if (cancelled) return
        applyStatusPayload(result)
        if (ACTIVE_STATUSES.includes(result.status)) {
          startPolling(trackId)
        }
      } catch {
        if (!cancelled) {
          setStatus('idle')
        }
      }
    })()

    return () => {
      cancelled = true
      stopPolling()
    }
  }, [trackId, applyStatusPayload, startPolling, stopPolling])

  const isGenerating = ACTIVE_STATUSES.includes(status)
  const statusLabel = lyricsGenerationStageLabel(stage, status)

  return {
    status,
    stage,
    progress,
    statusLabel,
    error,
    isGenerating,
    generate,
  }
}
