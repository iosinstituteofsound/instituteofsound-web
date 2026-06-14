import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'
import {
  activityHistoryItems,
  aggregateFandomTotals,
  FANDOM_PHOTO_VARIANTS,
  fandomStatStrip,
  interactionGenreBars,
  rsvpEvents,
  suggestedArtists,
  supportMixPercents,
  trackedReleaseCards,
} from '@/lib/dashboard/fandomDesk'
import { useMemberFandomDesk } from '@/hooks/useMemberFandomDesk'
import type { MyFandomArtistRow } from '@/lib/fandom/types'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'artists', label: 'Artists' },
  { id: 'releases', label: 'Releases' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'events', label: 'Events' },
  { id: 'genres', label: 'Genres' },
  { id: 'history', label: 'History' },
] as const

type TabId = (typeof TABS)[number]['id']

function FandomIcon({ name, size = 18 }: { name: string; size?: number }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75 }
  switch (name) {
    case 'heart':
      return (
        <svg {...c} aria-hidden>
          <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
        </svg>
      )
    case 'info':
      return (
        <svg {...c} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 10v6M12 7h.01" strokeLinecap="round" />
        </svg>
      )
    case 'users':
    case 'wave':
    case 'playlist':
    case 'ticket':
    case 'star':
      return (
        <svg {...c} aria-hidden>
          {name === 'users' && (
            <>
              <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
              <circle cx="9" cy="7" r="3" />
              <path d="M22 19v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </>
          )}
          {name === 'wave' && <path d="M4 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" strokeLinecap="round" />}
          {name === 'playlist' && (
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
          )}
          {name === 'ticket' && (
            <>
              <path d="M3 8a2 2 0 0 1 2-2h1v4H5a2 2 0 0 1-2-2zm0 8a2 2 0 0 0 2 2h1v-4H5a2 2 0 0 0-2 2zm18-8a2 2 0 0 0-2-2h-1v4h1a2 2 0 0 0 2-2zm0 8a2 2 0 0 1-2 2h-1v-4h1a2 2 0 0 1 2 2z" />
              <path d="M9 6v12" />
            </>
          )}
          {name === 'star' && (
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8l1.2 2.8L16 11l-2.2 1.8L14.5 16 12 14.2 9.5 16l.7-3.2L8 11l2.8-.2L12 8z" />
            </>
          )}
        </svg>
      )
    case 'play':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <polygon points="8,5 19,12 8,19" />
        </svg>
      )
    case 'chevron':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'plus':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

function SectionHead({ title, link, href = '/discover' }: { title: string; link?: string; href?: string }) {
  return (
    <div className="mf-section-head">
      <h3>{title}</h3>
      {link && (
        <Link to={href} className="mf-section-link">
          {link} <FandomIcon name="chevron" size={12} />
        </Link>
      )}
    </div>
  )
}

function DonutChart({ total, mix }: { total: number; mix: ReturnType<typeof supportMixPercents> }) {
  return (
    <div className="mf-donut-wrap">
      <svg className="mf-donut" viewBox="0 0 120 120" aria-hidden>
        <circle className="mf-donut-track" cx="60" cy="60" r="42" />
        <circle className="mf-donut-seg mf-donut-seg--plays" cx="60" cy="60" r="42" />
        <circle className="mf-donut-seg mf-donut-seg--likes" cx="60" cy="60" r="42" />
        <circle className="mf-donut-seg mf-donut-seg--saves" cx="60" cy="60" r="42" />
      </svg>
      <div className="mf-donut-center">
        <p className="mf-donut-value">{total.toLocaleString()}</p>
        <p className="mf-donut-label">Interactions</p>
      </div>
      <ul className="sr-only">
        <li>Spins {mix.plays}%</li>
        <li>Reactions {mix.likes}%</li>
        <li>Drops {mix.saves}%</li>
        <li>Shares {mix.shares}%</li>
      </ul>
    </div>
  )
}

