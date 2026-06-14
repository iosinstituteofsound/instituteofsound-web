import { useEffect, useMemo, useState } from 'react'
import { GatedLink } from '@/components/auth/GatedLink'
import { useDiscoverPulse } from '@/hooks/useDiscoverPulse'
import type { CommunityFeedPost } from '@/lib/community/feedTypes'
import {
  DISCOVER_CREW_HERO_IMAGE,
  mergeDiscoverCrews,
  mergeDiscoverSpins,
  mergeDiscoverTribes,
  spinReactionTotal,
  tribeBarPercent,
} from '@/lib/discovery/communityPulse'
import '@/styles/community-wire.css'

function spinTitle(post: CommunityFeedPost): string {
  return post.trackTitle?.trim() || post.body?.slice(0, 48) || 'Spin'
}

function spinHandle(post: CommunityFeedPost): string {
  const h = post.handle.replace(/^@/, '')
  return h ? `@${h}` : '@wire'
}

export function DiscoverCommunitySection() {
  const { tribes: apiTribes, spins: apiSpins, crews: apiCrews, loading } = useDiscoverPulse()
  const tribes = useMemo(() => mergeDiscoverTribes(apiTribes), [apiTribes])
  const spins = useMemo(() => mergeDiscoverSpins(apiSpins), [apiSpins])
  const crews = useMemo(() => mergeDiscoverCrews(apiCrews), [apiCrews])
  const [spinIdx, setSpinIdx] = useState(0)

  const leaderDb = tribes[0]?.totalDb ?? 1
  const activeSpin = spins[spinIdx] ?? spins[0]
  const topCrew = crews[0]

  useEffect(() => {
    if (spinIdx >= spins.length) setSpinIdx(0)
  }, [spins.length, spinIdx])

  return (
    <section id="discover-community" className="com-sec scroll-mt-24">
      <header className="com-sec__head">
        <div className="com-sec__brand">
          <span className="com-sec__idx" aria-hidden>
            09
          </span>
          <div>
            <p className="com-sec__tag">Wire</p>
            <h2 className="com-sec__title">Community</h2>
            <p className="com-sec__sub">Tribes, spins, and crews — ranked by activity.</p>
          </div>
        </div>
        <GatedLink to="/community" forceGate className="com__wire-btn">
          <span className="com__wire-btn-text">Full wire</span>
          <span className="com__wire-btn-arrow" aria-hidden>
            →
          </span>
        </GatedLink>
      </header>

      {loading && tribes.length === 0 && spins.length === 0 && (
        <p className="disco-loading">Syncing wire…</p>
      )}

      <div className="com__grid">
        {/* Tribes */}
        <article className="com-panel">
          <header className="com-panel__head">
            <IcoTrend />
            <div>
              <h3 className="com-panel__title">Trending tribes</h3>
              <p className="com-panel__sub">Monthly standings</p>
            </div>
          </header>

          <ol className="com-tribes">
            {tribes.map((t, i) => {
              const lead = i === 0
              const pct = tribeBarPercent(t.totalDb, leaderDb)
              return (
                <li key={t.genreSlug} className={lead ? 'com-tribe com-tribe--lead' : 'com-tribe'}>
                  <div className="com-tribe__row">
                    <span className="com-tribe__rank">{i + 1}</span>
                    <IcoGenre muted={!lead} />
                    <span className="com-tribe__name">{t.genreName}</span>
                    <span className="com-tribe__db">{t.totalDb.toLocaleString()} dB</span>
                  </div>
                  {lead && (
                    <div className="com-tribe__bar" aria-hidden>
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </li>
              )
            })}
          </ol>

          <GatedLink to="/community#genre-board" forceGate className="com-panel__cta">
            <span>View all tribes</span>
            <span className="com-panel__cta-arrow" aria-hidden>
              →
            </span>
          </GatedLink>
        </article>

        {/* Spins */}
        <article className="com-panel com-panel--spins">
          <header className="com-panel__head">
            <IcoSpin />
            <div>
              <h3 className="com-panel__title">Top spins</h3>
              <p className="com-panel__sub">By engagement</p>
            </div>
          </header>

          {activeSpin && (
            <GatedLink
              to={activeSpin.id.startsWith('discover-') ? '/community#feed' : `/feed/${activeSpin.id}`}
              forceGate
              className="com-spin-feature"
            >
              <div className="com-spin-feature__vinyl" aria-hidden>
                <VinylDisc />
              </div>
              <div className="com-spin-feature__body">
                <div className="com-spin-feature__top">
                  <span className="com-spin-feature__rank">#{spinIdx + 1}</span>
                  <span className="com-spin-feature__rxn">
                    <IcoPlay />
                    {spinReactionTotal(activeSpin)} rxn
                  </span>
                </div>
                <p className="com-spin-feature__title">{spinTitle(activeSpin)}</p>
                <p className="com-spin-feature__handle">{spinHandle(activeSpin)}</p>
              </div>
              <div className="com-spin-feature__wave" aria-hidden>
                <SpinWaveform />
              </div>
            </GatedLink>
          )}

          {spins.length > 1 && (
            <div className="com-spin-dots" role="tablist" aria-label="Top spins">
              {spins.slice(0, 5).map((post, i) => (
                <button
                  key={post.id}
                  type="button"
                  role="tab"
                  aria-selected={i === spinIdx}
                  aria-label={`Spin ${i + 1}: ${spinTitle(post)}`}
                  className={i === spinIdx ? 'com-spin-dots__dot com-spin-dots__dot--on' : 'com-spin-dots__dot'}
                  onClick={() => setSpinIdx(i)}
                />
              ))}
            </div>
          )}

          <GatedLink to="/community#feed" forceGate className="com-panel__cta">
            <span>View all spins</span>
            <span className="com-panel__cta-arrow" aria-hidden>
              →
            </span>
          </GatedLink>
        </article>

        {/* Crews */}
        <article className="com-panel com-panel--crews">
          <header className="com-panel__head">
            <IcoCrew />
            <div>
              <h3 className="com-panel__title">Top crews</h3>
              <p className="com-panel__sub">Weekly board</p>
            </div>
          </header>

          {topCrew && (
            <div className="com-crew-lead">
              <span className="com-crew-lead__rank">1</span>
              <IcoPulse />
              <span className="com-crew-lead__name">{topCrew.name}</span>
              <span className="com-crew-lead__db">{topCrew.weeklyDb.toLocaleString()} dB</span>
            </div>
          )}

          <div className="com-crew-visual">
            <img src={DISCOVER_CREW_HERO_IMAGE} alt="" className="com-crew-visual__img" loading="lazy" />
            <div className="com-crew-visual__shade" aria-hidden />
          </div>

          <GatedLink to="/community#crew-wars-heading" forceGate className="com-panel__cta">
            <span>View leaderboards</span>
            <span className="com-panel__cta-arrow" aria-hidden>
              →
            </span>
          </GatedLink>
        </article>
      </div>
    </section>
  )
}

function VinylDisc() {
  return (
    <svg viewBox="0 0 80 80" className="com-vinyl" aria-hidden>
      <circle cx="40" cy="40" r="38" fill="var(--color-mh-black)" stroke="var(--color-border)" strokeWidth="1" />
      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-elevated)" strokeWidth="0.5" />
      <circle cx="40" cy="40" r="24" fill="none" stroke="var(--color-elevated)" strokeWidth="0.5" />
      <circle cx="40" cy="40" r="10" fill="var(--color-mh-red)" />
      <circle cx="40" cy="40" r="3" fill="var(--color-void)" />
    </svg>
  )
}

function SpinWaveform() {
  const heights = [4, 7, 5, 9, 6, 11, 8, 12, 7, 10, 5, 8, 6, 9, 4, 7, 5, 10, 6, 8]
  return (
    <div className="com-wave">
      {heights.map((h, i) => (
        <span key={i} style={{ height: `${h}px` }} />
      ))}
    </div>
  )
}

function IcoTrend() {
  return (
    <svg className="com-panel__ico" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M2 11l4-4 3 3 5-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 4h4v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function IcoSpin() {
  return (
    <svg className="com-panel__ico" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={2 + i * 3.5} y={5 - (i % 2)} width="2" height={5 + (i % 2) * 3} fill="currentColor" />
      ))}
    </svg>
  )
}

function IcoCrew() {
  return (
    <svg className="com-panel__ico" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="5.5" cy="5" r="2" stroke="currentColor" strokeWidth="1" />
      <path d="M2 13c0-2 1.5-3.5 3.5-3.5S9 11 9 13" stroke="currentColor" strokeWidth="1" />
      <circle cx="11" cy="5.5" r="1.6" stroke="currentColor" strokeWidth="1" />
      <path d="M8.5 13c0-1.5 1-2.5 2.5-2.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function IcoGenre({ muted }: { muted?: boolean }) {
  return (
    <svg
      className={muted ? 'com-tribe__ico com-tribe__ico--muted' : 'com-tribe__ico'}
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
    >
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="6" cy="6" r="1.2" fill="currentColor" />
    </svg>
  )
}

function IcoPulse() {
  return (
    <svg className="com-crew-lead__ico" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={1 + i * 3.5} y={4 - (i % 2)} width="2" height={4 + (i % 2) * 4} fill="currentColor" />
      ))}
    </svg>
  )
}

function IcoPlay() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden>
      <path d="M2 1.5v7l6-3.5L2 1.5z" />
    </svg>
  )
}
