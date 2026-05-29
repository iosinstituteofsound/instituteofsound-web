import { getArtistProfilePageForViewer } from '@/lib/artist-profile/service'
import type { ArtistAlbum, ArtistProfile, ArtistTrack } from '@/lib/artist-profile/types'
import { fetchReleasesCatalog } from '@/lib/discovery/releasesCatalog'
import type { DiscoverPremiereCard } from '@/lib/discovery/premieres'

export interface PublicTrackDetail {
  track: ArtistTrack
  profile: ArtistProfile
  album?: ArtistAlbum
  releaseType: 'album' | 'ep' | 'single'
  moreFromArtist: ArtistTrack[]
  moreReleases: DiscoverPremiereCard[]
}

export async function fetchPublicTrackDetail(
  artistSlug: string,
  trackId: string
): Promise<PublicTrackDetail | null> {
  if (!artistSlug?.trim() || !trackId?.trim() || trackId.startsWith('album-')) {
    return null
  }

  const page = await getArtistProfilePageForViewer(artistSlug)
  if (!page) return null

  const track = page.tracks.find((t) => t.id === trackId)
  if (!track?.streamUrl?.trim()) return null

  const allAlbums = [...page.albums, ...page.singles]
  const album = track.albumId ? allAlbums.find((a) => a.id === track.albumId) : undefined
  const releaseType =
    album?.releaseType === 'album' || album?.releaseType === 'ep' ? album.releaseType : 'single'

  const moreFromArtist = page.tracks.filter((t) => t.id !== trackId).slice(0, 4)

  let moreReleases: DiscoverPremiereCard[] = []
  try {
    const catalog = await fetchReleasesCatalog()
    moreReleases = catalog
      .filter((c) => c.trackId !== trackId && c.catalogKind !== 'album')
      .slice(0, 5)
  } catch {
    moreReleases = []
  }

  return {
    track,
    profile: page.profile,
    album,
    releaseType,
    moreFromArtist,
    moreReleases,
  }
}
