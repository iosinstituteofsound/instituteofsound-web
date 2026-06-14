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
import { COMMENT_EVENT } from '@/lib/community/commentService'
import { COMMUNITY_FEED_EVENT } from '@/lib/community/feedService'

const POLL_MS = 45_000

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
        fetchNotifications(40, user.id),
        fetchUnreadNotificationCount(user.id),
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
    window.addEventListener(COMMENT_EVENT, onChange)
    window.addEventListener(COMMUNITY_FEED_EVENT, onChange)
    return () => {
      window.removeEventListener(COMMUNITY_NOTIFICATION_EVENT, onChange)
      window.removeEventListener(COMMUNITY_FOLLOW_EVENT, onChange)
      window.removeEventListener(COMMENT_EVENT, onChange)
      window.removeEventListener(COMMUNITY_FEED_EVENT, onChange)
    }
  }, [refresh])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [refresh])

  useEffect(() => {
    if (!user) return
    const timer = window.setInterval(() => void refresh(), POLL_MS)
    return () => window.clearInterval(timer)
  }, [user, refresh])

  const markAllRead = useCallback(async () => {
    if (!user) return
    await markNotificationsRead(undefined, user.id)
    await refresh()
  }, [refresh, user])

  const markRead = useCallback(
    async (ids: string[]) => {
      if (!user) return
      await markNotificationsRead(ids, user.id)
      await refresh()
    },
    [refresh, user]
  )

  return { items, unread, loading, refresh, markAllRead, markRead }
}