function ArtistCard({ artist, index, grid }: { artist: MyFandomArtistRow; index: number; grid?: boolean }) {
  const variant = FANDOM_PHOTO_VARIANTS[index % FANDOM_PHOTO_VARIANTS.length]
  return (
    <article className={clsx('mf-artist-card', grid && 'mf-artist-card--grid')}>
      <span className="mf-artist-rank">{artist.rankAmongMyArtists}</span>
      {artist.avatarUrl ? (
        <IOSImage src={artist.avatarUrl} alt="" width={100} height={100} className="mf-artist-photo" />
      ) : (
        <span className={clsx('mf-artist-photo', `mf-artist-photo--${variant}`)} />
      )}
      <p className="mf-artist-name">
        <Link to={`/artist/${artist.slug}`}>{artist.displayName}</Link>
        <FandomIcon name="heart" size={12} />
      </p>
      {artist.percentileLabel && <span className="mf-artist-badge">{artist.percentileLabel}</span>}
      <p className="mf-artist-stats">
        {artist.spins.toLocaleString()} spins · {artist.reactions.toLocaleString()} reactions
      </p>
    </article>
  )
}

function TopArtistsRow({ artists }: { artists: MyFandomArtistRow[] }) {
  if (artists.length === 0) return null
  return (
    <section className="mf-section">
      <SectionHead title="Your Top Artists" link="View All Artists" href="/community#feed" />
      <div className="mf-artist-row">
        {artists.slice(0, 5).map((artist, i) => (
          <ArtistCard key={artist.artistProfileId} artist={artist} index={i} />
        ))}
      </div>
    </section>
  )
}

