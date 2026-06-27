import { useCallback, useEffect, useRef } from 'react'
import { realtimeSocketClient } from '@/shared/services/realtime/socket-client'

export function useTypingEmitter(threadId: string) {
  const typingTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
      realtimeSocketClient.emitTypingStop(threadId)
    }
  }, [threadId])

  const notifyTyping = useCallback(() => {
    realtimeSocketClient.emitTypingStart(threadId)
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = window.setTimeout(() => {
      realtimeSocketClient.emitTypingStop(threadId)
    }, 1200)
  }, [threadId])

  const stopTyping = useCallback(() => {
    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current)
    realtimeSocketClient.emitTypingStop(threadId)
  }, [threadId])

  return { notifyTyping, stopTyping }
}
