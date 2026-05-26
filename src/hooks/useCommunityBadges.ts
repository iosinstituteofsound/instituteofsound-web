import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { COMMUNITY_BADGE_EVENT } from '@/lib/community/grantBadge'
import { fetchUserBadges, type EarnedBadge } from '@/lib/community/service'

export function useCommunityBadges(userId?: string | null) {
  const { user } = useAuth()
  const targetId = userId ?? user?.id
  const [badges, setBadges] = useState<EarnedBadge[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!targetId) {
      setBadges([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setBadges(await fetchUserBadges(targetId))
    } finally {
      setLoading(false)
    }
  }, [targetId])

  useEffect(() => {
    void refresh()
    const onBadge = () => void refresh()
    window.addEventListener(COMMUNITY_BADGE_EVENT, onBadge)
    return () => window.removeEventListener(COMMUNITY_BADGE_EVENT, onBadge)
  }, [refresh])

  return { badges, loading, refresh }
}
