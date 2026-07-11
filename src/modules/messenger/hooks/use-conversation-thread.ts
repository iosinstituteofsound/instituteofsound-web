import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { isComposerBlockedByRequest } from '@/modules/messenger/components/message-request-banner'
import { useMarkThreadReadWhenViewing } from '@/modules/messenger/hooks/use-mark-thread-read-when-viewing'
import { useMessengerMessages } from '@/modules/messenger/hooks/use-messenger-messages'
import { useThreadTypingUsers } from '@/modules/messenger/hooks/use-thread-typing-users'
import { messengerThreadsQueryKey } from '@/modules/messenger/lib/messenger-cache'
import { getThreadDisplayName, isDirectThread } from '@/modules/messenger/lib/messenger-utils'
import { flattenMessengerMessagePages } from '@/modules/messenger/utils/message-list-utils'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'
import { useAuthStore } from '@/app/stores/auth-store'

type UseConversationThreadOptions = {
  threadId: string | undefined
  thread: DmThreadSummary | null | undefined
  markReadEnabled?: boolean
}

export function useConversationThread({
  threadId,
  thread,
  markReadEnabled = true,
}: UseConversationThreadOptions) {
  const viewerId = useAuthStore((s) => s.userId)
  const queryClient = useQueryClient()
  const forwardFrom = useMessengerUiStore((s) => s.forwardFrom)
  const setForwardFrom = useMessengerUiStore((s) => s.setForwardFrom)
  const { typingUsers, isPeerTyping, phase } = useThreadTypingUsers(threadId, viewerId)

  const messagesQuery = useMessengerMessages(threadId)
  const messages = useMemo(
    () => flattenMessengerMessagePages(messagesQuery.data?.pages),
    [messagesQuery.data?.pages],
  )

  const myMessageCount = useMemo(
    () => messages.filter((m) => m.senderId === viewerId && m.type !== 'system').length,
    [messages, viewerId],
  )

  const composerBlocked = thread ? Boolean(isComposerBlockedByRequest(thread, myMessageCount)) : false
  const isDirect = isDirectThread(thread)
  const displayName = getThreadDisplayName(thread)

  useMarkThreadReadWhenViewing(threadId, messages, viewerId, markReadEnabled)

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
    void messagesQuery.refetch()
  }

  return {
    viewerId,
    messages,
    myMessageCount,
    typingUsers,
    isPeerTyping,
    typingPhase: phase,
    composerBlocked,
    isDirect,
    displayName,
    forwardFrom,
    setForwardFrom,
    invalidate,
    isLoading: messagesQuery.isLoading,
    hasNextPage: messagesQuery.hasNextPage ?? false,
    isFetchingNextPage: messagesQuery.isFetchingNextPage,
    fetchNextPage: messagesQuery.fetchNextPage,
  }
}

export type ConversationThreadView = ReturnType<typeof useConversationThread> & {
  threadId: string
  thread: DmThreadSummary | null | undefined
}
