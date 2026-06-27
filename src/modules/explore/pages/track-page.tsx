import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Compass, Home } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ReleaseAside } from '@/modules/explore/components/release-aside'
import { ReleaseHeroDescription } from '@/modules/explore/components/release-hero-description'
import { ReleaseHeroEngagement, OPTIONS_TRIGGER_CLASS } from '@/modules/explore/components/release-hero-engagement'
import { ReleaseHeroPlayArt } from '@/modules/explore/components/release-hero-play-art'
import { ReleaseOptionsMenu } from '@/modules/explore/components/release-options-menu'
import { ReleaseRelatedRail } from '@/modules/explore/components/release-related-rail'
import { ReleaseTrackList } from '@/modules/explore/components/release-track-list'
import { DuplicateTrackAlert } from '@/modules/music/components/duplicate-track-alert'
import { useExplore } from '@/modules/explore/hooks/use-explore'
import {
  findArtistForRelease,
  releaseCatalogRef,
  releaseDateLabel,
  releaseGenreLabel,
  releasePlaysFormatted,
  releaseStreamPlatform,
  releaseTypeLabel,
} from '@/modules/explore/lib/release-meta'
import { artistInitials } from '@/modules/explore/lib/artist-meta'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { CenteredPageState } from '@/shared/components/feedback/centered-page-state'
import { Loader } from '@/shared/components/feedback/loader'
import { useBreadcrumbHomeHref } from '@/shared/hooks/use-breadcrumb-home'
import { getReleaseDetail, getTrackReleaseRedirect } from '@/modules/music/api/music.api'
import { formatTrackDuration } from '@/modules/music/lib/playlist-detail-format'
import { playReleaseFromDetail } from '@/modules/music/lib/player-queue'
import { playReleaseHero } from '@/modules/explore/lib/release-playback'
import { usePlayerStore } from '@/modules/player/stores/player-store'
import '@/modules/explore/styles/explore.css'
import '@/modules/explore/styles/explore-mh-chrome.css'
import '@/modules/explore/styles/release-vinyl-art.css'
import '@/modules/explore/styles/release-related-rail.css'
import '@/modules/explore/styles/release-hero-play-art.css'
import '@/modules/explore/styles/release-page-mh.css'
import '@/modules/explore/styles/release-page-mobile.css'

