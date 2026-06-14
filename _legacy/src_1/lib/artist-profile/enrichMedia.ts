import { fetchThumbnailFromUrl } from '@/lib/media/thumbnailFromUrl'
import type { ArtistTrack, ArtistVideo } from './types'

export async function enrichTracksWithThumbnails(tracks: ArtistTrack[]): Promise<ArtistTrack[]> {
  return Promise.all(
    tracks.map(async (track) => {
      if (track.coverUrl?.trim()) return track
      const coverUrl = await fetchThumbnailFromUrl(track.streamUrl)
      if (!coverUrl) return track
      return { ...track, coverUrl }
    }),
  )
}

export async function enrichVideosWithThumbnails(videos: ArtistVideo[]): Promise<ArtistVideo[]> {
  return Promise.all(
    videos.map(async (video) => {
      if (video.thumbnailUrl?.trim()) return video
      const thumbnailUrl = await fetchThumbnailFromUrl(video.videoUrl)
      if (!thumbnailUrl) return video
      return { ...video, thumbnailUrl }
    }),
  )
}
