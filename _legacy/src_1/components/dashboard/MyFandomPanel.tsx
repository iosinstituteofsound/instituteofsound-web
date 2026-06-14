import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { fetchMyFandom, fetchSupporterMilestones } from '@/lib/fandom/service'
import type { FandomMilestoneRow, FandomWindow, MyFandomArtistRow } from '@/lib/fandom/types'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'

const PHOTO_VARIANTS = ['a', 'b', 'c', 'd', 'e'] as const

function aggregateStats(artists: MyFandomArtistRow[]) {
  return artists.reduce(
    (acc, row) => ({
      spins: acc.spins + row.spins,
      drops: acc.drops + row.drops,
      reactions: acc.reactions + row.reactions,
      comments: acc.comments + row.comments,
      support: acc.support + row.supportScore,
    }),
    { spins: 0, drops: 0, reactions: 0, comments: 0, support: 0 },
  )
}

export function MyFandomPanel() {
  const [fandomWindow, setFandomWindow] = useState<FandomWindow>('90d')
  const [artists, setArtists] = useState<MyFandomArtistRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [milestones, setMilestones] = useState<FandomMilestoneRow[]>([])
  const [milestonesLoading, setMilestonesLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await fetchMyFandom(fandomWindow)
      setArtists(rows ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fandom')
      setArtists([])
    } finally {
      setLoading(false)
    }
  }, [fandomWindow])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!expandedId) {
      setMilestones([])
      return
    }
    let cancelled = false
    setMilestonesLoading(true)
    void (async () => {
      try {
        const rows = await fetchSupporterMilestones(expandedId)
        if (!cancelled) setMilestones(rows)
      } catch {
        if (!cancelled) setMilestones([])
      } finally {
        if (!cancelled) setMilestonesLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [expandedId])

  const totals = useMemo(() => aggregateStats(artists), [artists])
  const hasArtists = artists.length > 0

  return (
    <div className="member-fandom-home">
      <header className="mf-header">
        <div>
          <h2 className="mf-title">My Fandom</h2>
          <p className="mf-subtitle">
            Your relationship with artists on the network — ranked by meaningful support, not points
            farming.
          </p>
        </div>
        <Link to="/community#feed" className="mf-how-btn">
          Support on feed →
        </Link>
      </header>

      {hasArtists && (
        <div className="mf-stats">
          {[
            { label: 'Artists supported', value: String(artists.length) },
            { label: 'Spins', value: totals.spins.toLocaleString() },
            { label: 'Drops', value: totals.drops.toLocaleString() },
            { label: 'Reactions', value: totals.reactions.toLocaleString() },
            { label: 'Support score', value: totals.support.toLocaleString() },
          ].map((s) => (
            <article key={s.label} className="mf-stat">
              <span className="mf-stat-icon" aria-hidden>
                ◆
              </span>
              <p className="mf-stat-value">{s.value}</p>
              <p className="mf-stat-label">{s.label}</p>
            </article>
          ))}
        </div>
      )}

      <div className="mf-tabs" role="tablist" aria-label="Fandom window">
        {(['90d', 'all'] as const).map((w) => (
          <button
            key={w}
            type="button"
            role="tab"
            aria-selected={fandomWindow === w}
            className={clsx('mf-tab', fandomWindow === w && 'mf-tab--active')}
            onClick={() => setFandomWindow(w)}
          >
            {w === '90d' ? 'Last 90 days' : 'All-time'}
          </button>
        ))}
      </div>

      <div className={clsx('mf-layout', !hasArtists && 'mf-layout--single')}>
        <div className="mf-main">
          {loading ? (
            <LoadingTransmission variant="compact" />
          ) : error ? (
            <p className="text-sm text-mh-red">{error}</p>
          ) : !hasArtists ? (
            <div className="mf-section">
              <div className="ios-card p-6 border-dashed border-border text-sm text-muted">
                <p>No support relationships yet. Spin, drop, react, or tag artists on the feed.</p>
                <Link to="/community#feed" className="ios-link text-xs mt-4 inline-block">
                  Open network feed →
                </Link>
              </div>
            </div>
          ) : (
            <>
              <section className="mf-section">
                <div className="mf-section-head">
                  <h3>Your artists</h3>
                  <Link to="/community#feed" className="mf-section-link">
                    Add support →
                  </Link>
                </div>
                <div className="mf-artist-grid">
                  {artists.map((row, i) => {
                    const variant = PHOTO_VARIANTS[i % PHOTO_VARIANTS.length]
                    const open = expandedId === row.artistProfileId
                    return (
                      <article key={row.artistProfileId} className="mf-artist-card mf-artist-card--grid">
                        <span className="mf-artist-rank">{row.rankAmongMyArtists}</span>
                        <button
                          type="button"
                          className="w-full text-center"
                          onClick={() => setExpandedId(open ? null : row.artistProfileId)}
                        >
                          {row.avatarUrl ? (
                            <IOSImage
                              src={row.avatarUrl}
                              alt=""
                              width={100}
                              height={100}
                              className="mf-artist-photo"
                            />
                          ) : (
                            <span
                              className={clsx('mf-artist-photo', `mf-artist-photo--${variant}`)}
                              aria-hidden
                            />
                          )}
                          <p className="mf-artist-name">
                            {row.displayName}
                            {row.percentileLabel && (
                              <span className="mf-artist-badge">{row.percentileLabel}</span>
                            )}
                          </p>
                          <p className="mf-artist-stats">
                            {row.spins} spins · {row.drops} drops · {row.reactions} reactions
                          </p>
                        </button>
                        <Link
                          to={`/artist/${row.slug}`}
                          className="ios-link text-[10px] uppercase tracking-wider"
                        >
                          Artist page →
                        </Link>
                        {open && (
                          <div className="mt-3 text-left text-xs border-t border-border pt-3">
                            <dl className="grid grid-cols-2 gap-2">
                              {[
                                ['Comments', row.comments],
                                ['Shares', row.shares],
                                ['Reviews', row.reviews],
                                ['Editorial', row.editorials],
                              ].map(([label, n]) => (
                                <div key={String(label)}>
                                  <dt className="text-[10px] uppercase text-muted">{label}</dt>
                                  <dd className="font-display font-bold">{n}</dd>
                                </div>
                              ))}
                            </dl>
                            {(milestonesLoading || milestones.length > 0) && (
                              <div className="mt-3">
                                <p className="text-[10px] uppercase text-mh-red font-bold mb-1">Milestones</p>
                                {milestonesLoading ? (
                                  <p className="text-muted">Loading…</p>
                                ) : (
                                  <ul className="flex flex-wrap gap-1 list-none p-0 m-0">
                                    {milestones.map((m) => (
                                      <li
                                        key={m.milestoneSlug}
                                        className="text-[10px] px-2 py-0.5 rounded-sm border border-mh-red/30 text-mh-red"
                                      >
                                        {m.label}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              </section>

              <section className="mf-section">
                <div className="mf-section-head">
                  <h3>Supported releases</h3>
                  <Link to="/releases" className="mf-section-link">
                    All releases →
                  </Link>
                </div>
                <div className="mf-release-grid">
                  {[1, 2, 3, 4].map((n) => (
                    <article key={n} className="mf-release-card">
                      <div className={clsx('mf-release-art', `mf-release-art--${n}`)}>
                        <button type="button" className="mf-release-play" aria-label="Play release preview">
                          ▶
                        </button>
                      </div>
                      <p className="mf-release-title">Release wire {n}</p>
                      <p className="mf-release-meta">From your supported artists</p>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

        {hasArtists && (
          <aside className="mf-sidebar">
            <div className="mf-widget">
              <h3>Support mix</h3>
              <div className="mf-summary-row">
                <div className="mf-donut-wrap">
                  <svg className="mf-donut" viewBox="0 0 100 100" aria-hidden>
                    <circle className="mf-donut-track" cx="50" cy="50" r="42" />
                    <circle className="mf-donut-seg mf-donut-seg--plays" cx="50" cy="50" r="42" />
                    <circle className="mf-donut-seg mf-donut-seg--likes" cx="50" cy="50" r="42" />
                    <circle className="mf-donut-seg mf-donut-seg--saves" cx="50" cy="50" r="42" />
                  </svg>
                  <div className="mf-donut-center">
                    <p className="mf-donut-value">{totals.support.toLocaleString()}</p>
                    <p className="mf-donut-label">Score</p>
                  </div>
                </div>
                <ul className="mf-legend">
                  <li>
                    <span className="mf-legend-dot mf-legend-dot--plays" />
                    Spins {totals.spins}
                  </li>
                  <li>
                    <span className="mf-legend-dot mf-legend-dot--likes" />
                    Drops {totals.drops}
                  </li>
                  <li>
                    <span className="mf-legend-dot mf-legend-dot--saves" />
                    Reactions {totals.reactions}
                  </li>
                </ul>
              </div>
            </div>

            <div className="mf-widget">
              <h3>Activity</h3>
              <p className="text-xs text-muted m-0">
                {totals.comments} comments · {totals.reactions} reactions across your fandom window.
              </p>
              <Link to="/community#feed" className="ios-link text-xs mt-3 inline-block">
                Post on feed →
              </Link>
            </div>

            <div className="mf-widget">
              <h3>Scene events</h3>
              <p className="text-xs text-muted m-0 mb-3">
                Gigs from artists you support appear on the events wire.
              </p>
              <Link to="/events" className="ios-btn ios-btn-ghost !text-xs w-full justify-center">
                Open events →
              </Link>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
