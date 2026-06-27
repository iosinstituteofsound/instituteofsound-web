import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'
import {
  buildMessageListRows,
  getLastOutgoingMessageId,
  type MessageListRow,
} from '@/modules/messenger/utils/message-list-utils'

type UseMessageListOptions = {
  messages: DmMessage[]
  viewerId?: string | null
  autoScroll?: boolean
}

export function useMessageList({
  messages,
  viewerId,
  autoScroll = true,
}: UseMessageListOptions) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const shouldStickToBottom = useRef(true)

  const rows = useMemo<MessageListRow[]>(
    () => buildMessageListRows(messages, viewerId),
    [messages, viewerId],
  )

  const lastOutgoingId = useMemo(
    () => getLastOutgoingMessageId(messages, viewerId),
    [messages, viewerId],
  )

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior })
  }, [])

  useEffect(() => {
    if (!autoScroll || !shouldStickToBottom.current || !messages.length) return
    scrollToBottom('smooth')
  }, [autoScroll, messages.length, scrollToBottom])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    const onScroll = () => {
      const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight
      shouldStickToBottom.current = distanceFromBottom < 120
    }
    node.addEventListener('scroll', onScroll, { passive: true })
    return () => node.removeEventListener('scroll', onScroll)
  }, [])

  return {
    scrollRef,
    rows,
    lastOutgoingId,
    scrollToBottom,
  }
}
