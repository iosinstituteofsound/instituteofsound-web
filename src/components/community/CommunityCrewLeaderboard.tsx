import clsx from 'clsx'
import { useCrewLeaderboard } from '@/hooks/useCrewLeaderboard'
import { useMyCrew } from '@/hooks/useCommunityCrew'

export function CommunityCrewLeaderboard() {
  const { entries, loading } = useCrewLeaderboard(15)
  const { crew } = useMyCrew()

  return (
    <section className="community-crew-board" aria-labelledby="crew-wars-heading">
      <div className="mb-6">
        <h2 id="crew-wars-heading" className="font-display text-2xl font-bold">
          Crew wars
        </h2>
        <p className="text-sm text-muted mt-1">
          Combined weekly dB from all members · top squads this week
        </p>
      </div>

      {loading && entries.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">Loading crew standings…</p>
      ) : entries.length === 0 ? (
        <div className="community-feed-empty ios-card">
          <p className="font-display font-bold">No crew signal yet</p>
          <p className="text-sm text-muted mt-2">
            Start or join a crew and earn dB together to appear here.
          </p>
        </div>
      ) : (
        <ol className="community-crew-board-list">
          {entries.map((entry, index) => {
            const isYours = crew?.crewId === entry.crewId
            return (
              <li
                key={entry.crewId}
                className={clsx('community-crew-board-row ios-card', isYours && 'community-crew-board-row-yours')}
              >
                <span className="community-crew-board-rank">{index + 1}</span>
                <div className="community-crew-board-meta">
                  <p className="community-crew-board-name">
                    {entry.name}
                    {isYours && <span className="community-feed-card-you-pill">Your crew</span>}
                  </p>
                  {entry.tagline && (
                    <p className="community-crew-board-tagline">{entry.tagline}</p>
                  )}
                  <p className="community-crew-board-sub">
                    {entry.memberCount} members
                    {entry.genreSlug && ` · ${formatGenre(entry.genreSlug)}`}
                  </p>
                </div>
                <div className="community-crew-board-db">
                  <span className="community-crew-board-db-value">
                    {entry.weeklyDb.toLocaleString()}
                  </span>
                  <span className="community-crew-board-db-label">dB</span>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}

function formatGenre(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
