import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { LabelOverviewStatsDto } from '@/modules/explore/types/explore.types'
import { labelOverviewStreamsLabel } from '@/modules/profile/lib/label-overview-format'
import '@/modules/profile/styles/label-overview-by-the-numbers.css'

type LabelOverviewByTheNumbersProps = {
  stats: LabelOverviewStatsDto
  submitHref?: string
}

const STAT_ITEMS = [
  { key: 'releases', label: 'Releases', code: 'REL' },
  { key: 'artists', label: 'Artists', code: 'ART' },
  { key: 'streams', label: 'Streams', code: 'STR' },
  { key: 'countriesReach', label: 'Countries', code: 'GEO' },
] as const

function statValue(stats: LabelOverviewStatsDto, key: (typeof STAT_ITEMS)[number]['key']): string {
  if (key === 'streams') return labelOverviewStreamsLabel(stats.streams)
  return String(stats[key])
}

export function LabelOverviewByTheNumbers({
  stats,
  submitHref = '/submissions',
}: LabelOverviewByTheNumbersProps) {
  return (
    <section className="lbl-ov-numbers" aria-labelledby="lbl-ov-numbers-heading">
      <div className="lbl-ov-numbers__chassis">
        <div className="lbl-ov-numbers__fx" aria-hidden>
          <div className="lbl-ov-numbers__scanlines" />
          <div className="lbl-ov-numbers__grid-bg" />
          <div className="lbl-ov-numbers__glow" />
        </div>

        <span className="lbl-ov-numbers__bracket lbl-ov-numbers__bracket--tl" aria-hidden />
        <span className="lbl-ov-numbers__bracket lbl-ov-numbers__bracket--tr" aria-hidden />
        <span className="lbl-ov-numbers__bracket lbl-ov-numbers__bracket--bl" aria-hidden />
        <span className="lbl-ov-numbers__bracket lbl-ov-numbers__bracket--br" aria-hidden />

        <div className="lbl-ov-numbers__body">
          <div className="lbl-ov-numbers__topline">
            <span className="lbl-ov-numbers__module-id">STAT-01</span>
            <div className="lbl-ov-numbers__live">
              <span className="lbl-ov-numbers__live-bracket" aria-hidden />
              <span className="lbl-ov-numbers__live-pill">
                <span className="lbl-ov-numbers__live-dot" aria-hidden />
                Live
              </span>
            </div>
          </div>

          <h2 id="lbl-ov-numbers-heading" className="lbl-ov-numbers__title">
            By the Numbers
          </h2>

          <div className="lbl-ov-numbers__grid" role="list">
            {STAT_ITEMS.map(({ key, label, code }) => (
              <div key={key} className="lbl-ov-numbers__stat" role="listitem">
                <span className="lbl-ov-numbers__stat-code">{code}</span>
                <p className="lbl-ov-numbers__stat-value">{statValue(stats, key)}</p>
                <p className="lbl-ov-numbers__stat-label">{label}</p>
              </div>
            ))}
          </div>

          <div className="lbl-ov-numbers__cta">
            <div className="lbl-ov-numbers__cta-inner">
              <h3 className="lbl-ov-numbers__cta-title">Submissions Open</h3>
              <p className="lbl-ov-numbers__cta-text">
                We&apos;re always looking for forward-thinking artists and unique sounds.
              </p>
              <Link to={submitHref} className="lbl-ov-numbers__cta-btn">
                Submit Music
                <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
              </Link>
            </div>

            <div className="lbl-ov-numbers__vinyl" aria-hidden>
              <span className="lbl-ov-numbers__vinyl-ring" />
              <span className="lbl-ov-numbers__vinyl-disc" />
              <span className="lbl-ov-numbers__vinyl-hub" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
