import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { ArtistStreamEmbed } from '@/components/artist-profile/ArtistStreamEmbed'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'
import { recordTrackClick } from '@/lib/analytics/artistAnalytics'
import { getStreamEmbed } from '@/lib/artist-profile/embed'
import {
  STREAM_PLATFORM_LABEL,
  streamPlatform,
} from '@/lib/artist-profile/streamPlatform'
import { catalogCardHref } from '@/lib/discovery/trackPaths'
import { fetchPublicTrackDetail, type PublicTrackDetail } from '@/lib/discovery/publicTrackDetail'
import {
  formatPlayCount,
  formatPremiereDate,
} from '@/lib/discovery/premieres'
import { useSeo } from '@/hooks/useSeo'
import { breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import '@/styles/track-detail.css'

const WAVE_HEIGHTS = [
  35, 55, 42, 70, 48, 62, 38, 75, 52, 68, 45, 80, 58, 40, 72, 50, 65, 44, 78, 56, 48, 62, 36, 70,
]

const SAVED_KEY = 'ios_saved_tracks'

function readSaved(): Set<string> {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveKey(artistSlug: string, trackId: string) {
  return `${artistSlug}:${trackId}`
}

function releaseTypeLabel(rt: 'album' | 'ep' | 'single') {
  if (rt === 'album') return 'Album'
  if (rt === 'ep') return 'EP'
  return 'Single'
}

export default function TrackDetailPage() {
  const { artistSlug, trackId } = useParams<{ artistSlug: string; trackId: string }>()
  const location = useLocation()
  const { user } = useAuth()
  const [detail, setDetail] = useState<PublicTrackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    if (!artistSlug || !trackId) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(true)
    const data = await fetchPublicTrackDetail(artistSlug, trackId)
    if (!data) {
      setNotFound(true)
      setDetail(null)
    } else {
      setDetail(data)
      setNotFound(false)
      setSaved(readSaved().has(saveKey(artistSlug, trackId)))
    }
    setLoading(false)
  }, [artistSlug, trackId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (location.hash === '#play' && detail) {
      setPlayerOpen(true)
    }
  }, [location.hash, detail])

  const seo = useMemo(() => {
    if (!detail || !artistSlug || !trackId) return null
    const { track, profile } = detail
    const path = `/track/${artistSlug}/${trackId}`
    return {
      title: `${track.title} — ${profile.displayName}`,
      description: profile.tagline ?? profile.bio?.slice(0, 140) ?? `${track.title} on Institute of Sound.`,
      canonicalPath: path,
      ogImage: track.coverUrl ?? profile.avatarUrl,
      jsonLd: breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Releases', path: '/releases' },
        { name: profile.displayName, path: `/artist/${profile.slug}` },
        { name: track.title, path },
      ]),
    }
  }, [detail, artistSlug, trackId])

  useSeo(seo)

  const toggleSave = () => {
    if (!artistSlug || !trackId) return
    const key = saveKey(artistSlug, trackId)
    const next = readSaved()
    if (next.has(key)) next.delete(key)
    else next.add(key)
    localStorage.setItem(SAVED_KEY, JSON.stringify([...next]))
    setSaved(next.has(key))
  }

  const logPlay = () => {
    if (!detail) return
    void recordTrackClick(detail.profile.id, detail.track.id, {
      viewerUserId: user?.id,
      ownerUserId: detail.profile.userId,
      published: detail.profile.published,
    })
  }

  const togglePlayer = () => {
    if (!detail) return
    const embed = getStreamEmbed(detail.track.streamUrl, detail.track.title)
    if (embed) {
      if (!playerOpen) logPlay()
      setPlayerOpen((v) => !v)
      return
    }
    logPlay()
    window.open(detail.track.streamUrl, '_blank', 'noopener,noreferrer')
  }

  if (loading) return <LoadingTransmission variant="hell" />

  if (notFound || !detail || !artistSlug || !trackId) {
    return (
      <div className="tk-page section-padding pt-28 text-center">
        <p className="font-display text-xl text-crimson">Track not found</p>
        <Link to="/releases" className="mt-4 inline-block text-sm text-neon">
          ← All releases
        </Link>
      </div>
    )
  }

  const { track, profile, album, releaseType, moreFromArtist, moreReleases } = detail
  const embed = getStreamEmbed(track.streamUrl, track.title)
  const platform = streamPlatform(track.streamUrl)
  const cover = track.coverUrl ?? album?.coverUrl ?? profile.avatarUrl
  const genres = profile.genres.filter(Boolean)
  const catalogRef = album?.title
    ? `${profile.slug.toUpperCase().slice(0, 3)} · ${album.title.slice(0, 12).toUpperCase()}`
    : `${profile.slug.toUpperCase().slice(0, 4)}${track.id.slice(-4).toUpperCase()}`

  return (
    <div className="tk-page discover-wire">
      <nav className="tk-page__crumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden> / </span>
        <Link to="/releases">Releases</Link>
        <span aria-hidden> / </span>
        <Link to={`/artist/${profile.slug}`}>{profile.displayName}</Link>
        <span aria-hidden> / </span>
        <span className="text-signal">{track.title}</span>
      </nav>

      <div className="tk-page__layout">
        <main>
          <div className="tk-hero">
            {cover ? (
              <IOSImage
                src={cover}
                alt=""
                width={560}
                className="tk-hero__cover"
                priority
              />
            ) : (
              <div className="tk-hero__cover-fb" aria-hidden>
                {track.title.slice(0, 1)}
              </div>
            )}

            <div>
              <p className="tk-hero__kicker">{releaseTypeLabel(releaseType)}</p>
              <h1 className="tk-hero__title">{track.title}</h1>
              <p className="tk-hero__artist">{profile.displayName}</p>

              <div className="tk-hero__meta-row">
                <Link to={`/artist/${profile.slug}`}>
                  {profile.avatarUrl ? (
                    <IOSImage
                      src={profile.avatarUrl}
                      alt=""
                      width={32}
                      className="tk-hero__meta-avatar"
                    />
                  ) : (
                    <span className="tk-hero__meta-avatar-fb" aria-hidden>
                      {profile.displayName.slice(0, 1)}
                    </span>
                  )}
                  {profile.displayName}
                </Link>
                <span aria-hidden>·</span>
                <span>{catalogRef}</span>
                <span aria-hidden>·</span>
                <span>{formatPremiereDate(track.createdAt)}</span>
              </div>

              <div className="tk-hero__actions">
                <button
                  type="button"
                  className="tk-btn tk-btn--fill"
                  onClick={togglePlayer}
                >
                  ▶ Play track
                </button>
                <button
                  type="button"
                  className={`tk-btn tk-btn--line${saved ? ' tk-btn--on' : ''}`}
                  onClick={toggleSave}
                >
                  {saved ? '✓ Saved' : 'Save'}
                </button>
                <button
                  type="button"
                  className="tk-btn tk-btn--line tk-btn--icon"
                  aria-label="Share track"
                  onClick={() => void navigator.clipboard?.writeText(window.location.href)}
                >
                  ···
                </button>
              </div>

              <div
                className={`tk-player${playerOpen ? ' tk-player--active' : ''}`}
                id="play"
              >
                <button
                  type="button"
                  className={`tk-player__play${playerOpen ? ' tk-player__play--on' : ''}`}
                  onClick={togglePlayer}
                  aria-expanded={Boolean(embed && playerOpen)}
                  aria-label={playerOpen ? 'Close player' : 'Play track'}
                >
                  {playerOpen ? '✕' : '▶'}
                </button>
                <div className="tk-player__wave" aria-hidden>
                  {WAVE_HEIGHTS.map((h, i) => (
                    <span
                      key={i}
                      className="tk-player__bar"
                      style={{ height: `${playerOpen ? h : Math.max(28, h * 0.55)}%` }}
                    />
                  ))}
                </div>
                <span className="tk-player__dur">
                  {STREAM_PLATFORM_LABEL[platform]}
                </span>
              </div>

              <AnimatePresence initial={false}>
                {playerOpen && embed && (
                  <motion.div
                    className="tk-embed-wrap"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <ArtistStreamEmbed
                      streamUrl={track.streamUrl}
                      title={track.title}
                      variant="inline"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="tk-tags">
                {genres.slice(0, 3).map((g) => (
                  <span key={g}>{g}</span>
                ))}
                <span>{releaseTypeLabel(releaseType)}</span>
                <span>{formatPlayCount(track.playCount)} plays</span>
              </div>

              {(profile.tagline || profile.bio) && (
                <p className="tk-dek">
                  {profile.tagline ?? profile.bio?.slice(0, 320)}
                  {profile.bio && !profile.tagline && profile.bio.length > 320 ? '…' : ''}
                </p>
              )}

              <div className="tk-meta-grid" role="group" aria-label="Release details">
                <div className="tk-meta-grid__cell">
                  <span className="tk-meta-grid__label">Release date</span>
                  <span className="tk-meta-grid__value">
                    {formatPremiereDate(track.createdAt)}
                  </span>
                </div>
                <div className="tk-meta-grid__cell">
                  <span className="tk-meta-grid__label">Length</span>
                  <span className="tk-meta-grid__value">—</span>
                </div>
                <div className="tk-meta-grid__cell">
                  <span className="tk-meta-grid__label">Plays</span>
                  <span className="tk-meta-grid__value">
                    {formatPlayCount(track.playCount)}
                  </span>
                </div>
                <div className="tk-meta-grid__cell">
                  <span className="tk-meta-grid__label">Catalog</span>
                  <span className="tk-meta-grid__value">{catalogRef}</span>
                </div>
                <div className="tk-meta-grid__cell">
                  <span className="tk-meta-grid__label">Stream</span>
                  <span className="tk-meta-grid__value">
                    {STREAM_PLATFORM_LABEL[platform]}
                  </span>
                </div>
                {album && (
                  <>
                    <div className="tk-meta-grid__cell">
                      <span className="tk-meta-grid__label">Release</span>
                      <span className="tk-meta-grid__value">{album.title}</span>
                    </div>
                    <div className="tk-meta-grid__cell">
                      <span className="tk-meta-grid__label">Year</span>
                      <span className="tk-meta-grid__value">
                        {album.releaseYear ?? '—'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {moreReleases.length > 0 && (
            <section aria-labelledby="tk-more-heading">
              <div className="tk-section-head">
                <h2 id="tk-more-heading">More releases</h2>
                <Link to="/releases">View all →</Link>
              </div>
              <div className="tk-more-grid">
                {moreReleases.map((card) => (
                  <Link
                    key={card.trackId}
                    to={catalogCardHref(card)}
                    className="tk-more-card"
                  >
                    {card.coverUrl ? (
                      <IOSImage
                        src={card.coverUrl}
                        alt=""
                        width={200}
                        className="tk-more-card__cover"
                      />
                    ) : (
                      <div
                        className="tk-more-card__cover tk-hero__cover-fb"
                        style={{ fontSize: '1.25rem' }}
                        aria-hidden
                      >
                        {card.trackTitle.slice(0, 1)}
                      </div>
                    )}
                    <span className="tk-more-card__title">{card.trackTitle}</span>
                    <span className="tk-more-card__sub">
                      {releaseTypeLabel(card.releaseType)} · {card.artistName}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="tk-aside">
          <div className="tk-panel">
            <p className="tk-panel__kicker">Artist</p>
            <div className="tk-artist-row">
              {profile.avatarUrl ? (
                <IOSImage
                  src={profile.avatarUrl}
                  alt=""
                  width={56}
                  className="tk-artist-row__avatar"
                />
              ) : (
                <span className="tk-artist-row__avatar-fb" aria-hidden>
                  {profile.displayName.slice(0, 1)}
                </span>
              )}
              <div>
                <p className="tk-artist-row__name">{profile.displayName}</p>
                {profile.country && (
                  <p className="tk-artist-row__loc">{profile.country}</p>
                )}
                <Link
                  to={`/artist/${profile.slug}`}
                  className="tk-btn tk-btn--line tk-artist-row__follow"
                >
                  Follow
                </Link>
              </div>
            </div>
            {profile.bio && (
              <p className="tk-panel__bio">
                {profile.bio.length > 200 ? `${profile.bio.slice(0, 200)}…` : profile.bio}
              </p>
            )}
            <Link to={`/artist/${profile.slug}`} className="tk-panel__link">
              View artist profile →
            </Link>
          </div>

          <div className="tk-panel">
            <p className="tk-panel__kicker">Support the artist</p>
            <div className="tk-support">
              <a
                href={track.streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tk-support__btn"
                onClick={logPlay}
              >
                <span aria-hidden>🛒</span>
                Stream
              </a>
              {profile.social.spotify && (
                <a
                  href={profile.social.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tk-support__btn"
                >
                  <span aria-hidden>🎧</span>
                  Spotify
                </a>
              )}
              <button
                type="button"
                className="tk-support__btn"
                onClick={() => void navigator.clipboard?.writeText(window.location.href)}
              >
                <span aria-hidden>↗</span>
                Share
              </button>
            </div>
          </div>

          {moreFromArtist.length > 0 && (
            <div className="tk-panel">
              <div className="tk-section-head" style={{ margin: '0 0 0.75rem' }}>
                <h2 style={{ fontSize: '0.5rem' }}>More from this artist</h2>
                <Link to={`/artist/${profile.slug}`}>View all →</Link>
              </div>
              <ul className="tk-track-list">
                {moreFromArtist.map((t) => (
                  <li key={t.id}>
                    <Link
                      to={`/track/${profile.slug}/${t.id}`}
                      className="tk-track-list__item"
                    >
                      {t.coverUrl ? (
                        <IOSImage
                          src={t.coverUrl}
                          alt=""
                          width={48}
                          className="tk-track-list__thumb"
                        />
                      ) : (
                        <span className="tk-track-list__thumb-fb" aria-hidden>
                          {t.title.slice(0, 1)}
                        </span>
                      )}
                      <span>
                        <span className="tk-track-list__title">{t.title}</span>
                        <span className="tk-track-list__sub block">
                          {releaseTypeLabel(releaseType)} ·{' '}
                          {t.createdAt ? new Date(t.createdAt).getFullYear() : '—'}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
