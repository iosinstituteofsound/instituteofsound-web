import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { DmMessage, DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { isGroupChatThread } from '@/modules/messenger/utils/message-delivery-utils'
import {
  buildMessageListRows,
  getLastOutgoingMessageId,
  type MessageListRow,
} from '@/modules/messenger/utils/message-list-utils'

/** With column-reverse, scrollTop ≈ 0 is the newest end (bottom). */
const NEAR_BOTTOM_THRESHOLD = 80
const SHOW_SCROLL_TO_BOTTOM_THRESHOLD = 120
/** Load older history near the opposite end. */
const NEAR_TOP_THRESHOLD = 120

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
  const prevScrollHeightRef = useRef<number | null>(null)
  const prevMessageCountRef = useRef(0)
  const activeThreadIdRef = useRef(threadId)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [belowScrollCount, setBelowScrollCount] = useState(0)

  useEffect(() => {
    if (!threadId || activeThreadIdRef.current === threadId) return
    activeThreadIdRef.current = threadId
    prevScrollHeightRef.current = null
    prevMessageCountRef.current = 0
    shouldStickToBottom.current = true
    setShowScrollToBottom(false)
    setBelowScrollCount(0)
  }, [threadId])

  // Newest-first so column-reverse pins the latest messages at the visual bottom.
  const rows = useMemo<MessageListRow[]>(() => {
    const built = buildMessageListRows(messages, viewerId, isGroupChatThread(thread))
    return [...built].reverse()
  }, [messages, thread, viewerId])

  const lastOutgoingId = useMemo(
    () => getLastOutgoingMessageId(messages, viewerId),
    [messages, viewerId],
  )

  /** Bottom = scrollTop 0 under column-reverse. */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const node = scrollRef.current
    if (!node) return
    if (behavior === 'smooth') {
      node.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    node.scrollTop = 0
  }, [])

  const markAtBottom = useCallback(() => {
    shouldStickToBottom.current = true
    setShowScrollToBottom(false)
    setBelowScrollCount(0)
  }, [])

  const jumpToBottom = useCallback(() => {
    scrollToBottom('smooth')
    markAtBottom()
  }, [markAtBottom, scrollToBottom])

  useLayoutEffect(() => {
    const node = scrollRef.current
    if (!node || !messages.length) return

    // Preserve position when older pages prepend (DOM grows at the far end).
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
      if (autoScroll) {
        scrollToBottom('auto')
      }
      setBelowScrollCount(0)
      prevMessageCountRef.current = messages.length
      return
    }

    if (messages.length > prevMessageCountRef.current) {
      setBelowScrollCount((current) => current + (messages.length - prevMessageCountRef.current))
    }

    prevMessageCountRef.current = messages.length
  }, [autoScroll, messages.length, messages[messages.length - 1]?.id, scrollToBottom])

  useEffect(() => {
    const node = scrollRef.current
    if (!node) return

    const onScroll = () => {
      const distanceFromBottom = node.scrollTop
      const distanceFromTop = node.scrollHeight - node.clientHeight - node.scrollTop
      const isNearBottom = distanceFromBottom < NEAR_BOTTOM_THRESHOLD

      shouldStickToBottom.current = isNearBottom
      setShowScrollToBottom(distanceFromBottom > SHOW_SCROLL_TO_BOTTOM_THRESHOLD)

      if (isNearBottom) {
        setBelowScrollCount(0)
      }

      if (
        distanceFromTop < NEAR_TOP_THRESHOLD &&
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
