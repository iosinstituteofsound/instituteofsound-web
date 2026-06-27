import { useMemo } from 'react'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmMessage } from '@/modules/messenger/types/messenger.types'

export function useChatSearch(messages: DmMessage[]) {
  const chatSearchQuery = useMessengerUiStore((s) => s.chatSearchQuery)
  const highlightedMessageId = useMessengerUiStore((s) => s.highlightedMessageId)
  const setHighlightedMessageId = useMessengerUiStore((s) => s.setHighlightedMessageId)

  const needle = chatSearchQuery.trim().toLowerCase()

  const matchingMessageIds = useMemo(() => {
    if (!needle) return []
    return messages
      .filter(
        (message) =>
          message.type !== 'system' &&
          !message.deletedAt &&
          (message.body?.toLowerCase().includes(needle) ||
            message.mediaFileName?.toLowerCase().includes(needle) ||
            message.senderName?.toLowerCase().includes(needle)),
      )
      .map((message) => message.id)
  }, [messages, needle])

  const activeMatchIndex = highlightedMessageId
    ? matchingMessageIds.indexOf(highlightedMessageId)
    : -1

  const goToNextMatch = () => {
    if (!matchingMessageIds.length) return null
    const nextIndex = activeMatchIndex < 0 ? 0 : (activeMatchIndex + 1) % matchingMessageIds.length
    const nextId = matchingMessageIds[nextIndex]!
    setHighlightedMessageId(nextId)
    return nextId
  }

  const goToPrevMatch = () => {
    if (!matchingMessageIds.length) return null
    const prevIndex =
      activeMatchIndex <= 0 ? matchingMessageIds.length - 1 : activeMatchIndex - 1
    const prevId = matchingMessageIds[prevIndex]!
    setHighlightedMessageId(prevId)
    return prevId
  }

  return {
    needle,
    matchingMessageIds,
    matchCount: matchingMessageIds.length,
    activeMatchIndex,
    highlightedMessageId,
    goToNextMatch,
    goToPrevMatch,
  }
}
