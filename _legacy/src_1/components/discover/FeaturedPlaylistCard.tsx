import { GatedLink } from '@/components/auth/GatedLink'
import { PlaylistCover } from '@/components/discover/PlaylistCover'
import { playlistFollowerDisplay } from '@/lib/discovery/playlists'
import type { Playlist } from '@/types'
import '@/styles/playlists-featured.css'

function initials(title: string): string {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
}

export function FeaturedPlaylistCard({ playlist }: { playlist: Playlist }) {
  const desc =
    playlist.slug === 'midnight-frequencies'
      ? 'Left-field electronics, dark grooves and nocturnal transmissions.'
      : playlist.description

  const followers = playlistFollowerDisplay(playlist.slug)
  const duration = playlist.duration.toUpperCase()

  return (
    <GatedLink
      to={`/playlist/${playlist.slug}`}
      forceGate
      className="pl-feat"
      aria-label={`Featured playlist: ${playlist.title}`}
    >
      <div className="pl-feat__bg" aria-hidden />

      <div className="pl-feat__inner">
        <div className="pl-feat__art">
          <div className="pl-feat__stack">
            <div className="pl-feat__glow" aria-hidden />
            <div className="pl-feat__vinyl" aria-hidden />
            <div className="pl-feat__sleeve">
              <span className="pl-feat__spine" aria-hidden>
                The act
              </span>
              <PlaylistCover
                src={playlist.cover}
                alt=""
                className="pl-feat__cover"
                fallback={initials(playlist.title)}
                width={480}
                sizes="(max-width: 960px) 42vw, 200px"
                priority
              />
            </div>
          </div>
        </div>

        <div className="pl-feat__copy">
          <div className="pl-feat__labels">
            <span className="pl-feat__badge">
              <IcoStar />
              Featured
            </span>
            <span className="pl-feat__wire">IOS wire pick</span>
          </div>

          <h3 className="pl-feat__title">{playlist.title}</h3>
          <p className="pl-feat__desc">{desc}</p>

          <div className="pl-feat__stats">
            <div className="pl-feat__stat">
              <IcoNote />
              <span className="pl-feat__stat-num">{playlist.trackCount}</span>
              <span className="pl-feat__stat-lbl">Tracks</span>
            </div>
            <div className="pl-feat__stat">
              <IcoClock />
              <span className="pl-feat__stat-num">{duration}</span>
              <span className="pl-feat__stat-lbl">Duration</span>
            </div>
            <div className="pl-feat__stat">
              <IcoPeople />
              <span className="pl-feat__stat-num">{followers.count}</span>
              <span className="pl-feat__stat-lbl">Followers</span>
            </div>
          </div>

          <div className="pl-feat__actions">
            <span className="pl-feat__play">
              <IcoPlay />
              Play now
            </span>
            <button type="button" className="pl-feat__follow" onClick={(e) => e.preventDefault()}>
              Follow
            </button>
            <button
              type="button"
              className="pl-feat__more"
              aria-label="More options"
              onClick={(e) => e.preventDefault()}
            >
              ···
            </button>
          </div>
        </div>
      </div>
    </GatedLink>
  )
}

function IcoStar() {
  return (
    <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
      <path
        d="M4.5 1l.95 2.1 2.3.35-1.65 1.6.4 2.3L4.5 5.8 2.47 7.35l.4-2.3L1.22 3.45 3.52 3.1 4.5 1z"
        stroke="currentColor"
        strokeWidth="0.8"
      />
    </svg>
  )
}

function IcoPlay() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M4.5 3v6l5-3-5-3z" fill="currentColor" />
    </svg>
  )
}

function IcoNote() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
      <path d="M4 1.5v9l5.5-2.8V4.2L4 1.5z" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
  )
}

function IcoClock() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
      <path d="M6 3.5v2.8l2 1.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function IcoPeople() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="4" cy="3.8" r="1.6" stroke="currentColor" strokeWidth="1" />
      <path d="M1 10c0-1.6 1.2-2.8 3-2.8s3 1.2 3 2.8" stroke="currentColor" strokeWidth="1" />
      <circle cx="8.2" cy="4.2" r="1.3" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
