import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { pullAndMergeAcademyProgress } from '@/lib/academy/cloudProgress'
import { notifyProgressChange, setAcademySyncUserId } from '@/lib/academy/progress'
import { setCommunityUserId } from '@/lib/community/academyHooks'
import { setCommunityGenreId } from '@/lib/community/genreContext'
import { evaluateWeeklyChallenges } from '@/lib/community/challengeService'
import { syncCommunityGenreFromProfile } from '@/lib/community/service'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export function AcademyProgressSync() {
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user?.id || !isSupabaseConfigured()) {
      setAcademySyncUserId(null)
      setCommunityUserId(null)
      setCommunityGenreId(null)
      return
    }

    setAcademySyncUserId(user.id)
    setCommunityUserId(user.id)
    void syncCommunityGenreFromProfile(user.id).then(() => void evaluateWeeklyChallenges())
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
      setCommunityGenreId(null)
    }
  }, [user?.id, user?.name, loading])

  return null
}
