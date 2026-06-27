import { useCallback, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { messengerThreadsQueryKey } from '@/modules/messenger/hooks/use-messenger-threads'
import { useMessengerUiStore } from '@/modules/messenger/store/messenger-ui-store'
import type { DmThreadSummary } from '@/modules/messenger/types/messenger.types'

export function useThreadInfoPanel(thread?: DmThreadSummary | null, onLeave?: () => void) {
  const queryClient = useQueryClient()
  const setShowChatSearch = useMessengerUiStore((s) => s.setShowChatSearch)
  const [busy, setBusy] = useState(false)

  const membersQuery = useQuery({
    queryKey: ['messenger', 'group-members', thread?.threadId],
    queryFn: () => messengerApi.listGroupMembers(thread!.threadId),
    enabled: Boolean(thread?.threadId && thread.kind === 'group'),
  })

  const mediaQuery = useQuery({
    queryKey: ['messenger', 'thread-media', thread?.threadId],
    queryFn: () => messengerApi.listMediaMessages(thread!.threadId),
    enabled: Boolean(thread?.threadId),
  })

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: messengerThreadsQueryKey })
  }, [queryClient])

  const toggleMute = useCallback(async () => {
    if (!thread) return
    setBusy(true)
    try {
      await messengerApi.updateThreadParticipant(thread.threadId, { muted: !thread.isMuted })
      invalidate()
    } finally {
      setBusy(false)
    }
  }, [invalidate, thread])

  const toggleArchive = useCallback(async () => {
    if (!thread) return
    setBusy(true)
    try {
      await messengerApi.updateThreadParticipant(thread.threadId, { archived: !thread.isArchived })
      invalidate()
    } finally {
      setBusy(false)
    }
  }, [invalidate, thread])

  const blockOtherUser = useCallback(async () => {
    if (!thread?.otherUserId) return
    setBusy(true)
    try {
      await messengerApi.blockUser(thread.otherUserId)
      invalidate()
    } finally {
      setBusy(false)
    }
  }, [invalidate, thread?.otherUserId])

  const openSearch = useCallback(() => {
    setShowChatSearch(true)
  }, [setShowChatSearch])

  const leaveChat = useCallback(async () => {
    if (!thread) return
    setBusy(true)
    try {
      if (thread.kind === 'group') {
        await messengerApi.leaveGroup(thread.threadId)
      } else if (thread.kind === 'community' && thread.communitySlug) {
        await messengerApi.leaveCommunity(thread.communitySlug)
      }
      invalidate()
      onLeave?.()
    } finally {
      setBusy(false)
    }
  }, [invalidate, onLeave, thread])

  return {
    busy,
    members: membersQuery.data ?? [],
    mediaMessages: mediaQuery.data ?? [],
    toggleMute,
    toggleArchive,
    blockOtherUser,
    openSearch,
    leaveChat,
    canLeave: thread?.kind === 'group' || thread?.kind === 'community',
  }
}
