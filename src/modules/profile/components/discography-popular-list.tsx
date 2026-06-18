import { Link } from 'react-router-dom'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { releaseInitials } from '@/modules/explore/lib/release-meta'
import { formatDiscographyPlays, fillPopularPreview, isPopularPreviewRelease } from '@/modules/profile/lib/discography-format'
import '@/modules/profile/styles/disc-device-panel.css'

type DiscographyPopularListProps = {
  releases: ReleaseDto[]
}

export function DiscographyPopularList({ releases }: DiscographyPopularListProps) {
  if (releases.length === 0) return null

  const tracks = fillPopularPreview(releases)

  return (
    <section className="disc-dev disc-dev--matrix" aria-labelledby="discography-popular-heading">
      <div className="disc-dev__chassis">
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--tl" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--tr" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--bl" aria-hidden />
        <span className="disc-dev__chassis-notch disc-dev__chassis-notch--br" aria-hidden />

        <header className="disc-dev__header">
          <span className="disc-dev__vents" aria-hidden />
          <div className="disc-dev__header-left">
            <span className="disc-dev__led-cluster" aria-hidden>
              <span className="disc-dev__led" />
              <span className="disc-dev__led disc-dev__led--dim" />
            </span>
            <span className="disc-dev__module-id">MX-01</span>
          </div>
          <div className="disc-dev__header-center">
            <p className="disc-dev__kicker">:: Stream matrix</p>
            <h2 id="discography-popular-heading" className="disc-dev__title">
              Popular
            </h2>
          </div>
          <span className="disc-dev__header-meta">{String(tracks.length).padStart(2, '0')} trks</span>
        </header>

        <div className="disc-dev__screen">
          <span className="disc-dev__screen-bezel" aria-hidden />
          <span className="disc-dev__screen-grid" aria-hidden />
          <span className="disc-dev__screen-scan" aria-hidden />
          <span className="disc-dev__screen-glow" aria-hidden />
          <span className="disc-dev__screen-noise" aria-hidden />

          <ol className="disc-dev__tracks">
            {tracks.map((release, index) => {
              const preview = isPopularPreviewRelease(release.id)
              const row = (
                <>
                  <span className="disc-dev__track-rank">{String(index + 1).padStart(2, '0')}</span>
                  {release.coverUrl ? (
                    <img
                      src={release.coverUrl}
                      alt=""
                      className="disc-dev__track-thumb"
                      loading="lazy"
                    />
                  ) : (
                    <span className="disc-dev__track-thumb disc-dev__track-thumb--fallback" aria-hidden>
                      {releaseInitials(release.title)}
                    </span>
                  )}
                  <span className="disc-dev__track-name">{release.title}</span>
                  <span className="disc-dev__track-stat">
                    <span className="disc-dev__track-stat-value">
                      {formatDiscographyPlays(release.playCount)}
                    </span>
                    <span className="disc-dev__track-stat-label">streams</span>
                  </span>
                </>
              )

              return (
                <li key={release.id} className="disc-dev__track">
                  {preview ? (
                    <div className="disc-dev__track-link disc-dev__track-link--preview">{row}</div>
                  ) : (
                    <Link to={`/releases/${release.id}`} className="disc-dev__track-link">
                      {row}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
        </div>

        <footer className="disc-dev__footer">
          <span className="disc-dev__footer-tag">SYS.OK</span>
          <span className="disc-dev__footer-line" aria-hidden />
          <span className="disc-dev__footer-tag disc-dev__footer-tag--live">LIVE</span>
        </footer>
      </div>
    </section>
  )
}
