import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { DmMessage, DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { isGroupChatThread } from '@/modules/messenger/utils/message-delivery-utils'
import {
  buildMessageListRows,
  getLastOutgoingMessageId,
  type MessageListRow,
} from '@/modules/messenger/utils/message-list-utils'

const NEAR_TOP_THRESHOLD = 80
const NEAR_BOTTOM_THRESHOLD = 120
const SHOW_SCROLL_TO_BOTTOM_THRESHOLD = 150

type UseMessageListOptions = {
  threadId?: string
  thread?: DmThreadSummary | null
  messages: DmMessage[]
  viewerId?: string | null
  autoScroll?: boolean
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
}

export function useMessageList({
  threadId,
  thread,
  messages,
  viewerId,
  autoScroll = true,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}: UseMessageListOptions) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const shouldStickToBottom = useRef(true)
  const hasInitialScrolled = useRef(false)
  const prevScrollHeightRef = useRef<number | null>(null)
  const prevMessageCountRef = useRef(0)
  const activeThreadIdRef = useRef(threadId)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [belowScrollCount, setBelowScrollCount] = useState(0)

  useEffect(() => {
    if (!threadId || activeThreadIdRef.current === threadId) return
    activeThreadIdRef.current = threadId
    hasInitialScrolled.current = false
    prevScrollHeightRef.current = null
    prevMessageCountRef.current = 0
    shouldStickToBottom.current = true
    setShowScrollToBottom(false)
    setBelowScrollCount(0)
  }, [threadId])

  const rows = useMemo<MessageListRow[]>(
    () => buildMessageListRows(messages, viewerId, isGroupChatThread(thread)),
    [messages, thread, viewerId],
  )

  const lastOutgoingId = useMemo(
    () => getLastOutgoingMessageId(messages, viewerId),
    [messages, viewerId],
  )

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior })
    if (behavior === 'auto') {
      node.scrollTop = node.scrollHeight
    }
  }, [])

  const scrollToBottomReliable = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      scrollToBottom(behavior)
      requestAnimationFrame(() => {
        scrollToBottom('auto')
        window.setTimeout(() => scrollToBottom('auto'), 50)
        window.setTimeout(() => scrollToBottom('auto'), 150)
      })
    },
    [scrollToBottom],
  )

  const markAtBottom = useCallback(() => {
    shouldStickToBottom.current = true
    setShowScrollToBottom(false)
    setBelowScrollCount(0)
  }, [])

  const jumpToBottom = useCallback(() => {
    scrollToBottomReliable('smooth')
    markAtBottom()
  }, [markAtBottom, scrollToBottomReliable])

  useLayoutEffect(() => {
    const node = scrollRef.current
    if (!node || !messages.length) return

    if (!hasInitialScrolled.current) {
      scrollToBottomReliable('auto')
      hasInitialScrolled.current = true
      prevMessageCountRef.current = messages.length
      markAtBottom()
      return
    }

    if (prevScrollHeightRef.current != null) {
      const delta = node.scrollHeight - prevScrollHeightRef.current
      if (delta > 0) {
        node.scrollTop += delta
      }
      prevScrollHeightRef.current = null
      prevMessageCountRef.current = messages.length
      return
    }

    if (shouldStickToBottom.current) {
      if (autoScroll && messages.length > prevMessageCountRef.current) {
        scrollToBottomReliable('smooth')
      }
      setBelowScrollCount(0)
      prevMessageCountRef.current = messages.length
      return
    }

    if (messages.length > prevMessageCountRef.current) {
      setBelowScrollCount((current) => current + (messages.length - prevMessageCountRef.current))
    }

    prevMessageCountRef.current = messages.length
  }, [autoScroll, markAtBottom, messages.length, scrollToBottomReliable])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return

    const onScroll = () => {
      const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight
      const isNearBottom = distanceFromBottom < NEAR_BOTTOM_THRESHOLD
      shouldStickToBottom.current = isNearBottom
      setShowScrollToBottom(distanceFromBottom > SHOW_SCROLL_TO_BOTTOM_THRESHOLD)

      if (isNearBottom) {
        setBelowScrollCount(0)
      }

      if (
        node.scrollTop < NEAR_TOP_THRESHOLD &&
        hasNextPage &&
        !isFetchingNextPage &&
        fetchNextPage
      ) {
        prevScrollHeightRef.current = node.scrollHeight
        fetchNextPage()
      }
    }

    node.addEventListener('scroll', onScroll, { passive: true })
    return () => node.removeEventListener('scroll', onScroll)
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  return {
    scrollRef,
    rows,
    lastOutgoingId,
    showScrollToBottom,
    belowScrollCount,
    jumpToBottom,
  }
}