function ReleasesRow({ releases }: { releases: ReturnType<typeof trackedReleaseCards> }) {
  if (releases.length === 0) return null
  return (
    <section className="mf-section">
      <SectionHead title="Recently Tracked Releases" link="View All Releases" href="/releases" />
      <div className="mf-release-row">
        {releases.map((release) => (
          <article key={release.key} className="mf-release-card">
            <Link to={`/artist/${release.slug}`} className={`mf-release-art mf-release-art--${release.tone}`}>
              <span className="mf-release-play" aria-hidden>
                <FandomIcon name="play" size={14} />
              </span>
            </Link>
            <p className="mf-release-title">{release.title}</p>
            <p className="mf-release-meta">
              {release.artist} · {release.date}
            </p>
            <span className="mf-release-like">
              <FandomIcon name="heart" size={12} />
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}

function FandomSidebar({
  totals,
  genres,
  events,
  suggested,
}: {
  totals: ReturnType<typeof aggregateFandomTotals>
  genres: ReturnType<typeof interactionGenreBars>
  events: ReturnType<typeof rsvpEvents>
  suggested: ReturnType<typeof suggestedArtists>
}) {
  const mix = supportMixPercents(totals)
  const interactionTotal = totals.spins + totals.drops + totals.reactions + totals.shares

  return (
    <aside className="mf-sidebar">
      <section className="mf-widget">
        <h3>Fandom Summary</h3>
        <div className="mf-summary-row">
          <DonutChart total={interactionTotal || totals.support} mix={mix} />
          <ul className="mf-legend">
            <li>
              <span className="mf-legend-dot mf-legend-dot--plays" /> Spins <strong>{mix.plays}%</strong>
            </li>
            <li>
              <span className="mf-legend-dot mf-legend-dot--likes" /> Reactions <strong>{mix.likes}%</strong>
            </li>
            <li>
              <span className="mf-legend-dot mf-legend-dot--saves" /> Drops <strong>{mix.saves}%</strong>
            </li>
            <li>
              <span className="mf-legend-dot mf-legend-dot--shares" /> Shares <strong>{mix.shares}%</strong>
            </li>
          </ul>
        </div>
      </section>

      <section className="mf-widget">
        <SectionHead title="Favorite Genres" link="View All" href="/scenes" />
        <ul className="mf-genre-list">
          {genres.map((genre) => (
            <li key={genre.name}>
              <div className="mf-genre-head">
                <span>{genre.name}</span>
                <span>{genre.pct}%</span>
              </div>
              <span className="mf-genre-bar">
                <span className="mf-genre-fill" style={{ width: `${genre.pct}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mf-widget">
        <SectionHead title="Upcoming Events You're Attending" link="View All" href="/events" />
        {events.length === 0 ? (
          <p className="mf-widget-note">RSVP on the events wire to see gigs here.</p>
        ) : (
          <ul className="mf-event-list">
            {events.map((event) => (
              <li key={event.id} className="mf-event-item">
                <div className="mf-event-date">
                  <span>{event.month}</span>
                  <strong>{event.day}</strong>
                </div>
                <div className="mf-event-copy">
                  <p className="mf-event-title">{event.title}</p>
                  <p className="mf-event-meta">
                    {event.place} · {event.going} going
                  </p>
                </div>
                <Link to="/events" className="mf-going-btn">
                  Going
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mf-widget">
        <SectionHead title="Artists You Might Like" link="View All" href="/discover" />
        {suggested.length === 0 ? (
          <p className="mf-widget-note">Discover artists on the network feed.</p>
        ) : (
          <div className="mf-suggest-row">
            {suggested.map((artist) => (
              <Link key={artist.slug} to={`/artist/${artist.slug}`} className="mf-suggest-card">
                <span className={`mf-suggest-photo mf-suggest-photo--${artist.tone}`}>
                  <span className="mf-suggest-plus">
                    <FandomIcon name="plus" size={10} />
                  </span>
                </span>
                <span className="mf-suggest-name">{artist.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </aside>
  )
}

function EmptyFandom() {
  return (
    <div className="mf-section">
      <div className="ios-card p-6 border-dashed border-border text-sm text-muted">
        <p>No support relationships yet. Spin, drop, react, or tag artists on the feed.</p>
        <Link to="/community#feed" className="ios-link text-xs mt-4 inline-block">
          Open network feed →
        </Link>
      </div>
    </div>
  )
}

function TabContent({
  tab,
  artists,
  releases,
  genres,
  events,
  history,
}: {
  tab: TabId
  artists: MyFandomArtistRow[]
  releases: ReturnType<typeof trackedReleaseCards>
  genres: ReturnType<typeof interactionGenreBars>
  events: ReturnType<typeof rsvpEvents>
  history: ReturnType<typeof activityHistoryItems>
}) {
  switch (tab) {
    case 'artists':
      return (
        <section className="mf-section">
          <SectionHead title="All Followed Artists" link="View All Artists" href="/network/people" />
          <div className="mf-artist-grid">
            {artists.map((artist, i) => (
              <ArtistCard key={artist.artistProfileId} artist={artist} index={i} grid />
            ))}
          </div>
        </section>
      )
    case 'releases':
      return (
        <section className="mf-section">
          <SectionHead title="Tracked Releases" link="View All Releases" href="/releases" />
          {releases.length === 0 ? (
            <p className="mf-widget-note">Support artists on the feed to track releases here.</p>
          ) : (
            <div className="mf-release-grid">
              {releases.map((release) => (
                <article key={release.key} className="mf-release-card">
                  <Link to={`/artist/${release.slug}`} className={`mf-release-art mf-release-art--${release.tone}`}>
                    <span className="mf-release-play" aria-hidden>
                      <FandomIcon name="play" size={14} />
                    </span>
                  </Link>
                  <p className="mf-release-title">{release.title}</p>
                  <p className="mf-release-meta">{release.artist}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )
    case 'playlists':
      return (
        <section className="mf-section">
          <SectionHead title="Your Playlists" link="View All" href="/playlists" />
          <p className="mf-widget-note mb-4">Curated and featured playlists live on the public wire.</p>
          <Link to="/playlists" className="ios-btn ios-btn-primary !text-xs">
            Browse playlists →
          </Link>
        </section>
      )
    case 'events':
      return (
        <section className="mf-section">
          <SectionHead title="Events Attending" link="View All" href="/events" />
          {events.length === 0 ? (
            <p className="mf-widget-note">RSVP to events to track them here.</p>
          ) : (
            <ul className="mf-event-list mf-event-list--main">
              {events.map((event) => (
                <li key={event.id} className="mf-event-item">
                  <div className="mf-event-date">
                    <span>{event.month}</span>
                    <strong>{event.day}</strong>
                  </div>
                  <div className="mf-event-copy">
                    <p className="mf-event-title">{event.title}</p>
                    <p className="mf-event-meta">
                      {event.place} · {event.going} going
                    </p>
                  </div>
                  <Link to="/events" className="mf-going-btn">
                    Going
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )
    case 'genres':
      return (
        <section className="mf-section">
          <SectionHead title="Genre Breakdown" link="View All" href="/scenes" />
          <ul className="mf-genre-list mf-genre-list--main">
            {genres.map((genre) => (
              <li key={genre.name}>
                <div className="mf-genre-head">
                  <span>{genre.name}</span>
                  <span>{genre.pct}%</span>
                </div>
                <span className="mf-genre-bar">
                  <span className="mf-genre-fill" style={{ width: `${genre.pct}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )
    case 'history':
      return (
        <section className="mf-section">
          <SectionHead title="Fandom History" />
          {history.length === 0 ? (
            <p className="mf-widget-note">Your network activity will appear here.</p>
          ) : (
            <ul className="mf-history-list">
              {history.map((item) => (
                <li key={item.key}>
                  <span className="mf-history-action">{item.action}</span>
                  <span className="mf-history-target">{item.target}</span>
                  <time className="mf-history-time">{item.time}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      )
    default:
      return (
        <>
          <TopArtistsRow artists={artists} />
          <ReleasesRow releases={releases} />
        </>
      )
  }
}

export function MemberFandomHome() {
  const [tab, setTab] = useState<TabId>('overview')
  const desk = useMemberFandomDesk()

  const totals = useMemo(() => aggregateFandomTotals(desk.artists), [desk.artists])
  const releases = useMemo(() => trackedReleaseCards(desk.artists), [desk.artists])
  const genres = useMemo(() => interactionGenreBars(totals), [totals])
  const attending = useMemo(() => rsvpEvents(desk.events), [desk.events])
  const suggested = useMemo(() => suggestedArtists(desk.discover), [desk.discover])
  const history = useMemo(() => activityHistoryItems(desk.activity), [desk.activity])
  const stats = useMemo(
    () =>
      fandomStatStrip(
        desk.artists,
        totals,
        desk.profile?.followingCount ?? null,
        attending.length,
      ),
    [desk.artists, desk.profile?.followingCount, totals, attending.length],
  )

  const hasArtists = desk.artists.length > 0

  return (
    <div className="member-fandom-home">
      <header className="mf-header">
        <div className="mf-header-copy">
          <h2 className="mf-title">
            My Fandom
            <FandomIcon name="heart" size={22} />
          </h2>
          <p className="mf-subtitle">
            The artists. The sounds. The culture. Your fandom tells your story.
          </p>
        </div>
        <div className="mf-header-actions">
          <div className="mf-window-toggle" role="group" aria-label="Fandom window">
            {(['90d', 'all'] as const).map((w) => (
              <button
                key={w}
                type="button"
                className={clsx('mf-window-btn', desk.window === w && 'mf-window-btn--active')}
                aria-pressed={desk.window === w}
                onClick={() => desk.setWindow(w)}
              >
                {w === '90d' ? '90 days' : 'All-time'}
              </button>
            ))}
          </div>
          <Link to="/community#feed" className="mf-how-btn">
            <FandomIcon name="info" size={15} />
            Support on feed
          </Link>
        </div>
      </header>

      {desk.loading ? (
        <LoadingTransmission variant="compact" />
      ) : desk.error ? (
        <p className="text-sm text-mh-red px-1">{desk.error}</p>
      ) : (
        <>
          {hasArtists && (
            <div className="mf-stats">
              {stats.map((stat) => (
                <article key={stat.label} className="mf-stat">
                  <span className="mf-stat-icon">
                    <FandomIcon name={stat.icon} />
                  </span>
                  <p className="mf-stat-value">{stat.value}</p>
                  <p className="mf-stat-label">{stat.label}</p>
                </article>
              ))}
            </div>
          )}

          <div className="mf-tabs" role="tablist" aria-label="Fandom sections">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id ? 'true' : 'false'}
                className={`mf-tab${tab === item.id ? ' mf-tab--active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className={`mf-layout${tab === 'overview' && hasArtists ? '' : ' mf-layout--single'}`}>
            <div className="mf-main">
              {!hasArtists ? (
                <EmptyFandom />
              ) : (
                <TabContent
                  tab={tab}
                  artists={desk.artists}
                  releases={releases}
                  genres={genres}
                  events={attending}
                  history={history}
                />
              )}
            </div>
            {tab === 'overview' && hasArtists && (
              <FandomSidebar totals={totals} genres={genres} events={attending} suggested={suggested} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
