import type { CSSProperties } from 'react'
import type { ArtistDiscographyStats } from '@/modules/profile/lib/discography-stats'
import { formatDiscographyStatValue } from '@/modules/profile/lib/discography-stats'
import { cn } from '@/shared/lib/cn'
import '@/modules/profile/styles/disc-device-panel.css'
import '@/modules/profile/styles/disc-stats-telemetry.css'

type DiscographyStatsTelemetryProps = {
  stats: ArtistDiscographyStats
  preview?: boolean
}

const STAT_SLOTS = [
  { key: 'totalReleases', code: 'REL', label: 'Total Releases', compact: false },
  { key: 'totalTracks', code: 'TRK', label: 'Total Tracks', compact: false },
  { key: 'totalStreams', code: 'STR', label: 'Total Streams', compact: true },
  { key: 'monthlyListeners', code: 'MLN', label: 'Monthly Listeners', compact: true },
  { key: 'followers', code: 'FLW', label: 'Followers', compact: true },
  { key: 'countriesReached', code: 'GEO', label: 'Countries Reached', compact: false },
] as const

function statValue(stats: ArtistDiscographyStats, key: (typeof STAT_SLOTS)[number]['key'], compact: boolean) {
  return formatDiscographyStatValue(stats[key], compact)
}

function sparkHeights(stats: ArtistDiscographyStats): number[] {
  const base = [
    stats.totalReleases,
    stats.totalTracks,
    Math.min(stats.totalStreams / 10_000, 99),
    stats.monthlyListeners,
    stats.followers,
    stats.countriesReached * 8,
  ]
  const max = Math.max(...base, 1)
  return base.map((value) => Math.max(8, Math.round((value / max) * 100)))
}

export function DiscographyStatsTelemetry({ stats, preview }: DiscographyStatsTelemetryProps) {
  const bars = sparkHeights(stats)

  return (
    <section className="disc-dev disc-dev--telemetry" aria-labelledby="discography-stats-heading">
      <div className="disc-dev__chassis">
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--tl" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--tr" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--bl" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--br" aria-hidden />

        <header className="disc-dev__header disc-stats__header">
          <div className="disc-stats__header-row">
            <div className="disc-dev__header-left">
              <span className="disc-dev__led-cluster" aria-hidden>
                <span className="disc-dev__led disc-stats__led" />
                <span className="disc-dev__led disc-dev__led--dim" />
              </span>
              <span className="disc-dev__module-id">ST-03</span>
            </div>
            <span className={cn('disc-stats__status', preview && 'disc-stats__status--demo')}>
              {preview ? 'Demo' : 'Live'}
            </span>
          </div>
          <div className="disc-stats__header-copy">
            <p className="disc-dev__kicker">:: Telemetry uplink</p>
            <h2 id="discography-stats-heading" className="disc-dev__title disc-stats__title">
              Artist metrics
            </h2>
          </div>
        </header>

        <div className="disc-stats__screen disc-dev__screen">
          <span className="disc-dev__screen-bezel" aria-hidden />
          <span className="disc-dev__screen-grid" aria-hidden />
          <span className="disc-dev__screen-scan" aria-hidden />
          <span className="disc-dev__screen-glow" aria-hidden />
          <span className="disc-dev__screen-noise" aria-hidden />
          <span className="disc-stats__radar" aria-hidden />
          <span className="disc-stats__hex" aria-hidden />

          <div className="disc-stats__wave" aria-hidden>
            {Array.from({ length: 20 }, (_, index) => (
              <span
                key={index}
                className="disc-stats__wave-bar"
                style={{ '--disc-stats-wave-i': index } as CSSProperties}
              />
            ))}
          </div>

          <div className="disc-stats__grid" role="list">
            {STAT_SLOTS.map(({ key, code, label, compact }, index) => {
              const value = statValue(stats, key, compact)
              const empty = value === '—'

              return (
                <article key={key} className="disc-stats__cell" role="listitem">
                  <span className="disc-stats__cell-bracket disc-stats__cell-bracket--tl" aria-hidden />
                  <span className="disc-stats__cell-bracket disc-stats__cell-bracket--tr" aria-hidden />
                  <span className="disc-stats__cell-scan" aria-hidden />

                  <div className="disc-stats__cell-head">
                    <span className="disc-stats__cell-code">{code}</span>
                    <span className="disc-stats__cell-slot">{String(index + 1).padStart(2, '0')}</span>
                  </div>

                  <p className={cn('disc-stats__cell-value', empty && 'disc-stats__cell-value--empty')}>
                    {value}
                  </p>

                  <p className="disc-stats__cell-label">{label}</p>

                  <div className="disc-stats__cell-bar" aria-hidden>
                    <span
                      className="disc-stats__cell-bar-fill"
                      style={{ width: `${bars[index] ?? 8}%` }}
                    />
                  </div>
                </article>
              )
            })}
          </div>

          <div className="disc-stats__ticker" aria-hidden>
            <span className="disc-stats__ticker-track">
              {preview
                ? 'Sample telemetry · metrics populate when you publish · sample telemetry · metrics populate when you publish · '
                : 'Signal locked · metrics stream active · signal locked · metrics stream active · '}
            </span>
          </div>
        </div>

        <footer className="disc-dev__footer disc-stats__footer">
          <span className="disc-dev__footer-tag">Uplink</span>
          <span className="disc-dev__footer-line" aria-hidden />
          <span className="disc-dev__footer-tag disc-dev__footer-tag--live">
            {preview ? 'Standby' : 'Sync ok'}
          </span>
        </footer>
      </div>
    </section>
  )
}
