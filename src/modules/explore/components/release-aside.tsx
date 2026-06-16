import { Link } from 'react-router-dom'
import { Bookmark, Copy, ExternalLink, Share2 } from 'lucide-react'
import type { ArtistProfileDto, ReleaseDto } from '@/modules/explore/types/explore.types'
import {
  artistReleaseStats,
  releaseStreamPlatform,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'
import { artistGenreLabel, artistInitials } from '@/modules/explore/lib/artist-meta'

interface ReleaseAsideProps {
  release: ReleaseDto
  artist?: ArtistProfileDto
  artistReleases: ReleaseDto[]
  allReleases: ReleaseDto[]
  saved: boolean
  onToggleSave: () => void
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
  const sidebarTracks = artistReleases.slice(0, 5)
  const platform = releaseStreamPlatform(release.streamUrl)

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
    <aside className="explore-rel-page-aside">
      {artist ? (
        <div className="explore-rel-page-aside__card explore-ed-glass">
          <div className="explore-rel-page-aside__artist">
            {artist.avatarUrl ? (
              <img src={artist.avatarUrl} alt="" className="explore-rel-page-aside__avatar" />
            ) : (
              <span className="explore-rel-page-aside__avatar-fb" aria-hidden>
                {artistInitials(artist.displayName)}
              </span>
            )}
            <div>
              <p className="explore-rel-page-aside__artist-name">{artist.displayName}</p>
              <p className="explore-rel-page-aside__artist-bio">
                {artist.bio?.slice(0, 120) ?? artistGenreLabel(artist)}
              </p>
            </div>
          </div>
          {stats ? (
            <dl className="explore-rel-page-aside__stats">
              <div>
                <dt>Tracks</dt>
                <dd>{stats.trackCount}</dd>
              </div>
              <div>
                <dt>Plays</dt>
                <dd>{stats.totalPlays}</dd>
              </div>
              <div>
                <dt>Releases</dt>
                <dd>{stats.releaseCount}</dd>
              </div>
              <div>
                <dt>Listeners</dt>
                <dd>{stats.listeners}</dd>
              </div>
            </dl>
          ) : null}
          <Link to={`/profile/${artist.userId}`} className="explore-rel-page-aside__studio">
            View Studio
          </Link>
        </div>
      ) : null}

      <div className="explore-rel-page-aside__card explore-ed-glass">
        <p className="explore-rel-page-aside__kicker">Support the artist</p>
        {release.streamUrl ? (
          <a
            href={release.streamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="explore-rel-page-aside__stream"
          >
            <span>Listen on {platform}</span>
            <ExternalLink size={14} strokeWidth={2} aria-hidden />
          </a>
        ) : (
          <p className="explore-rel-page-aside__stream-note">Stream link coming soon on IOS Wire.</p>
        )}
        <div className="explore-rel-page-aside__actions">
          <button type="button" className="explore-rel-page-aside__btn" onClick={copyLink}>
            <Copy size={13} strokeWidth={2} aria-hidden />
            Copy link
          </button>
          <button type="button" className="explore-rel-page-aside__btn" onClick={share}>
            <Share2 size={13} strokeWidth={2} aria-hidden />
            Share
          </button>
          <button
            type="button"
            className={`explore-rel-page-aside__btn${saved ? ' is-active' : ''}`}
            onClick={onToggleSave}
          >
            <Bookmark size={13} strokeWidth={2} aria-hidden />
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {sidebarTracks.length > 0 ? (
        <div className="explore-rel-page-aside__card explore-ed-glass">
          <p className="explore-rel-page-aside__kicker">From this artist</p>
          <ul className="explore-rel-page-aside__tracks">
            {sidebarTracks.map((item) => {
              const isCurrent = item.id === release.id
              return (
                <li key={item.id}>
                  <Link
                    to={`/explore/releases/${item.id}`}
                    className={`explore-rel-page-aside__track${isCurrent ? ' is-current' : ''}`}
                  >
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt="" className="explore-rel-page-aside__track-cover" />
                    ) : (
                      <span className="explore-rel-page-aside__track-fb" aria-hidden>
                        {item.title.slice(0, 1)}
                      </span>
                    )}
                    <span className="explore-rel-page-aside__track-copy">
                      <span className="explore-rel-page-aside__track-title">{item.title}</span>
                      <span className="explore-rel-page-aside__track-type">
                        {releaseTypeLabel(item.type)}
                      </span>
                    </span>
                    {isCurrent ? (
                      <span className="explore-rel-page-aside__now">Now on this page</span>
                    ) : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </aside>
  )
}
