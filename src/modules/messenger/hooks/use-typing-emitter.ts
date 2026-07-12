import { useCallback, useEffect, useRef } from 'react'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'

/** While continuously typing/replying, keepalives are debounced to this interval. */
const TYPING_KEEPALIVE_DEBOUNCE_MS = 450

/**
 * If the user paused at least this long (thinking / idle / other status),
 * the next keystroke emits typing/replying immediately — no debounce wait.
 * Keep below TYPING_TO_THINKING_MS so resume feels instant after thinking.
 */
const TYPING_RESUME_IDLE_MS = 500

/**
 * typing:start / replying:
 * - First keystroke, mode change, or resume after idle → emit immediately
 * - Continuous typing → debounce keepalives
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

    const nextMode = modeRef.current
    const modeChanged = lastEmittedModeRef.current !== nextMode
    const idleMs =
      lastEmitAtRef.current === 0 ? Number.POSITIVE_INFINITY : Date.now() - lastEmitAtRef.current

    // Resume from thinking/confused/idle, first start, or typing↔replying → instant.
    if (modeChanged || idleMs >= TYPING_RESUME_IDLE_MS) {
      clearDebounce()
      emitStart()
      return
    }

    // Active burst: throttle keepalives (leading). Don't reset to a full trailing wait
    // or peer can flip to thinking while the user is still typing.
    if (debounceTimerRef.current !== null) return

    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null
      if (!isComposingRef.current) return
      emitStart()
    }, TYPING_KEEPALIVE_DEBOUNCE_MS - idleMs)
  }, [clearDebounce, emitStart, threadId])

  return { notifyTyping, stopTyping, cancelPendingTyping }
}
