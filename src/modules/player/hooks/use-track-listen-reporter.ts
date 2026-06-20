import { useCallback, useEffect, useRef } from 'react'
import { randomUUID } from '@/shared/lib/random-uuid'
import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { PlayerTrack } from '@/modules/player/types/player.types'
import { getListenerGeoHint, type ListenerGeoHint } from '@/modules/player/lib/listener-geo'

const ANON_KEY = 'ios_listen_anon_id'
const PROGRESS_FLUSH_SEC = 10
const MIN_FLUSH_SEC = 3

function getAnonymousId(): string {
  try {
    let id = sessionStorage.getItem(ANON_KEY)
    if (!id) {
      id = randomUUID()
      sessionStorage.setItem(ANON_KEY, id)
    }
    return id
  } catch {
    return randomUUID()
  }
}

function newSessionId(): string {
  return randomUUID()
}

function isMongoId(value?: string) {
  return Boolean(value && /^[a-f0-9]{24}$/i.test(value))
}

type FlushPayload = {
  sessionId: string
  listenedSec: number
  trackDurationSec?: number
  completed?: boolean
  skippedEarly?: boolean
  endedEarly?: boolean
  anonymousId?: string
  geoHint?: ListenerGeoHint
}

async function postListen(trackId: string, payload: FlushPayload, releaseId?: string) {
  try {
    const { data } = await apiClient.post<{ data?: { accepted?: boolean } }>(
      `${API_V1}/music/tracks/${trackId}/listen`,
      payload,
    )
    const accepted = data?.data?.accepted !== false
    if (accepted && releaseId) {
      window.dispatchEvent(new CustomEvent('ios:listen-flushed', { detail: { releaseId } }))
    }
    return accepted
  } catch {
    return false
  }
}

export function useTrackListenReporter(
  track: PlayerTrack | null,
  isPlaying: boolean,
  getCurrentTime: () => number,
) {
  const sessionIdRef = useRef<string | null>(null)
  const lastTickRef = useRef<number>(Date.now())
  const accumulatedRef = useRef(0)
  const lastFlushedSecRef = useRef(0)
  const geoHintRef = useRef<ListenerGeoHint | undefined>(undefined)
  const trackRef = useRef(track)
  const getCurrentTimeRef = useRef(getCurrentTime)
  trackRef.current = track
  getCurrentTimeRef.current = getCurrentTime

  useEffect(() => {
    void getListenerGeoHint().then((hint) => {
      geoHintRef.current = hint
    })
  }, [])

  const resolveListenedSec = useCallback(() => {
    return Math.max(accumulatedRef.current, Math.floor(getCurrentTimeRef.current()))
  }, [])

  const flush = useCallback(
    async (opts?: {
      completed?: boolean
      skippedEarly?: boolean
      endedEarly?: boolean
      force?: boolean
    }) => {
      const t = trackRef.current
      const mongoTrackId = t?.trackId ?? (isMongoId(t?.id) ? t?.id : undefined)
      if (!t?.releaseId || !mongoTrackId) return false

      const listenedSec = resolveListenedSec()
      if (!opts?.force && listenedSec < MIN_FLUSH_SEC && !opts?.completed) return false
      if (listenedSec <= lastFlushedSecRef.current && !opts?.completed) return false

      const durationSec = t.durationSec ?? 0
      const ok = await postListen(
        mongoTrackId,
        {
          sessionId: sessionIdRef.current ?? newSessionId(),
          listenedSec,
          trackDurationSec: durationSec > 0 ? durationSec : undefined,
          completed: opts?.completed,
          skippedEarly: opts?.skippedEarly,
          endedEarly: opts?.endedEarly,
          anonymousId: getAnonymousId(),
          geoHint: geoHintRef.current,
        },
        t.releaseId,
      )

      if (ok) {
        lastFlushedSecRef.current = listenedSec
      }

      return ok
    },
    [resolveListenedSec],
  )

  const flushRef = useRef(flush)
  flushRef.current = flush

  useEffect(() => {
    sessionIdRef.current = newSessionId()
    accumulatedRef.current = 0
    lastFlushedSecRef.current = 0
    lastTickRef.current = Date.now()
  }, [track?.trackId, track?.id, track?.releaseId])

  useEffect(() => {
    if (!isPlaying || !track?.releaseId) return

    const tick = () => {
      if (document.visibilityState === 'hidden') return
      const now = Date.now()
      const delta = (now - lastTickRef.current) / 1000
      lastTickRef.current = now
      if (delta > 0 && delta < 5) {
        accumulatedRef.current += delta
      }
    }

    const intervalId = window.setInterval(tick, 1000)
    const progressId = window.setInterval(() => {
      void flushRef.current()
    }, PROGRESS_FLUSH_SEC * 1000)

    return () => {
      window.clearInterval(intervalId)
      window.clearInterval(progressId)
    }
  }, [isPlaying, track?.releaseId])

  useEffect(() => {
    return () => {
      const t = trackRef.current
      if (!t?.releaseId) return
      const listenedSec = resolveListenedSec()
      if (listenedSec < MIN_FLUSH_SEC) return
      if (listenedSec < 15) {
        void flushRef.current({ skippedEarly: true, endedEarly: true, force: true })
      } else {
        void flushRef.current({ endedEarly: true, force: true })
      }
    }
  }, [track?.trackId, track?.id, resolveListenedSec])

  const reportCompleted = useCallback(() => {
    accumulatedRef.current = Math.max(accumulatedRef.current, getCurrentTimeRef.current())
    return flushRef.current({ completed: true, force: true })
  }, [])

  const reportPause = useCallback((listenedSec: number) => {
    accumulatedRef.current = Math.max(accumulatedRef.current, listenedSec)
    if (listenedSec < 15) {
      return flushRef.current({ skippedEarly: true, endedEarly: true, force: true })
    }
    return flushRef.current({ endedEarly: true, force: true })
  }, [])

  return {
    reportCompleted,
    reportPause,
  }
}
