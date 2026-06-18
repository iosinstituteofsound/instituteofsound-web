import { useMemo } from 'react'
import type { UserDto } from '@/shared/types/auth.types'
import { DiscographyAlbumsEpSection } from '@/modules/profile/components/discography-albums-ep-section'
import { DiscographyMusicVideosSection } from '@/modules/profile/components/discography-music-videos-section'
import { DiscographySinglesSection } from '@/modules/profile/components/discography-singles-section'
import { DiscographyArtistPick } from '@/modules/profile/components/discography-artist-pick'
import { DiscographyLatestRelease } from '@/modules/profile/components/discography-latest-release'
import { DiscographyPopularList } from '@/modules/profile/components/discography-popular-list'
import { ProfileTabEmpty } from '@/modules/profile/components/profile-tab-empty'
import { useProfileDiscography } from '@/modules/profile/hooks/use-profile-discography'
import { PageLoader } from '@/shared/components/feedback/loader'
import '@/modules/profile/styles/profile-discography.css'

type ProfileDiscographyTabProps = {
  user: UserDto
  isOwnProfile?: boolean
}

export function ProfileDiscographyTab({ user, isOwnProfile }: ProfileDiscographyTabProps) {
  const { data, isLoading, isError } = useProfileDiscography(user.id)

  const catalog = useMemo(() => {
    if (!data) return []
    const seen = new Set<string>()
    const items = []
    for (const release of [
      data.latestRelease,
      ...data.popular,
      ...(data.albumsAndEps ?? []),
      ...(data.singles ?? []),
    ]) {
      if (!release || seen.has(release.id)) continue
      seen.add(release.id)
      items.push(release)
    }
    return items
  }, [data])

  if (isLoading) return <PageLoader />

  if (isError || !data?.artist) {
    return (
      <ProfileTabEmpty message="No discography yet. Published releases from the artist studio will appear here." />
    )
  }

  const hasContent =
    data.latestRelease ||
    data.popular.length > 0 ||
    (data.albumsAndEps?.length ?? 0) > 0 ||
    (data.singles?.length ?? 0) > 0 ||
    (data.musicVideos?.length ?? 0) > 0

  if (!hasContent) {
    return <ProfileTabEmpty message="No releases published yet." />
  }

  const artistName = data.artist.displayName || user.name
  const artistAvatar = data.artist.avatarUrl ?? user.avatarThumbnailUrl ?? user.avatarUrl

  return (
    <div className="profile-discography profile-discography--fx">
      {data.latestRelease ? <DiscographyLatestRelease release={data.latestRelease} /> : null}

      <div className="profile-discography__body profile-discography__body--rack">
        <div className="disc-rack" aria-hidden>
          <span className="disc-rack__rail" />
          <span className="disc-rack__bus" />
        </div>
        <DiscographyPopularList releases={data.popular} />
        <DiscographyArtistPick
          userId={user.id}
          artistName={artistName}
          artistAvatarUrl={artistAvatar}
          pick={data.artistPick}
          catalog={catalog}
          editable={isOwnProfile}
        />
      </div>

      <DiscographyAlbumsEpSection releases={data.albumsAndEps ?? []} artistName={artistName} />
      <DiscographySinglesSection releases={data.singles ?? []} artistName={artistName} />
      <DiscographyMusicVideosSection videos={data.musicVideos ?? []} />
    </div>
  )
}
