import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { DM_EVENT, getUnreadTotal, isMessagingAvailable } from '@/lib/dm/service'
import { COMMUNITY_NOTIFICATION_EVENT } from '@/lib/community/notificationService'

export function useDmUnread() {
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)

  const refresh = useCallback(async () => {
    if (!user || !isMessagingAvailable()) {
      setUnread(0)
      return
    }
    setUnread(await getUnreadTotal())
  }, [user])

  useEffect(() => {
    void refresh()
    const onChange = () => void refresh()
    window.addEventListener(DM_EVENT, onChange)
    window.addEventListener(COMMUNITY_NOTIFICATION_EVENT, onChange)
    const poll = window.setInterval(() => void refresh(), 30000)
    return () => {
      window.removeEventListener(DM_EVENT, onChange)
      window.removeEventListener(COMMUNITY_NOTIFICATION_EVENT, onChange)
      window.clearInterval(poll)
    }
  }, [refresh])

  return unread
}
