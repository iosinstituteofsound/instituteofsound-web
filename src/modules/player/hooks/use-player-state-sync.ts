import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/app/stores/auth-store'
import {
  getPlayerState,
  savePlayerState,
  savePlayerStateKeepalive,
} from '@/modules/player/api/player-state.api'
import {
  applyServerPlayerState,
  serializePlayerState,
} from '@/modules/player/lib/player-state-serialize'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { tokenStorage } from '@/shared/services/api/token-storage'

const SAVE_DEBOUNCE_MS = 1200
const LEGACY_STORAGE_KEY = 'ios-player'

function warnDev(message: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.warn(message, error)
  }
}

/** Syncs authenticated player state with the API (database-backed). */
export function usePlayerStateSync() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hydratingRef = useRef(false)
  const saveTimerRef = useRef<number | undefined>(undefined)
  const lastSavedRef = useRef<string>('')

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      /* ignore */
    }

    const markReady = () => {
      usePlayerStore.setState({ sessionReady: true })
    }

    if (!isAuthenticated || !tokenStorage.hasSession()) {
      markReady()
      return
    }

    let cancelled = false
    let dirtyDuringHydrate = false
    let applyingServerState = false

    const buildPayload = () => {
      const payload = serializePlayerState(usePlayerStore.getState())
      return { payload, snapshot: JSON.stringify(payload) }
    }

    const persist = async (snapshot: string, payload: ReturnType<typeof serializePlayerState>) => {
      try {
        await savePlayerState(payload)
        if (!cancelled) lastSavedRef.current = snapshot
      } catch (error) {
        warnDev('[player-state] save failed', error)
      }
    }

    const scheduleSave = () => {
      if (cancelled || !tokenStorage.hasSession() || hydratingRef.current) return

      const { payload, snapshot } = buildPayload()
      if (snapshot === lastSavedRef.current) return

      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = window.setTimeout(() => {
        void persist(snapshot, payload)
      }, SAVE_DEBOUNCE_MS)
    }

    const flushSave = (keepalive = false) => {
      if (cancelled || !tokenStorage.hasSession() || hydratingRef.current) return

      window.clearTimeout(saveTimerRef.current)

      const { payload, snapshot } = buildPayload()
      if (snapshot === lastSavedRef.current) return

      if (keepalive) {
        savePlayerStateKeepalive(payload)
        lastSavedRef.current = snapshot
        return
      }

      void persist(snapshot, payload)
    }

    hydratingRef.current = true

    const unsubscribe = usePlayerStore.subscribe(() => {
      if (hydratingRef.current && !applyingServerState) {
        dirtyDuringHydrate = true
      }
      scheduleSave()
    })

    const bootstrap = async () => {
      try {
        const saved = await getPlayerState()
        if (cancelled) return

        if (!dirtyDuringHydrate && saved?.currentTrack) {
          applyingServerState = true
          usePlayerStore.setState(applyServerPlayerState(saved))
          applyingServerState = false
        }
      } catch (error) {
        warnDev('[player-state] load failed', error)
      } finally {
        if (cancelled) return

        hydratingRef.current = false
        markReady()

        const { snapshot } = buildPayload()
        if (dirtyDuringHydrate) {
          flushSave()
        } else {
          lastSavedRef.current = snapshot
        }
      }
    }

    void bootstrap()

    const onPageHide = () => flushSave(true)
    window.addEventListener('pagehide', onPageHide)

    return () => {
      cancelled = true
      unsubscribe()
      window.removeEventListener('pagehide', onPageHide)
      window.clearTimeout(saveTimerRef.current)
    }
  }, [isAuthenticated])
}

export function PlayerStateSync() {
  usePlayerStateSync()
  return null
}
