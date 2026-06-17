import { useCallback, useEffect, useMemo, useState } from 'react'
import { Compass, Home, Play } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ReleaseAside } from '@/modules/explore/components/release-aside'
import { ReleaseRelatedRail } from '@/modules/explore/components/release-related-rail'
import { ReleaseOptionsMenu } from '@/modules/explore/components/release-options-menu'
import { ReleasePlayerBar } from '@/modules/explore/components/release-player-bar'
import { ReleaseVinylArt } from '@/modules/explore/components/release-vinyl-art'
import { useExplore } from '@/modules/explore/hooks/use-explore'
import {
  findArtistForRelease,
  releaseBio,
  releaseCatalogRef,
  releaseDateLabel,
  releaseDurationLabel,
  releaseGenreLabel,
  releasePlaysFormatted,
  releaseStreamPlatform,
  releaseTrackCount,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'
import { artistInitials } from '@/modules/explore/lib/artist-meta'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { Loader } from '@/shared/components/feedback/loader'
import { useBreadcrumbHomeHref } from '@/shared/hooks/use-breadcrumb-home'
import '@/modules/explore/styles/explore.css'

const SAVED_KEY = 'ios_saved_releases'

function readSaved(): Set<string> {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

export function ReleasePage() {
  const { id = '' } = useParams()
  const homeHref = useBreadcrumbHomeHref()
  const { data: explore, isLoading } = useExplore()
  const playTrack = usePlayerStore((s) => s.playTrack)
  const [saved, setSaved] = useState(false)

  const release = useMemo(
    () => explore?.releases.find((item) => item.id === id),
    [explore?.releases, id],
  )

  const artist = useMemo(
    () => (release && explore ? findArtistForRelease(release, explore.artists) : undefined),
    [release, explore],
  )

  const artistReleases = useMemo(() => {
    if (!release || !explore) return []
    return explore.releases.filter(
      (item) =>
        item.id !== release.id &&
        (item.artistProfileId === release.artistProfileId ||
          (item.artistName &&
            release.artistName &&
            item.artistName.trim().toLowerCase() === release.artistName.trim().toLowerCase())),
    )
  }, [release, explore])

  const otherReleases = useMemo(() => {
    if (!release || !explore) return []
    return explore.releases
      .filter(
        (item) =>
          item.id !== release.id &&
          item.artistProfileId !== release.artistProfileId &&
          item.artistName?.trim().toLowerCase() !== release.artistName?.trim().toLowerCase(),
      )
      .slice(0, 6)
  }, [release, explore])

  useEffect(() => {
    if (id) setSaved(readSaved().has(id))
  }, [id])

  const toggleSave = useCallback(() => {
    if (!id) return
    const next = readSaved()
    if (next.has(id)) next.delete(id)
    else next.add(id)
    localStorage.setItem(SAVED_KEY, JSON.stringify([...next]))
    setSaved(next.has(id))
  }, [id])

  const handlePlay = useCallback(() => {
    if (!release?.streamUrl) return
    playTrack({
      id: release.id,
      title: release.title,
      artist: release.artistName ?? 'Unknown',
      audioUrl: release.streamUrl,
      artworkUrl: release.coverUrl,
    })
  }, [playTrack, release])

  if (isLoading) return <Loader className="min-h-screen bg-background" />

  if (!release) {
    return (
      <div className="explore-page flex min-h-screen flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Release not found.</p>
        <Link to="/explore#explore-releases" className="explore-accent-text text-sm underline">
          Back to Explore
        </Link>
      </div>
    )
  }

  const platform = releaseStreamPlatform(release.streamUrl)
  const genres = artist?.genres.filter(Boolean) ?? []
  const catalogRef = releaseCatalogRef(release)

  return (
    <div className="explore-release-page">
      <div className="explore-release-page__top">
        <AppBreadcrumb
          items={[
            { label: 'Home', href: homeHref, icon: Home },
            { label: 'Explore', href: '/explore', icon: Compass },
            { label: 'Releases', href: '/explore#explore-releases' },
            ...(release.artistName ? [{ label: release.artistName.toUpperCase() }] : []),
            { label: release.title.toUpperCase() },
          ]}
        />
      </div>

      <div className="explore-release-page__layout">
        <main className="explore-release-page__main">
          <section className="explore-release-hero">
            <div className="explore-release-hero__art">
              <ReleaseVinylArt release={release} variant="hero" />
            </div>

            <div className="explore-release-hero__body">
              <span className="explore-release-hero__tag">{releaseTypeLabel(release.type)}</span>
              <h1 className="explore-release-hero__title">{release.title}</h1>
              {release.artistName ? (
                <p className="explore-release-hero__artist">{release.artistName}</p>
              ) : null}

              <div className="explore-release-hero__meta-row">
                {artist ? (
                  <Link to={`/profile/${artist.userId}`} className="explore-release-hero__meta-link">
                    {artist.avatarUrl ? (
                      <img src={artist.avatarUrl} alt="" className="explore-release-hero__meta-avatar" />
                    ) : (
                      <span className="explore-release-hero__meta-avatar-fb" aria-hidden>
                        {artistInitials(artist.displayName)}
                      </span>
                    )}
                    {artist.displayName}
                  </Link>
                ) : release.artistName ? (
                  <span>{release.artistName}</span>
                ) : null}
                <span className="explore-release-hero__meta-dot" aria-hidden>
                  ·
                </span>
                <span>{catalogRef}</span>
                <span className="explore-release-hero__meta-dot" aria-hidden>
                  ·
                </span>
                <span>{releaseDateLabel(release)}</span>
              </div>

              <div className="explore-release-hero__actions">
                <button
                  type="button"
                  className="explore-release-hero__btn explore-release-hero__btn--fill"
                  onClick={handlePlay}
                  disabled={!release.streamUrl}
                >
                  <Play size={12} strokeWidth={2} fill="currentColor" aria-hidden />
                  Play track
                </button>
                <button
                  type="button"
                  className={`explore-release-hero__btn explore-release-hero__btn--line${saved ? ' is-active' : ''}`}
                  onClick={toggleSave}
                >
                  {saved ? 'Saved' : 'Save'}
                </button>
                <ReleaseOptionsMenu release={release} artist={artist} />
              </div>

              <ReleasePlayerBar release={release} />

              <div className="explore-release-hero__about">
                <div className="explore-release-hero__tags">
                  {genres.slice(0, 2).map((genre) => (
                    <span key={genre}>{genre.toUpperCase()}</span>
                  ))}
                  {genres.length === 0 ? <span>{releaseGenreLabel(release)}</span> : null}
                  <span>{releaseTypeLabel(release.type)}</span>
                  {releasePlaysFormatted(release) ? (
                    <span className="explore-release-hero__tags-hot">
                      {releasePlaysFormatted(release)} plays
                    </span>
                  ) : null}
                </div>

                <p className="explore-release-hero__dek">
                  {artist?.bio?.slice(0, 140) ?? releaseBio(release)}
                </p>
              </div>

              <div className="explore-release-meta-shell">
                <p className="explore-release-meta-shell__label">Release details</p>
                <dl className="explore-release-meta-grid" aria-label="Release details">
                <div className="explore-release-meta-grid__cell">
                  <dt>Release date</dt>
                  <dd>{releaseDateLabel(release)}</dd>
                </div>
                <div className="explore-release-meta-grid__cell">
                  <dt>Length</dt>
                  <dd>{releaseDurationLabel(release)}</dd>
                </div>
                <div className="explore-release-meta-grid__cell explore-release-meta-grid__cell--accent">
                  <dt>Plays</dt>
                  <dd>{releasePlaysFormatted(release) ?? '—'}</dd>
                </div>
                <div className="explore-release-meta-grid__cell">
                  <dt>Catalog</dt>
                  <dd>{catalogRef}</dd>
                </div>
                <div className="explore-release-meta-grid__cell">
                  <dt>Stream</dt>
                  <dd>{platform}</dd>
                </div>
                <div className="explore-release-meta-grid__cell">
                  <dt>Tracks</dt>
                  <dd>{releaseTrackCount(release)}</dd>
                </div>
              </dl>
              </div>
            </div>
          </section>

          <ReleaseRelatedRail
            id="explore-release-more"
            title="More from this artist"
            viewAllHref={artist ? `/profile/${artist.userId}` : '/explore#explore-releases'}
            releases={artistReleases.slice(0, 5)}
          />

          <ReleaseRelatedRail
            id="explore-release-other"
            title="Other artists on the wire"
            viewAllHref="/explore#explore-releases"
            releases={otherReleases}
          />
        </main>

        <ReleaseAside
          release={release}
          artist={artist}
          artistReleases={[release, ...artistReleases]}
          allReleases={explore?.releases ?? []}
          saved={saved}
          onToggleSave={toggleSave}
        />
      </div>
    </div>
  )
}
