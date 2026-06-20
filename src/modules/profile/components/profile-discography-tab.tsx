import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { UserDto } from '@/shared/types/auth.types'
import { DiscographyAlbumsEpSection } from '@/modules/profile/components/discography-albums-ep-section'
import { DiscographyMusicVideosSection } from '@/modules/profile/components/discography-music-videos-section'
import { DiscographySinglesSection } from '@/modules/profile/components/discography-singles-section'
import { DiscographyStatsTelemetry } from '@/modules/profile/components/discography-stats-telemetry'
import { DiscographyArtistPick } from '@/modules/profile/components/discography-artist-pick'
import { DiscographyLatestRelease } from '@/modules/profile/components/discography-latest-release'
import { DiscographyPopularList } from '@/modules/profile/components/discography-popular-list'
import { ProfileTabEmpty } from '@/modules/profile/components/profile-tab-empty'
import { useProfileDiscography } from '@/modules/profile/hooks/use-profile-discography'
import {
  discographyHasContent,
  enrichDiscographyForDisplay,
  isDiscographyPreviewId,
} from '@/modules/profile/lib/discography-format'
import { buildArtistDiscographyStats } from '@/modules/profile/lib/discography-stats'
import { PageLoader } from '@/shared/components/feedback/loader'
import { Button } from '@/shared/components/ui/button'
import '@/modules/profile/styles/profile-discography.css'

type ProfileDiscographyTabProps = {
  user: UserDto
  isOwnProfile?: boolean
}

export function ProfileDiscographyTab({ user, isOwnProfile }: ProfileDiscographyTabProps) {
  const { data, isLoading, isError } = useProfileDiscography(user.id)

  const rawHasContent = data ? discographyHasContent(data) : false
  const showStarterLayout = Boolean(isOwnProfile && data && !rawHasContent)

  const display = useMemo(() => {
    if (!data) return null
    return enrichDiscographyForDisplay(data, user, { preview: showStarterLayout })
  }, [data, user, showStarterLayout])

  const catalog = useMemo(() => {
    if (!display) return []
    const seen = new Set<string>()
    const items = []
    for (const release of [
      display.latestRelease,
      ...(display.albumsAndEps ?? []),
      ...(display.singles ?? []),
    ]) {
      if (!release || seen.has(release.id) || isDiscographyPreviewId(release.id)) continue
      seen.add(release.id)
      items.push(release)
    }
    return items
  }, [display])

  const stats = useMemo(() => (data ? buildArtistDiscographyStats(data) : null), [data])

  if (isLoading) return <PageLoader />

  if (isError || !display) {
    return (
      <ProfileTabEmpty message="No discography yet. Published releases from the artist studio will appear here." />
    )
  }

  if (!rawHasContent && !showStarterLayout) {
    if (!display.artist) {
      return (
        <ProfileTabEmpty message="No discography yet. Published releases from the artist studio will appear here." />
      )
    }
    return <ProfileTabEmpty message="No releases published yet." />
  }

  const artistName = display.artist?.displayName || user.name
  const artistAvatar = display.artist?.avatarUrl ?? user.avatarThumbnailUrl ?? user.avatarUrl

  return (
    <div className="profile-discography profile-discography--fx">
      {showStarterLayout ? (
        <div className="profile-discography__starter rounded-lg border border-dashed border-primary/35 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <p>
            This is a preview layout with sample titles and placeholder artwork. Publish your
            releases from{' '}
            <Link to="/artist" className="font-medium text-primary hover:underline">
              Artist Studio
            </Link>{' '}
            to replace every demo slot with your own catalog.
          </p>
          <Button asChild size="sm" variant="outline" className="mt-2">
            <Link to="/artist/upload">Upload track</Link>
          </Button>
        </div>
      ) : null}

      {display.latestRelease ? <DiscographyLatestRelease release={display.latestRelease} /> : null}

      <div className="profile-discography__body profile-discography__body--rack">
        <div className="disc-rack" aria-hidden>
          <span className="disc-rack__rail" />
          <span className="disc-rack__bus" />
        </div>
        <DiscographyPopularList tracks={display.popular} artistName={artistName} />
        <div className="profile-discography__rack-side">
          <DiscographyArtistPick
            userId={user.id}
            artistName={artistName}
            artistAvatarUrl={artistAvatar}
            pick={display.artistPick}
            catalog={catalog}
            editable={isOwnProfile}
          />
          {stats ? <DiscographyStatsTelemetry stats={stats} preview={showStarterLayout} /> : null}
        </div>
      </div>

      <DiscographyAlbumsEpSection releases={display.albumsAndEps ?? []} artistName={artistName} />
      <DiscographySinglesSection releases={display.singles ?? []} artistName={artistName} />
      <DiscographyMusicVideosSection videos={display.musicVideos ?? []} />
    </div>
  )
}
