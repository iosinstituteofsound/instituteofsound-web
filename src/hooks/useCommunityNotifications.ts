import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  COMMUNITY_NOTIFICATION_EVENT,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationsRead,
  type CommunityNotification,
} from '@/lib/community/notificationService'
import { COMMUNITY_FOLLOW_EVENT } from '@/lib/community/followService'

export function useCommunityNotifications() {
  const { user } = useAuth()
  const [items, setItems] = useState<CommunityNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([])
      setUnread(0)
      return
    }
    setLoading(true)
    try {
      const [list, count] = await Promise.all([
        fetchNotifications(40),
        fetchUnreadNotificationCount(),
      ])
      setItems(list)
      setUnread(count)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refresh()
    const onChange = () => void refresh()
    window.addEventListener(COMMUNITY_NOTIFICATION_EVENT, onChange)
    window.addEventListener(COMMUNITY_FOLLOW_EVENT, onChange)
    return () => {
      window.removeEventListener(COMMUNITY_NOTIFICATION_EVENT, onChange)
      window.removeEventListener(COMMUNITY_FOLLOW_EVENT, onChange)
    }
  }, [refresh])

  const markAllRead = useCallback(async () => {
    await markNotificationsRead()
    await refresh()
  }, [refresh])

  const markRead = useCallback(
    async (ids: string[]) => {
      await markNotificationsRead(ids)
      await refresh()
    },
    [refresh]
  )

  return { items, unread, loading, refresh, markAllRead, markRead }
}
