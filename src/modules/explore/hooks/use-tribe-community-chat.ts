import { useCallback, useState } from 'react'
import * as messengerApi from '@/modules/messenger/api/messenger.api'
import { openMessengerPopup } from '@/modules/messenger/lib/messenger-popup-open'

export function useTribeCommunityChat() {
  const [busySlug, setBusySlug] = useState<string | null>(null)

  const openTribeChat = useCallback(async (slug: string) => {
    setBusySlug(slug)
    try {
      const thread = await messengerApi.joinCommunity(slug)
      void openMessengerPopup({ threadId: thread.threadId })
    } finally {
      setBusySlug(null)
    }
  }, [])

  return { busySlug, openTribeChat }
}
