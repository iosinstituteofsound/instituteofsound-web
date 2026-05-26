import { useEffect, useState } from 'react'
import clsx from 'clsx'
import { useCommunityGenres } from '@/hooks/useCommunityGenres'
import { useGenreLeaderboard } from '@/hooks/useGenreLeaderboard'
import { useCommunityMemberStats } from '@/hooks/useCommunity'
import { CommunityLeaderboard } from '@/components/community/CommunityLeaderboard'

interface CommunityGenreLeaderboardProps {
  highlightUserId?: string
}

export function CommunityGenreLeaderboard({ highlightUserId }: CommunityGenreLeaderboardProps) {
  const { genres, loading: genresLoading } = useCommunityGenres()
  const { stats } = useCommunityMemberStats()
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  useEffect(() => {
    if (genres.length === 0) return
    if (selectedSlug && genres.some((g) => g.slug === selectedSlug)) return
    const preferred = stats?.primaryGenreSlug ?? genres[0]?.slug ?? null
    setSelectedSlug(preferred)
  }, [genres, stats?.primaryGenreSlug, selectedSlug])

  const { entries, yourRank, loading } = useGenreLeaderboard(selectedSlug, 15)
  const selectedGenre = genres.find((g) => g.slug === selectedSlug)
  const isYourTribe = stats?.primaryGenreSlug && stats.primaryGenreSlug === selectedSlug

  return (
    <section className="community-genre-board mt-16" aria-labelledby="genre-leaderboard-heading">
      <div className="mb-6">
        <h2 id="genre-leaderboard-heading" className="font-display text-2xl font-bold">
          Tribe leaderboards
        </h2>
        <p className="text-sm text-muted mt-1">
          Weekly top dB earners per genre · Rock, Metal, Techno, and more
        </p>
      </div>

      {genresLoading ? (
        <p className="text-sm text-muted">Loading tribes…</p>
      ) : (
        <div className="community-genre-board-tabs" role="tablist" aria-label="Genre tribes">
          {genres.map((genre) => {
            const active = genre.slug === selectedSlug
            const isYours = stats?.primaryGenreSlug === genre.slug
            return (
              <button
                key={genre.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={clsx(
                  'community-genre-board-tab',
                  active && 'community-genre-board-tab-active',
                  isYours && 'community-genre-board-tab-yours'
                )}
                onClick={() => setSelectedSlug(genre.slug)}
              >
                {genre.name}
                {isYours && <span className="community-genre-board-tab-dot"> · yours</span>}
              </button>
            )
          })}
        </div>
      )}

      {selectedGenre && (
        <div className="community-genre-board-panel mt-6">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <p className="ios-kicker">{selectedGenre.name}</p>
              <p className="font-display text-lg font-bold">This week&apos;s signal leaders</p>
            </div>
            {isYourTribe && yourRank != null && (
              <p className="community-genre-board-rank-pill">
                Your tribe rank · <strong>#{yourRank}</strong>
              </p>
            )}
            {isYourTribe && yourRank == null && !loading && (
              <p className="text-xs text-muted">Earn dB this week to rank in {selectedGenre.name}.</p>
            )}
            {!stats?.primaryGenreSlug && (
              <p className="text-xs text-muted max-w-xs">
                Pick your tribe above to compete on a genre board.
              </p>
            )}
          </div>

          {loading && entries.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">Loading tribe standings…</p>
          ) : (
            <CommunityLeaderboard
              entries={entries}
              highlightUserId={highlightUserId}
              compact
            />
          )}
        </div>
      )}
    </section>
  )
}
