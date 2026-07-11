import { useCallback, useEffect, useRef } from 'react'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'

const TYPING_EMIT_DEBOUNCE_MS = 400

/**
 * typing:start — when draft content grows (debounced).
 * mode = replying when composer has a reply target (mobile shows "replying…").
 * Mode changes while composing force an immediate re-emit (debounce bypass).
 */
export function useTypingEmitter(threadId: string, mode: 'typing' | 'replying' = 'typing') {
  const isComposingRef = useRef(false)
  const lastEmitAtRef = useRef(0)
  const lastEmittedModeRef = useRef<'typing' | 'replying' | null>(null)
  const modeRef = useRef(mode)
  const debounceTimerRef = useRef<number | null>(null)
  modeRef.current = mode

  const clearDebounce = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  const emitStart = useCallback(() => {
    if (!threadId) return
    const nextMode = modeRef.current
    lastEmitAtRef.current = Date.now()
    lastEmittedModeRef.current = nextMode
    realtimeSocketClient.emitTypingStart(threadId, nextMode)
  }, [threadId])

  const stopTyping = useCallback(() => {
    clearDebounce()
    const wasComposing = isComposingRef.current
    const hadStart = lastEmitAtRef.current > 0
    isComposingRef.current = false
    lastEmitAtRef.current = 0
    lastEmittedModeRef.current = null
    if (!threadId) return
    if (wasComposing || hadStart) {
      realtimeSocketClient.emitTypingStop(threadId)
    }
  }, [clearDebounce, threadId])

  const cancelPendingTyping = useCallback(() => {
    clearDebounce()
  }, [clearDebounce])

  // Reply banner opened/closed while already composing → push new mode immediately.
  useEffect(() => {
    if (!isComposingRef.current) return
    if (lastEmittedModeRef.current === mode) return
    clearDebounce()
    emitStart()
  }, [mode, clearDebounce, emitStart])

  useEffect(() => {
    return () => {
      clearDebounce()
      if (threadId && isComposingRef.current) {
        realtimeSocketClient.emitTypingStop(threadId)
      }
      isComposingRef.current = false
      lastEmitAtRef.current = 0
      lastEmittedModeRef.current = null
    }
  }, [clearDebounce, threadId])

  const notifyTyping = useCallback(() => {
    if (!threadId) return
    isComposingRef.current = true

    const modeChanged = lastEmittedModeRef.current !== modeRef.current
    const elapsed = Date.now() - lastEmitAtRef.current
    if (modeChanged || lastEmitAtRef.current === 0 || elapsed >= TYPING_EMIT_DEBOUNCE_MS) {
      clearDebounce()
      emitStart()
      return
    }

    clearDebounce()
    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null
      if (!isComposingRef.current) return
      emitStart()
    }, TYPING_EMIT_DEBOUNCE_MS - elapsed)
  }, [clearDebounce, emitStart, threadId])

  return { notifyTyping, stopTyping, cancelPendingTyping }
}
