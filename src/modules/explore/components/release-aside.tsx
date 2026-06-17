import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Copy, ExternalLink, Share2 } from 'lucide-react'
import type { ArtistProfileDto, ReleaseDto } from '@/modules/explore/types/explore.types'
import {
  artistReleaseStats,
  releaseStreamPlatform,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'
import { artistInitials } from '@/modules/explore/lib/artist-meta'
import '@/modules/explore/styles/release-aside.css'

interface ReleaseAsideProps {
  release: ReleaseDto
  artist?: ArtistProfileDto
  artistReleases: ReleaseDto[]
  allReleases: ReleaseDto[]
  saved: boolean
  onToggleSave: () => void
}

function collectGenreTags(artist: ArtistProfileDto | undefined, release: ReleaseDto): string[] {
  const tags = new Set<string>()
  artist?.genres.forEach((genre) => {
    const value = genre.trim()
    if (value) tags.add(value)
  })
  const releaseGenre = release.genre?.trim()
  if (releaseGenre) tags.add(releaseGenre)
  return [...tags].slice(0, 4)
}

export function ReleaseAside({
  release,
  artist,
  artistReleases,
  allReleases,
  saved,
  onToggleSave,
}: ReleaseAsideProps) {
  const stats = artist ? artistReleaseStats(artist, allReleases) : null
  const sidebarTracks = useMemo(
    () => [release, ...artistReleases.filter((item) => item.id !== release.id)].slice(0, 5),
    [artistReleases, release],
  )
  const platform = releaseStreamPlatform(release.streamUrl)
  const genreTags = useMemo(() => collectGenreTags(artist, release), [artist, release])
  const bio = artist?.bio?.trim()

  const copyLink = () => {
    void navigator.clipboard?.writeText(window.location.href)
  }

  const share = () => {
    if (navigator.share) {
      void navigator.share({ title: release.title, url: window.location.href })
      return
    }
    copyLink()
  }

  return (
    <aside className="rel-aside rel-aside--device" aria-label="Artist panel">
      <div className="rel-aside__chassis">
        <div className="rel-aside__chassis-glow" aria-hidden />
        <div className="rel-aside__chassis-scan" aria-hidden />

        <header className="rel-aside__device-head">
          <div className="rel-aside__device-status">
            <span className="rel-aside__device-led" aria-hidden />
            <span className="rel-aside__device-label">Artist terminal</span>
          </div>
          <span className="rel-aside__device-id">IOS·AS·01</span>
        </header>

        <div className="rel-aside__device-body">
          {artist ? (
            <section className="rel-aside__module ios-mh-surface" aria-label="Artist profile">
              <span className="rel-aside__module-corner rel-aside__module-corner--tl" aria-hidden />
              <span className="rel-aside__module-corner rel-aside__module-corner--tr" aria-hidden />
              <span className="rel-aside__module-corner rel-aside__module-corner--bl" aria-hidden />
              <span className="rel-aside__module-corner rel-aside__module-corner--br" aria-hidden />

              <div className="rel-aside__profile">
                <div className="rel-aside__avatar-shell">
                  {artist.avatarUrl ? (
                    <img src={artist.avatarUrl} alt="" className="rel-aside__avatar" />
                  ) : (
                    <span className="rel-aside__avatar rel-aside__avatar--fb" aria-hidden>
                      {artistInitials(artist.displayName)}
                    </span>
                  )}
                  <span className="rel-aside__avatar-ring" aria-hidden />
                </div>
                <div className="rel-aside__identity">
                  <p className="rel-aside__kicker ios-mh-kicker">Artist</p>
                  <p className="rel-aside__name">{artist.displayName}</p>
                  {artist.labelName ? (
                    <p className="rel-aside__label">{artist.labelName}</p>
                  ) : null}
                </div>
              </div>

              {bio ? <p className="rel-aside__bio">{bio}</p> : null}

              {genreTags.length > 0 ? (
                <div className="rel-aside__genres" aria-label="Artist genres">
                  {genreTags.map((genre) => (
                    <span key={genre} className="rel-aside__genre ios-mh-tag">
                      {genre}
                    </span>
                  ))}
                </div>
              ) : null}

              {stats ? (
                <dl className="rel-aside__stats">
                  <div className="ios-mh-stat">
                    <dt>Tracks</dt>
                    <dd>{stats.trackCount}</dd>
                  </div>
                  <div className="ios-mh-stat">
                    <dt>Plays</dt>
                    <dd>{stats.totalPlays}</dd>
                  </div>
                  <div className="ios-mh-stat">
                    <dt>Releases</dt>
                    <dd>{stats.releaseCount}</dd>
                  </div>
                  <div className="ios-mh-stat">
                    <dt>Listeners</dt>
                    <dd>{stats.listeners}</dd>
                  </div>
                </dl>
              ) : null}

              <Link
                to={`/profile/${artist.userId}`}
                className="rel-aside__studio ios-mh-btn ios-mh-btn--fill"
              >
                View studio
              </Link>
            </section>
          ) : null}

          <section className="rel-aside__module ios-mh-surface" aria-label="Support the artist">
            <span className="rel-aside__module-corner rel-aside__module-corner--tl" aria-hidden />
            <span className="rel-aside__module-corner rel-aside__module-corner--tr" aria-hidden />
            <span className="rel-aside__module-corner rel-aside__module-corner--bl" aria-hidden />
            <span className="rel-aside__module-corner rel-aside__module-corner--br" aria-hidden />

            <p className="rel-aside__section-kicker ios-mh-kicker">Support the artist</p>
            {release.streamUrl ? (
              <a
                href={release.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rel-aside__stream"
              >
                <span>Listen on {platform}</span>
                <ExternalLink size={14} strokeWidth={2} aria-hidden />
              </a>
            ) : (
              <p className="rel-aside__stream-note">Stream link coming soon on IOS Wire.</p>
            )}
            <div className="rel-aside__actions">
              <button type="button" className="rel-aside__action" onClick={copyLink}>
                <Copy size={13} strokeWidth={2} aria-hidden />
                Copy link
              </button>
              <button type="button" className="rel-aside__action" onClick={share}>
                <Share2 size={13} strokeWidth={2} aria-hidden />
                Share
              </button>
              <button
                type="button"
                className={`rel-aside__action${saved ? ' is-active' : ''}`}
                onClick={onToggleSave}
              >
                <Bookmark size={13} strokeWidth={2} aria-hidden />
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </section>

          {sidebarTracks.length > 0 ? (
            <section className="rel-aside__module ios-mh-surface" aria-label="From this artist">
              <span className="rel-aside__module-corner rel-aside__module-corner--tl" aria-hidden />
              <span className="rel-aside__module-corner rel-aside__module-corner--tr" aria-hidden />
              <span className="rel-aside__module-corner rel-aside__module-corner--bl" aria-hidden />
              <span className="rel-aside__module-corner rel-aside__module-corner--br" aria-hidden />

              <p className="rel-aside__section-kicker ios-mh-kicker">From this artist</p>
              <ul className="rel-aside__tracks">
                {sidebarTracks.map((item) => {
                  const isCurrent = item.id === release.id
                  return (
                    <li key={item.id}>
                      <Link
                        to={`/releases/${item.id}`}
                        className={`rel-aside__track${isCurrent ? ' is-current' : ''}`}
                      >
                        {item.coverUrl ? (
                          <img src={item.coverUrl} alt="" className="rel-aside__track-cover" />
                        ) : (
                          <span className="rel-aside__track-cover rel-aside__track-cover--fb" aria-hidden>
                            {item.title.slice(0, 1)}
                          </span>
                        )}
                        <span className="rel-aside__track-copy">
                          <span className="rel-aside__track-title">{item.title}</span>
                          <span className="rel-aside__track-meta">
                            {releaseTypeLabel(item.type)}
                            {isCurrent ? (
                              <span className="rel-aside__track-now">Now on this page</span>
                            ) : null}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          ) : null}
        </div>

        <footer className="rel-aside__device-foot" aria-hidden>
          <span className="rel-aside__device-foot-tag">Signal live</span>
          <span className="rel-aside__device-foot-bars">
            <i />
            <i />
            <i />
            <i />
          </span>
        </footer>
      </div>
    </aside>
  )
}
