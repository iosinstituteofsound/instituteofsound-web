import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Compass, Home } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ReleaseAnalyticsPanel } from '@/modules/explore/components/release-analytics-panel'
import { ReleaseAside } from '@/modules/explore/components/release-aside'
import { ReleaseRelatedRail } from '@/modules/explore/components/release-related-rail'
import { ReleaseHeroDescription } from '@/modules/explore/components/release-hero-description'
import { ReleaseHeroEngagement, OPTIONS_TRIGGER_CLASS } from '@/modules/explore/components/release-hero-engagement'
import { ReleaseHeroPlayArt } from '@/modules/explore/components/release-hero-play-art'
import { ReleaseOptionsMenu } from '@/modules/explore/components/release-options-menu'
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
import { CenteredPageState } from '@/shared/components/feedback/centered-page-state'
import { Loader } from '@/shared/components/feedback/loader'
import { useBreadcrumbHomeHref } from '@/shared/hooks/use-breadcrumb-home'
import { getReleaseDetail } from '@/modules/music/api/music.api'
import { playReleaseFromDetail } from '@/modules/music/lib/player-queue'
import { playReleaseHero } from '@/modules/explore/lib/release-playback'
import { trackPagePath } from '@/modules/explore/lib/track-paths'
import { ReleaseTrackList } from '@/modules/explore/components/release-track-list'
import '@/modules/explore/styles/explore.css'
import '@/modules/explore/styles/explore-mh-chrome.css'
import '@/modules/explore/styles/release-vinyl-art.css'
import '@/modules/explore/styles/release-related-rail.css'
import '@/modules/explore/styles/release-analytics.css'
import '@/modules/explore/styles/release-hero-play-art.css'
import '@/modules/explore/styles/release-page-mh.css'
import '@/modules/explore/styles/release-page-mobile.css'

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
  const { data: releaseDetail, isLoading: releaseDetailLoading } = useQuery({
    queryKey: ['release-detail', id],
    queryFn: () => getReleaseDetail(id),
    enabled: Boolean(id),
    retry: false,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
  const playTrack = usePlayerStore((s) => s.playTrack)
  const togglePlay = usePlayerStore((s) => s.togglePlay)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const [saved, setSaved] = useState(false)

  const release = useMemo(() => {
    const fromExplore = explore?.releases.find((item) => item.id === id || item.slug === id)
    const detailDurationSec = releaseDetail?.tracks.reduce(
      (sum, track) => sum + (track.durationSec ?? 0),
      0,
    )
    const detailTrackCount = releaseDetail?.tracks.length ?? 0

    if (fromExplore) {
      return {
        ...fromExplore,
        durationSec:
          detailDurationSec && detailDurationSec > 0
            ? detailDurationSec
            : fromExplore.durationSec,
        trackCount:
          detailTrackCount > 0 ? detailTrackCount : fromExplore.trackCount,
      }
    }
    if (releaseDetail) {
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
        trackCount: detailTrackCount > 0 ? detailTrackCount : undefined,
      }
    }
    return undefined
  }, [explore?.releases, id, releaseDetail])

  const detailTracks = releaseDetail?.tracks ?? []

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
    if (!release) return
    playReleaseHero(release, releaseDetail, playTrack, togglePlay, currentTrack, isPlaying, {
      playAll: detailTracks.length > 1,
    })
  }, [
    playTrack,
    togglePlay,
    currentTrack,
    isPlaying,
    release,
    releaseDetail,
    detailTracks.length,
  ])

  const handlePlayTrack = useCallback(
    (index: number) => {
      if (!releaseDetail) return
      playReleaseFromDetail(releaseDetail, playTrack, { startIndex: index })
    },
    [playTrack, releaseDetail],
  )

  if (isLoading || releaseDetailLoading) return <Loader className="min-h-screen bg-background" />

  if (
    releaseDetail?.type === 'single' &&
    releaseDetail.tracks.length === 1 &&
    releaseDetail.tracks[0]?.id
  ) {
    return <Navigate to={trackPagePath(releaseDetail.tracks[0].id)} replace />
  }

  if (!release) {
    return (
      <CenteredPageState
        message="Release not found."
        pageClassName="explore-page"
        action={
          <Link to="/releases" className="explore-accent-text text-sm underline">
            Back to Releases
          </Link>
        }
      />
    )
  }

  const platform = releaseStreamPlatform(release.streamUrl)
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
            ...(release.artistName ? [{ label: release.artistName.toUpperCase() }] : []),
            { label: release.title.toUpperCase() },
          ]}
        />
      </div>

      <div className="explore-release-page__layout">
        <main className="explore-release-page__main">
          <section className="explore-release-hero explore-release-hero--mh">
            <div className="explore-release-hero__art">
              <ReleaseHeroPlayArt
                release={release}
                releaseId={releaseDetail?.id ?? release.id}
                onPlay={handlePlay}
                playLabel={detailTracks.length > 1 ? 'Play all' : 'Play track'}
              />
            </div>

            <div className="explore-release-hero__body">
              <span className="explore-release-hero__tag ios-mh-kicker">
                {releaseTypeLabel(release.type)}
              </span>
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

              <div className="explore-release-hero__actions explore-release-hero__actions--social">
                <ReleaseHeroEngagement
                  releaseId={release.id}
                  releaseTitle={release.title}
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

              {releaseDetail && detailTracks.length > 0 ? (
                <ReleaseTrackList
                  tracks={detailTracks}
                  releaseDetail={releaseDetail}
                  onPlayTrack={handlePlayTrack}
                />
              ) : null}

              <div className="explore-release-hero__about">
                <div className="explore-release-hero__tags">
                  {genres.slice(0, 2).map((genre) => (
                    <span key={genre} className="ios-mh-tag">{genre.toUpperCase()}</span>
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

                <p className="explore-release-hero__dek">
                  {artist?.bio?.slice(0, 140) ?? releaseBio(release)}
                </p>
              </div>

              <div className="explore-release-meta-shell">
                <p className="explore-release-meta-shell__label ios-mh-kicker">Release details</p>
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

          {releaseDetail?.status === 'published' ? (
            <ReleaseAnalyticsPanel
              releaseId={releaseDetail.id}
              primaryTrackId={detailTracks[0]?.id}
            />
          ) : null}

          <ReleaseRelatedRail
            id="explore-release-more"
            title="More from this artist"
            moduleId="RL·01"
            viewAllHref={artist ? `/profile/${artist.userId}` : '/releases'}
            releases={artistReleases.slice(0, 5)}
          />

          <ReleaseRelatedRail
            id="explore-release-other"
            title="Other artists on the wire"
            moduleId="RL·02"
            viewAllHref="/releases"
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
