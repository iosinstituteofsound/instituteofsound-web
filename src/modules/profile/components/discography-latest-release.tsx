import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { ReleaseVinylArt } from '@/modules/explore/components/release-vinyl-art'
import type { ReleaseDto } from '@/modules/explore/types/explore.types'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { releaseDtoToPlayerTrack } from '@/modules/music/lib/player-track-builders'
import {
  discographyReleaseDate,
  discographyReleaseType,
  isLatestPreviewRelease,
} from '@/modules/profile/lib/discography-format'
import '@/modules/explore/styles/release-vinyl-art.css'
import '@/modules/explore/styles/explore.css'
import '@/modules/profile/styles/disc-latest-release.css'

type DiscographyLatestReleaseProps = {
  release: ReleaseDto
}

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/).filter(Boolean)
  if (words.length <= 1) return { lead: title, rest: '' }
  return { lead: words[0]!, rest: words.slice(1).join(' ') }
}

export function DiscographyLatestRelease({ release }: DiscographyLatestReleaseProps) {
  const playTrack = usePlayerStore((s) => s.playTrack)
  const { lead, rest } = splitTitle(release.title)
  const preview = isLatestPreviewRelease(release.id)
  const canPlay = Boolean(release.streamUrl)

  const titleContent = (
    <>
      <span className="disc-spot__title-line">{lead}</span>
      {rest ? (
        <span className="disc-spot__title-line disc-spot__title-line--accent">{rest}</span>
      ) : null}
    </>
  )

  return (
    <section className={`disc-spot${preview ? ' disc-spot--preview' : ''}`} aria-labelledby="disc-spot-heading">
      <span className="disc-spot__wash" aria-hidden />

      <div className="disc-spot__stage">
        <div className="disc-spot__art">
          <ReleaseVinylArt
            release={release}
            variant="hero"
            spinning
            className="disc-spot__vinyl"
          />
        </div>

        <span className="disc-spot__divider" aria-hidden />

        <div className="disc-spot__copy">
          <span className="disc-spot__watermark" aria-hidden>
            {preview ? 'DEMO' : 'NEW'}
          </span>

          <p id="disc-spot-heading" className="disc-spot__label ios-mh-kicker">
            {preview ? 'Latest release · sample slot' : 'Latest release'}
          </p>

          <h2 className="disc-spot__title">
            {preview ? (
              <span>{titleContent}</span>
            ) : (
              <Link to={`/releases/${release.id}`}>{titleContent}</Link>
            )}
          </h2>

          <div className="disc-spot__meta">
            <time dateTime={release.releaseDate}>{discographyReleaseDate(release)}</time>
            <span className="disc-spot__meta-dot" aria-hidden />
            <span>{discographyReleaseType(release)}</span>
            {release.genre ? (
              <>
                <span className="disc-spot__meta-dot" aria-hidden />
                <span>{release.genre}</span>
              </>
            ) : null}
          </div>

          <div className="disc-spot__actions">
            {canPlay ? (
              <button
                type="button"
                className="disc-spot__btn disc-spot__btn--fill ios-mh-btn ios-mh-btn--fill"
                onClick={() => {
                  const track = releaseDtoToPlayerTrack(release)
                  if (!track) return
                  playTrack(track)
                }}
              >
                <Play size={11} strokeWidth={2.5} fill="currentColor" aria-hidden />
                Listen
              </button>
            ) : null}
            {!preview ? (
              <Link
                to={`/releases/${release.id}`}
                className="disc-spot__btn ios-mh-btn ios-mh-btn--line"
              >
                View release
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
