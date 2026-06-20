import { searchMusic } from '@/modules/search/api/search.api'
import type { PlaylistTrackSearchResultDto } from '@/modules/music/types/music.types'

export async function searchListenerPlaylistTracks(
  q: string,
  limit = 10,
): Promise<PlaylistTrackSearchResultDto> {
  const result = await searchMusic(q, { limit, category: 'all' })
  const siteTracks = result.tracks.map((track) => ({
    trackId: track.id,
    title: track.title,
    artistName: track.artistName ?? 'Unknown',
    releaseId: track.releaseId,
    releaseTitle: track.releaseTitle,
  }))
  return {
    yourReleases: [],
    otherReleases: [],
    siteTracks,
  }
}
