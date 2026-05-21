import { parseYouTubeChannelRef } from './parseUrls'
import type { ArtistCatalogImportResult, CatalogImportItem } from './types'

type YouTubeChannelList = {
  items?: {
    id: string
    snippet?: { title?: string; thumbnails?: { high?: { url?: string } } }
    contentDetails?: { relatedPlaylists?: { uploads?: string } }
  }[]
}

type YouTubePlaylistItems = {
  items?: {
    id?: string
    snippet?: {
      title?: string
      resourceId?: { videoId?: string }
      thumbnails?: { high?: { url?: string }; medium?: { url?: string } }
      publishedAt?: string
    }
  }[]
}

function youtubeApiKey(): string | undefined {
  return process.env.YOUTUBE_API_KEY?.trim()
}

async function youtubeApiGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = youtubeApiKey()
  if (!key) throw new Error('YouTube API key not configured on server')

  const qs = new URLSearchParams({ ...params, key })
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}?${qs}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`YouTube API error: ${res.status} ${text.slice(0, 120)}`)
  }
  return res.json() as Promise<T>
}

async function resolveChannelId(ref: ReturnType<typeof parseYouTubeChannelRef>): Promise<{
  channelId: string
  title?: string
  avatarUrl?: string
  uploadsPlaylistId?: string
}> {
  if (!ref) throw new Error('Invalid YouTube channel URL')

  if (ref.kind === 'channelId') {
    const data = await youtubeApiGet<YouTubeChannelList>('channels', {
      part: 'snippet,contentDetails',
      id: ref.value,
    })
    const ch = data.items?.[0]
    if (!ch) throw new Error('YouTube channel not found')
    return {
      channelId: ch.id,
      title: ch.snippet?.title,
      avatarUrl: ch.snippet?.thumbnails?.high?.url,
      uploadsPlaylistId: ch.contentDetails?.relatedPlaylists?.uploads,
    }
  }

  const paramKey = ref.kind === 'handle' ? 'forHandle' : 'forUsername'
  const data = await youtubeApiGet<YouTubeChannelList>('channels', {
    part: 'snippet,contentDetails',
    [paramKey]: ref.value,
  })
  const ch = data.items?.[0]
  if (!ch) throw new Error('YouTube channel not found')
  return {
    channelId: ch.id,
    title: ch.snippet?.title,
    avatarUrl: ch.snippet?.thumbnails?.high?.url,
    uploadsPlaylistId: ch.contentDetails?.relatedPlaylists?.uploads,
  }
}

export async function importCatalogFromYouTube(profileUrl: string): Promise<ArtistCatalogImportResult> {
  const ref = parseYouTubeChannelRef(profileUrl)
  const warnings: string[] = []

  if (!youtubeApiKey()) {
    return {
      platform: 'youtube',
      profileUrl,
      suggestions: { youtubeUrl: profileUrl },
      items: [],
      warnings: [
        'YouTube video import needs YOUTUBE_API_KEY on the server (Google Cloud Console → YouTube Data API v3). Redeploy after adding the key.',
      ],
    }
  }

  if (!ref) {
    throw new Error('Use a YouTube channel URL (youtube.com/@handle or /channel/...)')
  }

  const channel = await resolveChannelId(ref)
  const items: CatalogImportItem[] = []

  if (channel.uploadsPlaylistId) {
    const uploads = await youtubeApiGet<YouTubePlaylistItems>('playlistItems', {
      part: 'snippet',
      playlistId: channel.uploadsPlaylistId,
      maxResults: '15',
    })

    for (const entry of uploads.items ?? []) {
      const videoId = entry.snippet?.resourceId?.videoId
      const title = entry.snippet?.title
      if (!videoId || !title || title === 'Private video' || title === 'Deleted video') continue

      const streamUrl = `https://www.youtube.com/watch?v=${videoId}`
      items.push({
        id: `youtube-video-${videoId}`,
        kind: 'video',
        title,
        streamUrl,
        coverUrl:
          entry.snippet?.thumbnails?.high?.url ??
          entry.snippet?.thumbnails?.medium?.url ??
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        releaseYear: entry.snippet?.publishedAt
          ? parseInt(entry.snippet.publishedAt.slice(0, 4), 10)
          : undefined,
      })
    }
  }

  if (items.length === 0) {
    warnings.push('No public videos found on this YouTube channel.')
  }

  return {
    platform: 'youtube',
    profileUrl,
    suggestions: {
      displayName: channel.title,
      avatarUrl: channel.avatarUrl,
      youtubeUrl: profileUrl,
      tagline: channel.title ? `${channel.title} on YouTube` : undefined,
    },
    items,
    warnings,
  }
}
