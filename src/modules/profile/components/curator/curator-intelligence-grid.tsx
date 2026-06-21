import type { ReactNode } from 'react'
import type { CuratorGenreSliceDto, CuratorScoreDto } from '@/modules/explore/types/explore.types'
import { Info } from 'lucide-react'
import { CuratorMultiDonut } from '@/modules/profile/components/curator/curator-donut-chart'
import { CuratorScoreBoard } from '@/modules/profile/components/curator/curator-score-meter'
import '@/modules/profile/styles/curator-intel-device.css'

type CuratorIntelligenceGridProps = {
  scores: CuratorScoreDto
  tasteMap: CuratorGenreSliceDto[]
  genreTags: string[]
}

const SCORE_ITEMS: Array<{ key: keyof CuratorScoreDto; label: string }> = [
  { key: 'taste', label: 'Taste Score' },
  { key: 'discovery', label: 'Discovery Score' },
  { key: 'influence', label: 'Influence Score' },
  { key: 'accuracy', label: 'Accuracy Score' },
]

function DeviceNotches() {
  return (
    <>
      <span className="curator-intel-dev__notch curator-intel-dev__notch--tl" aria-hidden />
      <span className="curator-intel-dev__notch curator-intel-dev__notch--tr" aria-hidden />
      <span className="curator-intel-dev__notch curator-intel-dev__notch--bl" aria-hidden />
      <span className="curator-intel-dev__notch curator-intel-dev__notch--br" aria-hidden />
    </>
  )
}

function DeviceScreen({ children }: { children: ReactNode }) {
  return (
    <div className="curator-intel-dev__screen">
      <div className="curator-intel-dev__screen-grid" aria-hidden />
      <div className="curator-intel-dev__screen-scan" aria-hidden />
      <div className="curator-intel-dev__screen-glow" aria-hidden />
      <div className="curator-intel-dev__screen-bezel" aria-hidden />
      <div className="curator-intel-dev__screen-content">{children}</div>
    </div>
  )
}

function DeviceFooter({ label }: { label: string }) {
  return (
    <footer className="curator-intel-dev__foot" aria-hidden>
      <span>{label}</span>
      <span className="curator-intel-dev__foot-bars">
        <span />
        <span />
        <span />
        <span />
      </span>
    </footer>
  )
}

export function CuratorIntelligenceGrid({ scores, tasteMap, genreTags }: CuratorIntelligenceGridProps) {
  return (
    <div className="curator-intel-dev">
      <div className="curator-intel-dev__rack" aria-hidden>
        <span className="curator-intel-dev__rack-rail" />
        <span className="curator-intel-dev__rack-bus" />
      </div>

      <article className="curator-intel-dev__panel curator-intel-dev__panel--scores" aria-labelledby="curator-score-heading">
        <div className="curator-intel-dev__chassis">
          <DeviceNotches />
          <span className="curator-intel-dev__vents" aria-hidden />

          <header className="curator-intel-dev__header">
            <div className="curator-intel-dev__header-left">
              <div className="curator-intel-dev__led-cluster" aria-hidden>
                <span className="curator-intel-dev__led" />
                <span className="curator-intel-dev__led curator-intel-dev__led--amber" />
                <span className="curator-intel-dev__led curator-intel-dev__led--dim" />
              </div>
              <span className="curator-intel-dev__module-id">IOS·CU·01</span>
            </div>

            <div className="curator-intel-dev__title-wrap">
              <h2 id="curator-score-heading" className="curator-intel-dev__title">
                Curator Score
              </h2>
              <span
                className="curator-intel-dev__info"
                title="Quality of selections, discovery ability, audience impact, and prediction accuracy."
              >
                <Info size={14} strokeWidth={2} aria-hidden />
              </span>
            </div>

            <span className="curator-intel-dev__readout">Live</span>
          </header>

          <DeviceScreen>
            <CuratorScoreBoard
              scores={SCORE_ITEMS.map(({ key, label }, i) => ({
                value: scores[key],
                label,
                index: i + 1,
              }))}
            />
          </DeviceScreen>

          <DeviceFooter label="Signal · Active" />
        </div>
      </article>

      <article className="curator-intel-dev__panel curator-intel-dev__panel--taste" aria-labelledby="curator-taste-map-heading">
        <div className="curator-intel-dev__chassis">
          <DeviceNotches />
          <span className="curator-intel-dev__vents" aria-hidden />

          <header className="curator-intel-dev__header">
            <div className="curator-intel-dev__header-left">
              <div className="curator-intel-dev__led-cluster" aria-hidden>
                <span className="curator-intel-dev__led curator-intel-dev__led--amber" />
                <span className="curator-intel-dev__led" />
                <span className="curator-intel-dev__led curator-intel-dev__led--dim" />
              </div>
              <span className="curator-intel-dev__module-id">IOS·CU·02</span>
            </div>

            <div className="curator-intel-dev__title-wrap">
              <h2 id="curator-taste-map-heading" className="curator-intel-dev__title">
                Taste Map
              </h2>
            </div>

            <span className="curator-intel-dev__readout">Scan OK</span>
          </header>

          <DeviceScreen>
            <div className="curator-taste-map">
              <div className="curator-taste-map__chart-wrap">
                <CuratorMultiDonut
                  slices={tasteMap.map((slice) => ({
                    label: slice.genre,
                    percent: slice.percent,
                    color: slice.color,
                  }))}
                  className="curator-taste-map__chart"
                />
              </div>
              <ul className="curator-taste-map__legend">
                {tasteMap.map((slice) => (
                  <li key={slice.genre}>
                    <span
                      className="curator-taste-map__dot"
                      style={{ background: slice.color ?? 'var(--intel-neon)', color: slice.color ?? 'var(--intel-neon)' }}
                      aria-hidden
                    />
                    <span>{slice.genre}</span>
                    <strong>{slice.percent}%</strong>
                  </li>
                ))}
              </ul>
              <div className="curator-taste-map__tags">
                {genreTags.map((tag) => (
                  <span key={tag} className="curator-taste-map__tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </DeviceScreen>

          <DeviceFooter label="Spectrum · Locked" />
        </div>
      </article>
    </div>
  )
}
