import { payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'

export interface SiteVideoItem {
  id: string
  title: string
  authorName: string
  videoUrl: string
  source: 'feed' | 'youtube'
  sourceLabel?: string
  posterUrl?: string
}

export function collectSiteVideos(items: FeedItemDto[]): SiteVideoItem[] {
  const videos: SiteVideoItem[] = []
  const seen = new Set<string>()

  const add = (video: SiteVideoItem) => {
    const url = video.videoUrl.trim()
    if (!url || seen.has(url)) return
    seen.add(url)
    videos.push(video)
  }

  for (const item of items) {
    if (item.type === 'video') {
      const videoUrl = payloadString(item.payload, 'videoUrl')
      if (!videoUrl) continue
      add({
        id: `feed-${item.id}`,
        title: item.title?.trim() || item.body?.trim().slice(0, 72) || 'Site video',
        authorName: item.author.name,
        videoUrl,
        source: 'feed',
        sourceLabel: 'Feed video',
        posterUrl: payloadString(item.payload, 'posterUrl'),
      })
      continue
    }

    if (item.type === 'music') {
      const youtubeUrl = payloadString(item.payload, 'youtubeUrl')
      if (!youtubeUrl) continue
      add({
        id: `music-yt-${item.id}`,
        title: item.title?.trim() || 'Music video',
        authorName: item.author.name,
        videoUrl: youtubeUrl,
        source: 'youtube',
        sourceLabel: 'YouTube',
      })
    }
  }

  return videos.sort((a, b) => a.title.localeCompare(b.title))
}

export function searchSiteVideos(videos: SiteVideoItem[], query: string, limit = 24): SiteVideoItem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return videos.slice(0, limit)

  return videos
    .filter((video) => {
      const haystack = `${video.title} ${video.authorName} ${video.sourceLabel ?? ''}`.toLowerCase()
      return haystack.includes(normalized)
    })
    .slice(0, limit)
}
