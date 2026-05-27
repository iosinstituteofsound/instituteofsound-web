import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { useTribeWar } from '@/hooks/useTribeWar'
import { networkProfilePath } from '@/lib/community/networkPaths'

interface TribeWarSeasonProps {
  className?: string
}

export function TribeWarSeason({ className }: TribeWarSeasonProps) {
  const { standings, leader, seasonLabel, loading } = useTribeWar()

  return (
    <section className={clsx('tribe-war-season ios-card', className)} aria-labelledby="tribe-war-heading">
      <div className="tribe-war-season-head">
        <div>
          <p className="ios-kicker" id="tribe-war-heading">
            Monthly tribe war
          </p>
          <p className="font-display text-xl font-bold mt-1">{seasonLabel || 'This season'}</p>
          <p className="text-sm text-muted mt-1">
            Combined monthly dB per taste tribe — editorial spotlight on the leading scene.
          </p>
        </div>
        {leader && (
          <div className="tribe-war-leader-pill">
            <span className="tribe-war-leader-label">Leading tribe</span>
            <strong>{leader.genreName}</strong>
            <span className="tribe-war-leader-db">{leader.totalDb.toLocaleString()} dB</span>
          </div>
        )}
      </div>

      {loading && standings.length === 0 ? (
        <p className="text-sm text-muted py-6 text-center">Calculating tribe standings…</p>
      ) : standings.length === 0 ? (
        <p className="text-sm text-muted py-6 text-center">
          Earn dB this month with your tribe to enter the war.
        </p>
      ) : (
        <ol className="tribe-war-standings">
          {standings.map((row, index) => (
            <li key={row.genreSlug} className={clsx('tribe-war-row', index === 0 && 'tribe-war-row-lead')}>
              <span className="tribe-war-rank">{index + 1}</span>
              <div className="tribe-war-meta">
                <p className="tribe-war-genre">{row.genreName}</p>
                <p className="tribe-war-sub">
                  {row.activeMembers} active · {row.totalDb.toLocaleString()} dB
                </p>
                {row.championName && row.championHandle && (
                  <Link
                    to={networkProfilePath(row.championHandle)}
                    className="tribe-war-champion"
                  >
                    Champion {row.championName} · {row.championDb.toLocaleString()} dB
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      <Link to="/community#genre-board" className="tribe-war-board-link">
        Tribe weekly boards →
      </Link>
    </section>
  )
}
