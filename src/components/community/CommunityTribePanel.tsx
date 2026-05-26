import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCommunityGenres } from '@/hooks/useCommunityGenres'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { setPrimaryGenre, syncCommunityGenreFromProfile } from '@/lib/community/service'
import { CommunityGenreGrid } from '@/components/community/CommunityGenreGrid'
import type { CommunityGenre } from '@/lib/community/service'

export function CommunityTribePanel() {
  const { user } = useAuth()
  const { stats, refresh } = useCommunityMemberStats()
  const { genres, loading } = useCommunityGenres()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (!user || !stats) return null

  const currentId =
    genres.find((g) => g.slug === stats.primaryGenreSlug)?.id ?? null

  const save = async (genre: CommunityGenre) => {
    if (genre.id === currentId) return
    setSaving(true)
    setMessage(null)
    try {
      await setPrimaryGenre(user.id, genre.id, genre.slug)
      await syncCommunityGenreFromProfile(user.id)
      await refresh()
      setMessage(`Tribe updated — ${genre.name}.`)
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Update failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="community-tribe-panel ios-card mb-12" aria-labelledby="tribe-heading">
      <h2 id="tribe-heading" className="font-display text-lg font-bold">
        Your taste tribe
      </h2>
      <p className="text-sm text-muted mt-1 mb-4">
        {stats.primaryGenreSlug
          ? 'Switch your primary tribe anytime. Weekly dB counts toward that genre board.'
          : 'Pick a genre to compete on tribe leaderboards and earn attributed dB.'}
      </p>
      {loading ? (
        <p className="text-sm text-muted">Loading genres…</p>
      ) : (
        <CommunityGenreGrid
          genres={genres}
          selectedId={currentId}
          onSelect={(g) => void save(g)}
          disabled={saving}
          compact
        />
      )}
      {message && <p className="text-xs text-muted mt-3">{message}</p>}
    </section>
  )
}
