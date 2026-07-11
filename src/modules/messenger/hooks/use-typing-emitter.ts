import { useCallback, useEffect, useRef } from 'react'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'

const TYPING_EMIT_DEBOUNCE_MS = 400

/**
 * typing:start — when draft content grows (debounced).
 * mode = replying when composer has a reply target (mobile shows "replying…").
 * typing:stop — always emitted on stopTyping() so mobile can show "confused".
 */
export function useTypingEmitter(threadId: string, mode: 'typing' | 'replying' = 'typing') {
  const isComposingRef = useRef(false)
  const lastEmitAtRef = useRef(0)
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
    lastEmitAtRef.current = Date.now()
    realtimeSocketClient.emitTypingStart(threadId, modeRef.current)
  }, [threadId])

  const stopTyping = useCallback(() => {
    clearDebounce()
    const wasComposing = isComposingRef.current
    const hadStart = lastEmitAtRef.current > 0
    isComposingRef.current = false
    lastEmitAtRef.current = 0
    if (!threadId) return
    if (wasComposing || hadStart) {
      realtimeSocketClient.emitTypingStop(threadId)
    }
  }, [clearDebounce, threadId])

  const cancelPendingTyping = useCallback(() => {
    clearDebounce()
  }, [clearDebounce])

  useEffect(() => {
    return () => {
      clearDebounce()
      if (threadId && isComposingRef.current) {
        realtimeSocketClient.emitTypingStop(threadId)
      }
      isComposingRef.current = false
      lastEmitAtRef.current = 0
    }
  }, [clearDebounce, threadId])

  const notifyTyping = useCallback(() => {
    if (!threadId) return
    isComposingRef.current = true

    const elapsed = Date.now() - lastEmitAtRef.current
    if (lastEmitAtRef.current === 0 || elapsed >= TYPING_EMIT_DEBOUNCE_MS) {
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
