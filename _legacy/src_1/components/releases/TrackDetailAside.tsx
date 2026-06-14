import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IOSImage } from '@/components/ui/IOSImage'
import type { ArtistProfile, ArtistTrack } from '@/lib/artist-profile/types'
import { trackDetailPath } from '@/lib/discovery/trackPaths'
import { formatPlayCount, formatPremiereDate } from '@/lib/discovery/premieres'
import {
  STREAM_PLATFORM_LABEL,
  streamPlatform,
} from '@/lib/artist-profile/streamPlatform'
import type { SocialLinkKey } from '@/lib/artist-profile/socialOrder'

interface TrackDetailAsideProps {
  profile: ArtistProfile
  currentTrack: ArtistTrack
  sidebarTracks: ArtistTrack[]
  artistStats: { trackCount: number; albumCount: number; totalPlays: number }
  streamUrl: string
  saved: boolean
  onToggleSave: () => void
  onStreamClick: () => void
}

const SOCIAL_LABELS: Partial<Record<SocialLinkKey, string>> = {
  spotify: 'Spotify',
  youtube: 'YouTube',
  instagram: 'IG',
  bandcamp: 'Bandcamp',
  website: 'Web',
  facebook: 'Facebook',
}

export function TrackDetailAside({
  profile,
  currentTrack,
  sidebarTracks,
  artistStats,
  streamUrl,
  saved,
  onToggleSave,
  onStreamClick,
}: TrackDetailAsideProps) {
  const [copied, setCopied] = useState(false)
  const platform = streamPlatform(streamUrl)
  const platformLabel = STREAM_PLATFORM_LABEL[platform]

  const socialEntries = (Object.entries(profile.social) as [SocialLinkKey, string | undefined][])
    .filter(([, url]) => url?.trim())
    .slice(0, 4)

  const genres = profile.genres.filter(Boolean).slice(0, 3)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${currentTrack.title} — ${profile.displayName}`,
          url: window.location.href,
        })
        return
      } catch {
        /* cancelled */
      }
    }
    void copyLink()
  }

  return (
    <aside className="tk-aside">
      <div className="tk-panel tk-panel--artist">
        <p className="tk-panel__kicker">Artist</p>

        <Link to={`/artist/${profile.slug}`} className="tk-artist-card">
          <div className="tk-artist-card__visual">
            {profile.avatarUrl ? (
              <IOSImage
                src={profile.avatarUrl}
                alt=""
                width={72}
                className="tk-artist-card__avatar"
              />
            ) : (
              <span className="tk-artist-card__avatar-fb" aria-hidden>
                {profile.displayName.slice(0, 1)}
              </span>
            )}
            <span className="tk-artist-card__live" aria-hidden>
              Studio live
            </span>
          </div>
          <div className="tk-artist-card__body">
            <p className="tk-artist-card__name">{profile.displayName}</p>
            {profile.country && <p className="tk-artist-card__loc">{profile.country}</p>}
            {profile.tagline && (
              <p className="tk-artist-card__tagline">{profile.tagline}</p>
            )}
          </div>
        </Link>

        <dl className="tk-artist-stats">
          <div>
            <dt>Tracks</dt>
            <dd>{artistStats.trackCount}</dd>
          </div>
          <div>
            <dt>Plays</dt>
            <dd>{formatPlayCount(artistStats.totalPlays)}</dd>
          </div>
          <div>
            <dt>Releases</dt>
            <dd>{artistStats.albumCount}</dd>
          </div>
          {profile.monthlyListenersDisplay &&
            profile.monthlyListenersDisplay !== '—' && (
              <div className="tk-artist-stats__wide">
                <dt>Listeners</dt>
                <dd>{profile.monthlyListenersDisplay}</dd>
              </div>
            )}
        </dl>

        {genres.length > 0 && (
          <div className="tk-artist-genres">
            {genres.map((g) => (
              <span key={g}>{g}</span>
            ))}
          </div>
        )}

        {profile.bio && (
          <p className="tk-panel__bio">
            {profile.bio.length > 160 ? `${profile.bio.slice(0, 160)}…` : profile.bio}
          </p>
        )}

        {socialEntries.length > 0 && (
          <div className="tk-social-row">
            {socialEntries.map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="tk-social-chip"
              >
                {SOCIAL_LABELS[key] ?? key}
              </a>
            ))}
          </div>
        )}

        <div className="tk-artist-cta">
          <Link to={`/artist/${profile.slug}`} className="tk-btn tk-btn--fill tk-artist-cta__main">
            View studio
          </Link>
          <button
            type="button"
            className={`tk-btn tk-btn--line${saved ? ' tk-btn--on' : ''}`}
            onClick={onToggleSave}
            aria-pressed={saved}
          >
            {saved ? 'Saved' : 'Save track'}
          </button>
        </div>
      </div>

      <div className="tk-panel tk-panel--support">
        <p className="tk-panel__kicker">Support the artist</p>
        <p className="tk-support-hint">
          Stream directly — every play helps the wire pick up this release.
        </p>

        <a
          href={streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tk-support-hero"
          onClick={onStreamClick}
        >
          <span className="tk-support-hero__icon" aria-hidden>
            <StreamBarsIcon />
          </span>
          <span className="tk-support-hero__copy">
            <span className="tk-support-hero__label">Open on {platformLabel}</span>
            <span className="tk-support-hero__sub">Full track · official link</span>
          </span>
          <span className="tk-support-hero__go" aria-hidden>
            ↗
          </span>
        </a>

        <div className="tk-support-actions">
          <button
            type="button"
            className={`tk-support-action${copied ? ' tk-support-action--ok' : ''}`}
            onClick={() => void copyLink()}
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button type="button" className="tk-support-action" onClick={() => void shareNative()}>
            Share
          </button>
          {profile.social.spotify && (
            <a
              href={profile.social.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="tk-support-action"
            >
              Artist Spotify
            </a>
          )}
        </div>
      </div>

      {sidebarTracks.length > 0 && (
        <div className="tk-panel tk-panel--tracks">
          <div className="tk-section-head">
            <h2>From this artist</h2>
            <Link to={`/artist/${profile.slug}#music`}>All tracks →</Link>
          </div>

          <ul className="tk-queue">
            {sidebarTracks.map((t, i) => {
              const isCurrent = t.id === currentTrack.id
              const plat = streamPlatform(t.streamUrl)
              return (
                <li key={t.id} className={isCurrent ? 'tk-queue__item--now' : undefined}>
                  <Link
                    to={trackDetailPath(profile.slug, t.id)}
                    className="tk-queue__item"
                    aria-current={isCurrent ? 'true' : undefined}
                  >
                    <span className="tk-queue__idx" aria-hidden>
                      {isCurrent ? (
                        <span className="tk-queue__eq" aria-hidden>
                          <span />
                          <span />
                          <span />
                        </span>
                      ) : (
                        String(i + 1).padStart(2, '0')
                      )}
                    </span>
                    {t.coverUrl ? (
                      <IOSImage
                        src={t.coverUrl}
                        alt=""
                        width={48}
                        className="tk-queue__thumb"
                      />
                    ) : (
                      <span className="tk-queue__thumb-fb" aria-hidden>
                        {t.title.slice(0, 1)}
                      </span>
                    )}
                    <span className="tk-queue__meta">
                      <span className="tk-queue__title">{t.title}</span>
                      <span className="tk-queue__sub">
                        {isCurrent ? (
                          <span className="tk-queue__now">Now on this page</span>
                        ) : (
                          <>
                            {formatPlayCount(t.playCount)} plays ·{' '}
                            {formatPremiereDate(t.createdAt)}
                          </>
                        )}
                      </span>
                    </span>
                    {!isCurrent && t.streamUrl && (
                      <button
                        type="button"
                        className="tk-queue__play"
                        aria-label={`Open ${t.title} on ${STREAM_PLATFORM_LABEL[plat]}`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(t.streamUrl, '_blank', 'noopener,noreferrer')
                        }}
                      >
                        ▶
                      </button>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </aside>
  )
}

function StreamBarsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 14V8M8 14V4M12 14V10M16 14V6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
