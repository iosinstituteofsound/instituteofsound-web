import { useEffect, useRef } from 'react'
import { getPlayerState, savePlayerState } from '@/modules/player/api/player-state.api'
import {
  applyServerPlayerState,
  PLAYER_STATE_SYNC_FIELDS,
  serializePlayerState,
} from '@/modules/player/lib/player-state-serialize'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { tokenStorage } from '@/shared/services/api/token-storage'

const SAVE_DEBOUNCE_MS = 1200
const LEGACY_STORAGE_KEY = 'ios-player'

/** Syncs authenticated player state with the API (database-backed). */
export function usePlayerStateSync() {
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

    if (!tokenStorage.hasSession()) {
      markReady()
      return
    }

    hydratingRef.current = true

    void getPlayerState()
      .then((saved) => {
        if (saved?.currentTrack) {
          usePlayerStore.setState(applyServerPlayerState(saved))
        }
      })
      .catch(() => {
        /* keep in-memory defaults */
      })
      .finally(() => {
        hydratingRef.current = false
        markReady()
      })

    const scheduleSave = () => {
      if (!tokenStorage.hasSession() || hydratingRef.current) return

      const state = usePlayerStore.getState()
      const payload = serializePlayerState(state)
      const snapshot = JSON.stringify(payload)
      if (snapshot === lastSavedRef.current) return

      window.clearTimeout(saveTimerRef.current)
      saveTimerRef.current = window.setTimeout(() => {
        void savePlayerState(payload)
          .then(() => {
            lastSavedRef.current = snapshot
          })
          .catch(() => {
            /* retry on next change */
          })
      }, SAVE_DEBOUNCE_MS)
    }

    const flushSave = () => {
      if (!tokenStorage.hasSession() || hydratingRef.current) return
      const payload = serializePlayerState(usePlayerStore.getState())
      const snapshot = JSON.stringify(payload)
      if (snapshot === lastSavedRef.current) return
      void savePlayerState(payload)
        .then(() => {
          lastSavedRef.current = snapshot
        })
        .catch(() => {
          /* ignore */
        })
    }

    const unsubscribe = usePlayerStore.subscribe((state, prev) => {
      const changed = PLAYER_STATE_SYNC_FIELDS.some((key) => state[key] !== prev[key])
      if (changed) scheduleSave()
    })

    const onPageHide = () => flushSave()
    window.addEventListener('pagehide', onPageHide)

    return () => {
      unsubscribe()
      window.removeEventListener('pagehide', onPageHide)
      window.clearTimeout(saveTimerRef.current)
    }
  }, [])
}

export function PlayerStateSync() {
  usePlayerStateSync()
  return null
}
