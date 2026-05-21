import { fetchThumbnailFromUrl } from '@/lib/media/thumbnailFromUrl'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import type { ArtistTrack, ArtistVideo } from './types'
import * as sb from './supabaseProfile'

export async function enrichTracksWithThumbnails(
  tracks: ArtistTrack[],
  persist = false
): Promise<ArtistTrack[]> {
  return Promise.all(
    tracks.map(async (track) => {
      if (track.coverUrl?.trim()) return track
      const coverUrl = await fetchThumbnailFromUrl(track.streamUrl)
      if (!coverUrl) return track
      if (persist && isSupabaseConfigured()) {
        void sb.supabasePatchTrackCover(track.id, coverUrl).catch(() => {})
      }
      return { ...track, coverUrl }
    })
  )
}

export async function enrichVideosWithThumbnails(
  videos: ArtistVideo[],
  persist = false
): Promise<ArtistVideo[]> {
  return Promise.all(
    videos.map(async (video) => {
      if (video.thumbnailUrl?.trim()) return video
      const thumbnailUrl = await fetchThumbnailFromUrl(video.videoUrl)
      if (!thumbnailUrl) return video
      if (persist && isSupabaseConfigured()) {
        void sb.supabasePatchVideoThumbnail(video.id, thumbnailUrl).catch(() => {})
      }
      return { ...video, thumbnailUrl }
    })
  )
}
