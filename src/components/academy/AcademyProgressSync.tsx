import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { pullAndMergeAcademyProgress } from '@/lib/academy/cloudProgress'
import { notifyProgressChange, setAcademySyncUserId } from '@/lib/academy/progress'
import { setCommunityUserId } from '@/lib/community/academyHooks'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export function AcademyProgressSync() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user?.id || !isSupabaseConfigured()) {
      setAcademySyncUserId(null)
      setCommunityUserId(null)
      return
    }

    setAcademySyncUserId(user.id)
    setCommunityUserId(user.id)
    let cancelled = false

    pullAndMergeAcademyProgress(user.id, user.name)
      .then(() => {
        if (!cancelled) notifyProgressChange()
      })
      .catch((err) => console.warn('[academy] pull failed:', err))

    return () => {
      cancelled = true
      setAcademySyncUserId(null)
      setCommunityUserId(null)
    }
  }, [user?.id, user?.name, loading])

  return null
}
