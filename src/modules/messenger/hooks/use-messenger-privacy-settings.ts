import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import * as messengerApi from '@/modules/messenger/api/messenger.api'

export function useMessengerPrivacySettings() {
  const [showBlocked, setShowBlocked] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const blockedQuery = useQuery({
    queryKey: ['messenger', 'blocked-users'],
    queryFn: messengerApi.listBlockedUsers,
    enabled: showBlocked,
  })

  const archivedQuery = useQuery({
    queryKey: ['messenger', 'archived-threads'],
    queryFn: () => messengerApi.listThreads({ includeArchived: true, bucket: 'archived' }),
    enabled: showArchived,
  })

  const unblock = useCallback(async (userId: string) => {
    await messengerApi.unblockUser(userId)
    void blockedQuery.refetch()
  }, [blockedQuery])

  return {
    showBlocked,
    setShowBlocked,
    showArchived,
    setShowArchived,
    blockedUsers: blockedQuery.data ?? [],
    archivedThreads: archivedQuery.data ?? [],
    unblock,
    isLoadingBlocked: blockedQuery.isLoading,
    isLoadingArchived: archivedQuery.isLoading,
  }
}
