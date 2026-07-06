import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  AudioLines,
  Check,
  Disc3,
  Play,
  TrendingUp,
  Users,
} from 'lucide-react'
import type { ExplorePayload } from '@/modules/explore/types/explore.types'
import {
  formatExploreDb,
  listExploreSpins,
  spinReactionLabel,
  tribeBarPercent,
  type ExploreCrewRow,
  type ExploreSpinRow,
} from '@/modules/explore/lib/community-meta'
import {
  ExploreSectionHead,
  ExploreSectionHeadAction,
} from '@/modules/explore/components/explore-section-head'
import { useTribeCommunityChat } from '@/modules/explore/hooks/use-tribe-community-chat'
import { useAllianceLeaderboard, useGenres } from '@/modules/tribes/hooks/use-alliances'

interface ExploreCommunitySectionProps {
  community: ExplorePayload['community']
}

function PanelCta({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="explore-com-panel__cta">
      <span>{label}</span>
      <ArrowUpRight size={13} strokeWidth={2.25} aria-hidden />
    </Link>
  )
}

function CommunityWaveform({
  seed,
  waveClassName,
  barCount = 24,
}: {
  seed: string
  waveClassName: string
  barCount?: number
}) {
  const bars = Array.from({ length: barCount }, (_, i) => {
    const n = seed.charCodeAt(i % seed.length)! + i * 19
    return 0.28 + (n % 72) / 100
  })

  return (
    <div className={`${waveClassName} explore-art-wave`} aria-hidden>
      {bars.map((scale, i) => (
        <span
          key={i}
          className="explore-art-wave__bar"
          style={
            {
              '--bar-scale': scale,
              '--bar-delay': `${(i % 11) * 0.05}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}

function AllianceRow({
  alliance,
  rank,
  leaderScore,
}: {
  alliance: { slug: string; name: string; genreSlug: string; tribeScore: number; memberCount: number; level: number }
  rank: number
  leaderScore: number
}) {
  const lead = rank === 1
  const pct = tribeBarPercent(alliance.tribeScore, leaderScore)
  return (
    <li className={lead ? 'explore-com-tribes__item explore-com-tribes__item--lead' : 'explore-com-tribes__item'}>
      <Link
        to={`/genres/${alliance.genreSlug}/alliances/${alliance.slug}`}
        className={lead ? 'explore-com-tribe explore-com-tribe--lead' : 'explore-com-tribe'}
      >
        <div className="explore-com-tribe__row">
          <span className="explore-com-tribe__rank">{rank}</span>
          <span className="explore-com-tribe__icon" aria-hidden>
            <Disc3 size={12} strokeWidth={2} />
          </span>
          <span className="explore-com-tribe__name">{alliance.name}</span>
          <span className="explore-com-tribe__db">{alliance.tribeScore.toLocaleString()} pts</span>
        </div>
        <div
          className="explore-com-tribe__bar"
          aria-hidden
          style={{ '--tribe-pct': `${pct}%` } as React.CSSProperties}
        >
          <span />
        </div>
        <p className="explore-com-tribe__meta">{alliance.memberCount} members · Lv {alliance.level}</p>
      </Link>
    </li>
  )
}

function GenreHubRow({
  genre,
  onChat,
  chatBusy,
}: {
  genre: { slug: string; label: string; allianceCount: number }
  onChat: (slug: string) => void
  chatBusy: boolean
}) {
  return (
    <li className="explore-com-tribes__item">
      <Link to={`/genres/${genre.slug}`} className="explore-com-tribe">
        <div className="explore-com-tribe__row">
          <span className="explore-com-tribe__icon" aria-hidden>
            <Disc3 size={12} strokeWidth={2} />
          </span>
          <span className="explore-com-tribe__name">{genre.label}</span>
          <span className="explore-com-tribe__db">{genre.allianceCount} alliances</span>
        </div>
      </Link>
      <button
        type="button"
        className="explore-com-tribe__chat"
        disabled={chatBusy}
        onClick={() => onChat(genre.slug)}
      >
        World chat
      </button>
    </li>
  )
}

function VinylDisc() {
  return (
    <svg viewBox="0 0 80 80" className="explore-com-vinyl" aria-hidden>
      <circle cx="40" cy="40" r="38" className="explore-com-vinyl__outer" />
      <circle cx="40" cy="40" r="32" className="explore-com-vinyl__groove" />
      <circle cx="40" cy="40" r="24" className="explore-com-vinyl__groove" />
      <circle cx="40" cy="40" r="10" className="explore-com-vinyl__label" />
      <circle cx="40" cy="40" r="3" className="explore-com-vinyl__hole" />
    </svg>
  )
}

function SpinWaveform({ seed }: { seed: string }) {
  return <CommunityWaveform seed={seed} waveClassName="explore-com-spin__wave" barCount={28} />
}

function SpinRow({ spin, rank, lead }: { spin: ExploreSpinRow; rank: number; lead?: boolean }) {
  return (
    <li className={lead ? 'explore-com-spins__item explore-com-spins__item--lead' : 'explore-com-spins__item'}>
      <Link to={spin.href} className="explore-com-spin" aria-label={`#${rank} ${spin.title}`}>
        <div className="explore-com-spin__vinyl" aria-hidden>
          <VinylDisc />
        </div>
        <div className="explore-com-spin__body">
          <div className="explore-com-spin__top">
            <span className="explore-com-spin__rank">#{rank}</span>
            <p className="explore-com-spin__title">{spin.title}</p>
          </div>
          <p className="explore-com-spin__handle">{spin.handle}</p>
          <span className="explore-com-spin__role">
            <Check size={8} strokeWidth={2.5} aria-hidden />
            Listener
          </span>
        </div>
        <div className="explore-com-spin__aside">
          <span className="explore-com-spin__rxn">
            <Play size={9} strokeWidth={2} fill="currentColor" aria-hidden />
            {spinReactionLabel(spin.reactions)}
          </span>
        </div>
        <SpinWaveform seed={spin.id} />
      </Link>
    </li>
  )
}

function CrewRow({ crew, rank }: { crew: ExploreCrewRow; rank: number }) {
  const lead = rank === 1

  return (
    <li className={lead ? 'explore-com-crews__item explore-com-crews__item--lead' : 'explore-com-crews__item'}>
      <Link
        to="/feed"
        className={lead ? 'explore-com-crew explore-com-crew--lead' : 'explore-com-crew'}
        aria-label={`#${rank} ${crew.name}`}
      >
        <span className="explore-com-crew__rank">{rank}</span>
        <AudioLines size={13} strokeWidth={2} className="explore-com-crew__ico" aria-hidden />
        <span className="explore-com-crew__name">{crew.name}</span>
        <span className="explore-com-crew__db">{formatExploreDb(crew.weeklyDb)}</span>
      </Link>
    </li>
  )
}

function CrewScene({ crew }: { crew: ExploreCrewRow }) {
  return (
    <div className="explore-com-crew-scene">
      <div className="explore-com-crew-scene__atmosphere" aria-hidden>
        <div className="explore-com-crew-scene__grid" />
        <div className="explore-com-crew-scene__portal" />
        <div className="explore-com-crew-scene__rings">
          <span className="explore-com-crew-scene__ring explore-com-crew-scene__ring--outer" />
          <span className="explore-com-crew-scene__ring explore-com-crew-scene__ring--mid" />
          <span className="explore-com-crew-scene__ring explore-com-crew-scene__ring--core" />
        </div>
        <div className="explore-com-crew-scene__figures" aria-hidden>
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={
                i === 2
                  ? 'explore-com-crew-scene__figure explore-com-crew-scene__figure--lead'
                  : 'explore-com-crew-scene__figure'
              }
            />
          ))}
        </div>
        <div className="explore-com-crew-scene__scan" aria-hidden />
      </div>

      <div className="explore-com-crew-scene__body">
        <span className="explore-com-crew-scene__kicker">#1 crew</span>
        <p className="explore-com-crew-scene__name">{crew.name}</p>
        <p className="explore-com-crew-scene__tag">{crew.tagline}</p>
        <div className="explore-com-crew-scene__stats">
          <span className="explore-com-crew-scene__stat">
            <Users size={11} strokeWidth={2} aria-hidden />
            {crew.memberCount} members
          </span>
          <span className="explore-com-crew-scene__stat">
            <AudioLines size={11} strokeWidth={2} aria-hidden />
            {formatExploreDb(crew.weeklyDb)}
          </span>
        </div>
      </div>
    </div>
  )
}

export function ExploreCommunitySection({ community }: ExploreCommunitySectionProps) {
  const { busySlug, openTribeChat } = useTribeCommunityChat()
  const { data: genres = [] } = useGenres()
  const { data: leaderboard } = useAllianceLeaderboard({ period: 'score', limit: 6 })
  const alliances = leaderboard?.alliances ?? []
  const spins = listExploreSpins(community).slice(0, 5)
  const leaderScore = alliances[0]?.tribeScore ?? 1
  const genreRows = genres.filter((g) => g.worldChatEnabled).slice(0, 6)

  if (genreRows.length === 0 && spins.length === 0 && alliances.length === 0) return null

  return (
    <section id="explore-community" className="explore-section explore-com-section">
      <ExploreSectionHead
        index={9}
        kicker="Wire"
        title="Community"
        description="Genre hubs, alliances, and spins — ranked by activity."
        action={<ExploreSectionHeadAction label="Full wire" to="/feed" />}
      />

      <div className="explore-com-grid">
        <article className="explore-com-panel explore-com-panel--tribes">
          <div className="explore-com-panel__glow" aria-hidden />
          <header className="explore-com-panel__head">
            <TrendingUp size={16} strokeWidth={2} className="explore-com-panel__ico" aria-hidden />
            <div>
              <h3 className="explore-com-panel__title">Genre hubs</h3>
              <p className="explore-com-panel__sub">World chat by genre</p>
            </div>
          </header>

          <ol className="explore-com-tribes">
            {genreRows.map((genre) => (
              <GenreHubRow
                key={genre.slug}
                genre={genre}
                onChat={(slug) => void openTribeChat(slug)}
                chatBusy={busySlug === genre.slug}
              />
            ))}
          </ol>

          <PanelCta to="/genres/electronic" label="Browse genres" />
        </article>

        <article className="explore-com-panel explore-com-panel--spins">
          <div className="explore-com-panel__glow" aria-hidden />
          <header className="explore-com-panel__head">
            <AudioLines size={16} strokeWidth={2} className="explore-com-panel__ico" aria-hidden />
            <div>
              <h3 className="explore-com-panel__title">Top spins</h3>
              <p className="explore-com-panel__sub">By engagement</p>
            </div>
          </header>

          <ol className="explore-com-spins">
            {spins.map((spin, i) => (
              <SpinRow key={spin.id} spin={spin} rank={i + 1} lead={i === 0} />
            ))}
          </ol>

          <PanelCta to="/feed" label="View all spins" />
        </article>

        <article className="explore-com-panel explore-com-panel--crews">
          <div className="explore-com-panel__glow" aria-hidden />
          <header className="explore-com-panel__head">
            <Users size={16} strokeWidth={2} className="explore-com-panel__ico" aria-hidden />
            <div>
              <h3 className="explore-com-panel__title">Top alliances</h3>
              <p className="explore-com-panel__sub">Identity score board</p>
            </div>
          </header>

          <ol className="explore-com-tribes">
            {alliances.map((alliance, i) => (
              <AllianceRow
                key={alliance.id}
                alliance={alliance}
                rank={i + 1}
                leaderScore={leaderScore}
              />
            ))}
          </ol>

          <PanelCta to="/genres/electronic" label="View alliances" />
        </article>
      </div>
    </section>
  )
}
