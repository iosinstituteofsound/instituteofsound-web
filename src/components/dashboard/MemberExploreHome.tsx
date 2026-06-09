import { useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { MfaWaveBars } from '@/components/dashboard/memberDeskUi'

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
  },
  {
    to: '/scenes',
    modifier: 'me-card--scenes',
    title: 'Scenes',
    lede: 'City × genre hubs',
    cta: 'Browse scenes →',
    groups: ['all', 'live'] as FilterId[],
  },
  {
    to: '/events',
    modifier: 'me-card--events',
    title: 'Events',
    lede: 'Gigs & RSVP',
    cta: 'See events →',
    groups: ['all', 'live'] as FilterId[],
  },
  {
    to: '/collab',
    modifier: 'me-card--collab',
    title: 'Collab',
    lede: 'Need / offer board',
    cta: 'Open collab →',
    groups: ['all', 'live'] as FilterId[],
  },
  {
    to: '/releases',
    modifier: 'me-card--releases',
    title: 'Releases',
    lede: 'Premieres & catalog',
    cta: 'View releases →',
    groups: ['all', 'magazine'] as FilterId[],
  },
  {
    to: '/signals',
    modifier: 'me-card--signals',
    title: 'Signals',
    lede: 'Transmission feed',
    cta: 'Read signals →',
    groups: ['all', 'magazine'] as FilterId[],
  },
  {
    to: '/academy',
    modifier: 'me-card--academy',
    title: 'Academy',
    lede: 'Learn & ear lab',
    cta: 'Start learning →',
    groups: ['all', 'tools'] as FilterId[],
  },
  {
    to: '/tools',
    modifier: 'me-card--toolkit',
    title: 'Toolkit',
    lede: '16 studio tools',
    cta: 'Open toolkit →',
    groups: ['all', 'tools'] as FilterId[],
  },
] as const

const RECENT = [
  { title: 'Vault sequence', meta: 'Transmission · demo', art: 'me-recent-art--1' },
  { title: 'Berlin modular', meta: 'Scene hub', art: 'me-recent-art--2' },
  { title: 'Night drive', meta: 'Release wire', art: 'me-recent-art--3' },
  { title: 'Ear lab 04', meta: 'Academy', art: 'me-recent-art--4' },
] as const

const TRENDING = [
  { title: 'Midnight wire', artist: 'Echo Guild', plays: '12.4k', art: 'me-trend-art--1' },
  { title: 'Redline', artist: 'Mira Volkov', plays: '9.8k', art: 'me-trend-art--2' },
  { title: 'Static bloom', artist: 'Luna Wire', plays: '7.2k', art: 'me-trend-art--3' },
  { title: 'Phase shift', artist: 'Null Sector', plays: '5.1k', art: 'me-trend-art--4' },
] as const

const GENRES = [
  { name: 'Electronic', pct: 42 },
  { name: 'Hip-hop', pct: 28 },
  { name: 'Indie', pct: 18 },
  { name: 'Experimental', pct: 12 },
] as const

export function MemberExploreHome() {
  const [filter, setFilter] = useState<FilterId>('all')
  const cards = EXPLORE_CARDS.filter((c) => filter === 'all' || c.groups.includes(filter))

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

      <div className="me-layout">
        <div className="me-main">
          <div className="me-grid">
            {cards.map((card) => (
              <Link key={card.to} to={card.to} className={clsx('me-card', card.modifier)}>
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
            <div className="me-recent-row">
              {RECENT.map((item) => (
                <article key={item.title} className="me-recent-card">
                  <div className={clsx('me-recent-art', item.art)}>
                    <button type="button" className="me-recent-play" aria-label={`Play ${item.title}`}>
                      ▶
                    </button>
                  </div>
                  <p className="me-recent-title">{item.title}</p>
                  <p className="me-recent-meta">{item.meta}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="me-sidebar">
          <div className="me-widget">
            <h3>Trending now</h3>
            <ul className="me-trend-list">
              {TRENDING.map((row, i) => (
                <li key={row.title}>
                  <span className="me-rank">{i + 1}</span>
                  <span className={clsx('me-trend-art', row.art)} aria-hidden />
                  <div className="min-w-0">
                    <p className="me-trend-title">{row.title}</p>
                    <p className="me-trend-artist">{row.artist}</p>
                  </div>
                  <span className="me-trend-plays">{row.plays}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="me-widget me-widget--editorial">
            <h3>Editorial pick</h3>
            <div className="me-editorial-art" aria-hidden />
            <p className="me-editorial-title">The transmission issue — scene report</p>
            <p className="me-editorial-lede">
              Long-form features, artist profiles, and release reviews from the magazine desk.
            </p>
            <Link to="/discover" className="me-editorial-btn">
              Read feature →
            </Link>
          </div>

          <div className="me-widget">
            <h3>Scene genres</h3>
            <ul className="me-genre-list">
              {GENRES.map((g) => (
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

          <div className="me-player">
            <div className="me-player-art me-player-art--2" aria-hidden />
            <div className="me-player-copy">
              <p className="me-player-title">Now playing</p>
              <p className="me-player-artist">Vault sequence · demo</p>
              <div className="me-player-bar">
                <span className="me-player-fill" style={{ width: '38%' }} />
              </div>
            </div>
            <MfaWaveBars heights={[4, 7, 5, 9, 6, 8, 5, 10, 6, 7]} />
          </div>
        </aside>
      </div>
    </div>
  )
}
