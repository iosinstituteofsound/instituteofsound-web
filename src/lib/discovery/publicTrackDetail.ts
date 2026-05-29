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
  /** Same artist — main column rail */
  artistReleases: DiscoverPremiereCard[]
  /** Other published artists — below artist rail */
  otherArtistReleases: DiscoverPremiereCard[]
  artistStats: {
    trackCount: number
    albumCount: number
    totalPlays: number
  }
  /** Sidebar queue — current track first, then top plays */
  sidebarTracks: ArtistTrack[]
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

  const trackCount = page.tracks.length
  const albumCount = page.albums.length + page.singles.length
  const totalPlays = page.tracks.reduce((sum, t) => sum + (t.playCount ?? 0), 0)

  const others = page.tracks
    .filter((t) => t.id !== trackId)
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 5)
  const sidebarTracks = [track, ...others]

  let artistReleases: DiscoverPremiereCard[] = []
  let otherArtistReleases: DiscoverPremiereCard[] = []
  try {
    const catalog = await fetchReleasesCatalog()
    const playable = catalog.filter(
      (c) => c.trackId !== trackId && c.catalogKind !== 'album' && c.streamUrl
    )
    artistReleases = playable.filter((c) => c.artistSlug === artistSlug).slice(0, 5)
    otherArtistReleases = playable.filter((c) => c.artistSlug !== artistSlug).slice(0, 5)
  } catch {
    artistReleases = []
    otherArtistReleases = []
  }

  return {
    track,
    profile: page.profile,
    album,
    releaseType,
    moreFromArtist,
    artistReleases,
    otherArtistReleases,
    artistStats: { trackCount, albumCount, totalPlays },
    sidebarTracks,
  }
}
