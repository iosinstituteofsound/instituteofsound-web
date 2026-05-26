import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { useCommunityGenres } from '@/hooks/useCommunityGenres'
import { setPrimaryGenre, needsCommunityOnboarding, syncCommunityGenreFromProfile } from '@/lib/community/service'
import { CommunityGenreGrid } from '@/components/community/CommunityGenreGrid'
import { Button } from '@/components/ui/Button'
import type { CommunityGenre } from '@/lib/community/service'

const DISMISS_KEY = 'ios_community_onboarding_dismiss'

interface CommunityGenreOnboardingProps {
  open: boolean
  onClose: () => void
}

export function CommunityGenreOnboarding({ open, onClose }: CommunityGenreOnboardingProps) {
  const { user } = useAuth()
  const { stats, refresh } = useCommunityMemberStats()
  const { genres, loading: genresLoading } = useCommunityGenres()
  const [selected, setSelected] = useState<CommunityGenre | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dismissLater = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
    onClose()
  }

  const confirm = async () => {
    if (!user?.id || !selected) return
    setSaving(true)
    setError(null)
    try {
      await setPrimaryGenre(user.id, selected.id, selected.slug)
      await syncCommunityGenreFromProfile(user.id)
      await refresh()
      try {
        sessionStorage.removeItem(DISMISS_KEY)
      } catch {
        /* ignore */
      }
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your tribe.')
    } finally {
      setSaving(false)
    }
  }

  if (!open || !user || !needsCommunityOnboarding(stats)) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="community-onboarding-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="community-onboarding-title"
        >
          <motion.div
            className="community-onboarding-panel ios-card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <p className="ios-kicker">The Network · Phase 1</p>
            <h2 id="community-onboarding-title" className="community-onboarding-title">
              Pick your taste tribe
            </h2>
            <p className="community-onboarding-lead">
              Choose the genre that defines your signal. This powers your community identity and
              future genre leaderboards.
            </p>

            {genresLoading ? (
              <p className="text-sm text-muted">Loading genres…</p>
            ) : (
              <CommunityGenreGrid
                genres={genres}
                selectedId={selected?.id}
                onSelect={setSelected}
                disabled={saving}
              />
            )}

            {error && <p className="text-sm text-mh-red mt-3">{error}</p>}

            <div className="community-onboarding-actions">
              <Button
                type="button"
                variant="primary"
                disabled={!selected || saving}
                onClick={() => void confirm()}
              >
                {saving ? 'Locking in…' : 'Join the network'}
              </Button>
              <button
                type="button"
                className="community-onboarding-skip"
                onClick={dismissLater}
                disabled={saving}
              >
                Later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function isOnboardingDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}
