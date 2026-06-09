import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { MfaWaveBars } from '@/components/dashboard/memberDeskUi'
import { cardRecentEntry } from '@/lib/dashboard/exploreDesk'
import { pushExploreRecent } from '@/lib/dashboard/exploreRecentStorage'
import { useMemberExploreDesk } from '@/hooks/useMemberExploreDesk'

const FILTERS = [
  { id: 'all', label: 'All surfaces' },
  { id: 'magazine', label: 'Magazine' },
  { id: 'live', label: 'Live wire' },
  { id: 'tools', label: 'Tools' },
] as const

type FilterId = (typeof FILTERS)[number]['id']

const EXPLORE_CARDS = [
  {
    to: '/discover',
    modifier: 'me-card--discover',
    title: 'Discover',
    lede: 'Artists, releases & magazine wire',
    cta: 'Open discover →',
    groups: ['all', 'magazine', 'live'] as FilterId[],
    tone: 1,
  },
  {
    to: '/scenes',
    modifier: 'me-card--scenes',
    title: 'Scenes',
    lede: 'City × genre hubs',
    cta: 'Browse scenes →',
    groups: ['all', 'live'] as FilterId[],
    tone: 2,
  },
  {
    to: '/events',
    modifier: 'me-card--events',
    title: 'Events',
    lede: 'Gigs & RSVP',
    cta: 'See events →',
    groups: ['all', 'live'] as FilterId[],
    tone: 3,
  },
  {
    to: '/collab',
    modifier: 'me-card--collab',
    title: 'Collab',
    lede: 'Need / offer board',
    cta: 'Open collab →',
    groups: ['all', 'live'] as FilterId[],
    tone: 4,
  },
  {
    to: '/releases',
    modifier: 'me-card--releases',
    title: 'Releases',
    lede: 'Premieres & catalog',
    cta: 'View releases →',
    groups: ['all', 'magazine'] as FilterId[],
    tone: 1,
  },
  {
    to: '/signals',
    modifier: 'me-card--signals',
    title: 'Signals',
    lede: 'Transmission feed',
    cta: 'Read signals →',
    groups: ['all', 'magazine'] as FilterId[],
    tone: 2,
  },
  {
    to: '/academy',
    modifier: 'me-card--academy',
    title: 'Academy',
    lede: 'Learn & ear lab',
    cta: 'Start learning →',
    groups: ['all', 'tools'] as FilterId[],
    tone: 3,
  },
  {
    to: '/tools',
    modifier: 'me-card--toolkit',
    title: 'Toolkit',
    lede: '16 studio tools',
    cta: 'Open toolkit →',
    groups: ['all', 'tools'] as FilterId[],
    tone: 4,
  },
] as const

export function MemberExploreHome() {
  const [filter, setFilter] = useState<FilterId>('all')
  const desk = useMemberExploreDesk()

  const cards = useMemo(
    () => EXPLORE_CARDS.filter((c) => filter === 'all' || c.groups.includes(filter)),
    [filter],
  )

  const recordOpen = (card: (typeof EXPLORE_CARDS)[number]) => {
    pushExploreRecent(
      cardRecentEntry({
        to: card.to,
        title: card.title,
        lede: card.lede,
        tone: card.tone,
      }),
      desk.user?.id,
    )
    desk.reloadRecent()
  }

  return (
    <div className="member-explore-home">
      <div className="me-hero">
        <h2 className="me-title">
          Explore <span className="me-title-accent">IOS</span>
        </h2>
        <p className="me-subtitle">
          Magazine, scenes, live wire, academy, and pro tools — all public except the network feed.
        </p>
      </div>

      <div className="me-filters" role="tablist" aria-label="Explore filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={clsx('me-filter', filter === f.id && 'me-filter--active')}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {desk.loading ? (
        <LoadingTransmission variant="compact" />
      ) : (
        <div className="me-layout">
          <div className="me-main">
            <div className="me-grid">
              {cards.map((card) => (
                <Link
                  key={card.to}
                  to={card.to}
                  className={clsx('me-card', card.modifier)}
                  onClick={() => recordOpen(card)}
                >
                  <div className="me-card-art" aria-hidden />
                  <div className="me-card-top">
                    <span className="me-card-icon" aria-hidden>
                      ◆
                    </span>
                    <div>
                      <h3 className="me-card-title">{card.title}</h3>
                      <p className="me-card-lede">{card.lede}</p>
                    </div>
                  </div>
                  <span className="me-card-cta">{card.cta}</span>
                </Link>
              ))}
            </div>

            <section className="me-recent">
              <div className="me-section-head">
                <h3>Recently opened</h3>
                <Link to="/discover" className="me-section-link">
                  Discover →
                </Link>
              </div>
              {desk.recent.length === 0 ? (
                <p className="mf-widget-note px-1">Open a surface above — your trail saves here.</p>
              ) : (
                <div className="me-recent-row">
                  {desk.recent.map((item) => (
                    <Link key={item.key} to={item.href} className="me-recent-card">
                      <div className={clsx('me-recent-art', `me-recent-art--${item.tone}`)}>
                        <span className="me-recent-play" aria-hidden>
                          ▶
                        </span>
                      </div>
                      <p className="me-recent-title">{item.title}</p>
                      <p className="me-recent-meta">{item.meta}</p>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="me-sidebar">
            <div className="me-widget">
              <h3>Trending now</h3>
              {desk.trending.length === 0 ? (
                <p className="mf-widget-note">Premiere wire and leaderboard picks show up here.</p>
              ) : (
                <ul className="me-trend-list">
                  {desk.trending.map((row, i) => (
                    <li key={row.key}>
                      <span className="me-rank">{i + 1}</span>
                      <span className={clsx('me-trend-art', row.art)} aria-hidden />
                      <div className="min-w-0">
                        <Link to={row.href} className="me-trend-title block truncate">
                          {row.title}
                        </Link>
                        <p className="me-trend-artist">{row.artist}</p>
                      </div>
                      <span className="me-trend-plays">{row.plays}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {desk.editorial && (
              <div className="me-widget me-widget--editorial">
                <h3>Editorial pick</h3>
                {desk.editorial.image ? (
                  <img
                    src={desk.editorial.image}
                    alt=""
                    className="me-editorial-art object-cover w-full"
                  />
                ) : (
                  <div className="me-editorial-art" aria-hidden />
                )}
                <p className="me-editorial-title">{desk.editorial.title}</p>
                <p className="me-editorial-lede">{desk.editorial.lede}</p>
                <Link to={desk.editorial.href} className="me-editorial-btn">
                  Read feature →
                </Link>
              </div>
            )}

            <div className="me-widget">
              <h3>Scene genres</h3>
              <ul className="me-genre-list">
                {desk.genres.map((g) => (
                  <li key={g.name}>
                    <div className="me-genre-head">
                      <span>{g.name}</span>
                      <span>{g.pct}%</span>
                    </div>
                    <span className="me-genre-bar">
                      <span className="me-genre-fill" style={{ width: `${g.pct}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {desk.nowPlaying && (
              <div className="me-player">
                <div className="me-player-art me-player-art--2" aria-hidden />
                <div className="me-player-copy">
                  <p className="me-player-title">Now playing</p>
                  <Link to={desk.nowPlaying.href} className="me-player-artist block truncate">
                    {desk.nowPlaying.title} · {desk.nowPlaying.artist}
                  </Link>
                  <div className="me-player-bar">
                    <span className="me-player-fill" style={{ width: '38%' }} />
                  </div>
                </div>
                <MfaWaveBars heights={[4, 7, 5, 9, 6, 8, 5, 10, 6, 7]} />
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