export function TrackPage() {
  const { trackId = '' } = useParams()
  const homeHref = useBreadcrumbHomeHref()
  const playTrack = usePlayerStore((s) => s.playTrack)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const { data: explore, isLoading: exploreLoading } = useExplore()

  const { data: redirect, isLoading: redirectLoading, isError: redirectError } = useQuery({
    queryKey: ['track-release-redirect', trackId],
    queryFn: () => getTrackReleaseRedirect(trackId),
    enabled: Boolean(trackId),
    retry: false,
  })

  const releaseId = redirect?.releaseId ?? ''
  const { data: releaseDetail, isLoading: releaseLoading } = useQuery({
    queryKey: ['release-detail', releaseId],
    queryFn: () => getReleaseDetail(releaseId),
    enabled: Boolean(releaseId),
    retry: false,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })

  const track = useMemo(
    () => releaseDetail?.tracks.find((item) => item.id === trackId),
    [releaseDetail?.tracks, trackId],
  )

  const release = useMemo(() => {
    if (!releaseDetail) return undefined
    const fromExplore = explore?.releases.find(
      (item) => item.id === releaseDetail.id || item.slug === releaseDetail.id,
    )
    const detailDurationSec = releaseDetail.tracks.reduce(
      (sum, item) => sum + (item.durationSec ?? 0),
      0,
    )

    if (fromExplore) {
      return {
        ...fromExplore,
        durationSec:
          detailDurationSec && detailDurationSec > 0
            ? detailDurationSec
            : fromExplore.durationSec,
        trackCount: releaseDetail.tracks.length || fromExplore.trackCount,
      }
    }

    return {
      id: releaseDetail.id,
      artistProfileId: releaseDetail.artistProfileId,
      title: releaseDetail.title,
      coverUrl: releaseDetail.coverUrl,
      artistName: releaseDetail.artistName,
      streamUrl: releaseDetail.streamUrl,
      type: releaseDetail.type,
      genre: releaseDetail.genre,
      playCount: releaseDetail.playCount,
      releaseDate: releaseDetail.releaseDate,
      isFeatured: releaseDetail.isFeatured,
      durationSec: detailDurationSec && detailDurationSec > 0 ? detailDurationSec : undefined,
      trackCount: releaseDetail.tracks.length || undefined,
    }
  }, [explore?.releases, releaseDetail])

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

  const handlePlay = useCallback(() => {
    if (!release) return
    playReleaseHero(release, releaseDetail, playTrack, togglePlay, currentTrack, isPlaying, {
      trackId: track?.id,
    })
  }, [playTrack, togglePlay, currentTrack, isPlaying, release, releaseDetail, track?.id])

  const handlePlayTrack = useCallback(
    (index: number) => {
      if (!releaseDetail) return
      playReleaseFromDetail(releaseDetail, playTrack, { startIndex: index })
    },
    [playTrack, releaseDetail],
  )

  if (redirectLoading || releaseLoading || exploreLoading) {
    return <Loader className="min-h-screen bg-background" />
  }

  if (redirectError || !releaseDetail || !track || !release) {
    return (
      <CenteredPageState
        message="Track not found."
        pageClassName="explore-page"
        action={
          <Link to="/releases" className="explore-accent-text text-sm underline">
            Back to Releases
          </Link>
        }
      />
    )
  }

  const platform = releaseStreamPlatform(track.audioUrl ?? release.streamUrl)
  const genres = artist?.genres.filter(Boolean) ?? []
  const catalogRef = releaseCatalogRef(release)

  return (
    <div className="explore-release-page explore-release-page--mh">
      <div className="explore-release-page__top">
        <AppBreadcrumb
          items={[
            { label: 'Home', href: homeHref, icon: Home },
            { label: 'Explore', href: '/explore', icon: Compass },
            { label: 'Releases', href: '/releases' },
            { label: release.title.toUpperCase(), href: `/releases/${release.id}` },
            { label: track.title.toUpperCase() },
          ]}
        />
      </div>

      <div className="explore-release-page__layout">
        <main className="explore-release-page__main">
          <section className="explore-release-hero explore-release-hero--mh">
            <div className="explore-release-hero__art">
              <ReleaseHeroPlayArt
                release={release}
                releaseId={releaseDetail.id}
                trackId={track.id}
                onPlay={handlePlay}
                playLabel="Play track"
              />
            </div>

            <div className="explore-release-hero__body">
              <span className="explore-release-hero__tag ios-mh-kicker">Track</span>
              <h1 className="explore-release-hero__title">{track.title}</h1>
              {track.duplicateInfo?.isDuplicate ? (
                <DuplicateTrackAlert duplicateInfo={track.duplicateInfo} variant="banner" className="mt-4" />
              ) : null}
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
                <Link to={`/releases/${release.id}`} className="explore-release-hero__meta-link">
                  {release.title}
                </Link>
                <span className="explore-release-hero__meta-dot" aria-hidden>
                  ·
                </span>
                <span>{releaseTypeLabel(release.type)}</span>
              </div>

              <div className="explore-release-hero__actions explore-release-hero__actions--social">
                <ReleaseHeroEngagement
                  releaseId={release.id}
                  releaseTitle={track.title}
                  menu={
                    <ReleaseOptionsMenu
                      release={release}
                      artist={artist}
                      triggerClassName={OPTIONS_TRIGGER_CLASS}
                    />
                  }
                />
              </div>

              <ReleaseHeroDescription
                description={releaseDetail?.description}
                releaseArtistProfileId={releaseDetail?.artistProfileId}
              />

              {releaseDetail.tracks.length > 1 ? (
                <>
                  <p className="ios-mh-kicker mt-6">From this release</p>
                  <ReleaseTrackList
                    tracks={releaseDetail.tracks}
                    releaseDetail={releaseDetail}
                    currentTrackId={track.id}
                    onPlayTrack={handlePlayTrack}
                  />
                </>
              ) : null}

              <div className="explore-release-hero__about">
                <div className="explore-release-hero__tags">
                  {genres.slice(0, 2).map((genre) => (
                    <span key={genre} className="ios-mh-tag">
                      {genre.toUpperCase()}
                    </span>
                  ))}
                  {genres.length === 0 ? (
                    <span className="ios-mh-tag">{releaseGenreLabel(release)}</span>
                  ) : null}
                  <span className="ios-mh-tag">{releaseTypeLabel(release.type)}</span>
                  {releasePlaysFormatted(release) ? (
                    <span className="ios-mh-tag explore-release-hero__tags-hot">
                      {releasePlaysFormatted(release)} plays
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="explore-release-meta-shell">
                <p className="explore-release-meta-shell__label ios-mh-kicker">Track details</p>
                <dl className="explore-release-meta-grid" aria-label="Track details">
                  <div className="explore-release-meta-grid__cell">
                    <dt>Release</dt>
                    <dd>
                      <Link to={`/releases/${release.id}`} className="explore-release-hero__meta-link">
                        {release.title}
                      </Link>
                    </dd>
                  </div>
                  <div className="explore-release-meta-grid__cell">
                    <dt>Release date</dt>
                    <dd>{releaseDateLabel(release)}</dd>
                  </div>
                  <div className="explore-release-meta-grid__cell">
                    <dt>Track number</dt>
                    <dd>{track.trackNumber}</dd>
                  </div>
                  <div className="explore-release-meta-grid__cell">
                    <dt>Length</dt>
                    <dd>{formatTrackDuration(track.durationSec) || '—'}</dd>
                  </div>
                  <div className="explore-release-meta-grid__cell">
                    <dt>Catalog</dt>
                    <dd>{catalogRef}</dd>
                  </div>
                  <div className="explore-release-meta-grid__cell">
                    <dt>Stream</dt>
                    <dd>{platform}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <ReleaseRelatedRail
            id="explore-track-more"
            title="More from this artist"
            moduleId="TK·01"
            viewAllHref={artist ? `/profile/${artist.userId}` : '/releases'}
            releases={artistReleases.slice(0, 5)}
          />

          <ReleaseRelatedRail
            id="explore-track-other"
            title="Other artists on the wire"
            moduleId="TK·02"
            viewAllHref="/releases"
            releases={otherReleases}
          />
        </main>

        <ReleaseAside
          release={release}
          artist={artist}
          artistReleases={[release, ...artistReleases]}
          allReleases={explore?.releases ?? []}
          saved={false}
          onToggleSave={() => undefined}
        />
      </div>
    </div>
  )
}
