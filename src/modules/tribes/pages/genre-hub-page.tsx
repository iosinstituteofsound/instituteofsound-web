import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, MessageCircle, Plus, Shield, Users } from 'lucide-react'
import { useGenre, useAlliances, useAllianceMembershipGate } from '@/modules/tribes/hooks/use-alliances'
import { useTribeCommunityChat } from '@/modules/explore/hooks/use-tribe-community-chat'
import '@/modules/tribes/styles/alliance.css'

export function GenreHubPage() {
  const { slug = 'electronic' } = useParams()
  const { data: genre, isLoading } = useGenre(slug)
  const { data: alliances = [] } = useAlliances({ genre: slug, sort: 'score', limit: 20 })
  const gate = useAllianceMembershipGate()
  const { busySlug, openTribeChat } = useTribeCommunityChat()

  if (isLoading || !genre) {
    return <div className="alliance-page"><p className="alliance-muted">Loading genre…</p></div>
  }

  const leaderScore = alliances[0]?.tribeScore ?? 1

  return (
    <div className="alliance-page">
      <header className="alliance-hero">
        <p className="alliance-kicker">Genre hub</p>
        <h1>{genre.label}</h1>
        <p className="alliance-muted">
          {genre.allianceCount} alliances · World chat open · War rank #{genre.warStanding?.rank ?? '—'}
        </p>
        <div className="alliance-hero__actions">
          <button
            type="button"
            className="alliance-btn alliance-btn--ghost"
            disabled={busySlug === slug}
            onClick={() => void openTribeChat(slug)}
          >
            <MessageCircle size={16} />
            World chat
          </button>
          {gate.canCreateAlliance ? (
            <Link to={`/genres/${slug}/alliances/new`} className="alliance-btn">
              <Plus size={16} />
              Create alliance
            </Link>
          ) : gate.myAlliance ? (
            <Link
              to={`/genres/${gate.myAlliance.genreSlug}/alliances/${gate.myAlliance.slug}`}
              className="alliance-btn alliance-btn--ghost"
            >
              <Shield size={16} />
              My alliance ({gate.myAlliance.name})
            </Link>
          ) : null}
        </div>
      </header>

      <section className="alliance-section">
        <div className="alliance-section__head">
          <h2>Top alliances</h2>
          <span className="alliance-muted">Identity Score leaderboard</span>
        </div>
        <ul className="alliance-board">
          {alliances.map((row, index) => {
            const pct = leaderScore > 0 ? Math.max(8, Math.round((row.tribeScore / leaderScore) * 100)) : 0
            return (
              <li key={row.id} className={index === 0 ? 'alliance-board__item alliance-board__item--lead' : 'alliance-board__item'}>
                <Link to={`/genres/${slug}/alliances/${row.slug}`} className="alliance-board__link">
                  <span className="alliance-board__rank">{index + 1}</span>
                  <span className="alliance-board__name">{row.name}</span>
                  <span className="alliance-board__score">{row.tribeScore.toLocaleString()}</span>
                  <div className="alliance-board__bar" style={{ '--pct': `${pct}%` } as React.CSSProperties}>
                    <span />
                  </div>
                  <span className="alliance-board__meta">
                    <Users size={12} /> {row.memberCount}/{row.maxMembers} · Lv {row.level}
                  </span>
                </Link>
              </li>
            )
          })}
          {alliances.length === 0 ? (
            <li className="alliance-empty">No alliances yet. Be the first founder.</li>
          ) : null}
        </ul>
      </section>

      {genre.topAlliances?.length ? (
        <section className="alliance-section">
          <h2>Season snapshot</h2>
          <p className="alliance-muted">Genre season score: {genre.seasonScore.toLocaleString()}</p>
        </section>
      ) : null}
    </div>
  )
}
