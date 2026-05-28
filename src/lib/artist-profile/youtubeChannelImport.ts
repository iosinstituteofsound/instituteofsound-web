import { parseYouTubeUrl } from '@/lib/community/musicLinks'

export interface ImportedYouTubeVideo {
  title: string
  videoUrl: string
  thumbnailUrl?: string
}

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

function getApiKey(): string {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined
  if (!key?.trim()) {
    throw new Error('Missing VITE_YOUTUBE_API_KEY. Add it in your .env file.')
  }
  return key.trim()
}

function parseChannelUrl(input: string): {
  channelId?: string
  handle?: string
  legacySlug?: string
} {
  const raw = input.trim()
  if (!raw) return {}
  const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  const url = new URL(withProto)
  if (!['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
    throw new Error('Use a valid YouTube channel URL.')
  }

  const parts = url.pathname.split('/').filter(Boolean)
  const first = parts[0] ?? ''
  const second = parts[1] ?? ''

  if (first === 'channel' && /^UC[\w-]{20,}$/.test(second)) {
    return { channelId: second }
  }
  if (first.startsWith('@')) {
    return { handle: first.slice(1) }
  }
  if ((first === 'c' || first === 'user') && second) {
    return { legacySlug: second }
  }

  throw new Error('Unsupported channel URL. Use channel/@handle/user/c format.')
}

async function resolveChannelId(input: string, apiKey: string): Promise<string> {
  const parsed = parseChannelUrl(input)
  if (parsed.channelId) return parsed.channelId

  if (parsed.handle) {
    const handleRes = await fetch(
      `${YOUTUBE_API_BASE}/channels?part=id&forHandle=${encodeURIComponent(parsed.handle)}&key=${apiKey}`
    )
    const handleData = (await handleRes.json()) as {
      items?: Array<{ id: string }>
      error?: { message?: string }
    }
    if (!handleRes.ok || handleData.error) {
      throw new Error(handleData.error?.message ?? 'Failed to resolve YouTube handle.')
    }
    const resolved = handleData.items?.[0]?.id
    if (!resolved) throw new Error('Channel not found for this @handle.')
    return resolved
  }

  if (parsed.legacySlug) {
    const q = parsed.legacySlug
    const searchRes = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(q)}&key=${apiKey}`
    )
    const searchData = (await searchRes.json()) as {
      items?: Array<{ id?: { channelId?: string } }>
      error?: { message?: string }
    }
    if (!searchRes.ok || searchData.error) {
      throw new Error(searchData.error?.message ?? 'Failed to resolve channel URL.')
    }
    const resolved = searchData.items?.[0]?.id?.channelId
    if (!resolved) throw new Error('Channel not found from this URL.')
    return resolved
  }

  throw new Error('Could not resolve channel ID.')
}

export async function fetchLatestVideosFromChannelUrl(
  channelUrl: string,
  limit = 8
): Promise<ImportedYouTubeVideo[]> {
  const apiKey = getApiKey()
  const channelId = await resolveChannelId(channelUrl, apiKey)
  const safeLimit = Math.max(1, Math.min(limit, 20))

  const response = await fetch(
    `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${encodeURIComponent(channelId)}&type=video&order=date&maxResults=${safeLimit}&key=${apiKey}`
  )
  const data = (await response.json()) as {
    items?: Array<{
      id?: { videoId?: string }
      snippet?: {
        title?: string
        thumbnails?: {
          high?: { url?: string }
          medium?: { url?: string }
          default?: { url?: string }
        }
      }
    }>
    error?: { message?: string }
  }

  if (!response.ok || data.error) {
    throw new Error(data.error?.message ?? 'Failed to fetch YouTube videos.')
  }

  const videos: ImportedYouTubeVideo[] = []
  for (const item of data.items ?? []) {
    const videoId = item.id?.videoId
    if (!videoId) continue
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const normalized = parseYouTubeUrl(videoUrl)
    if (!normalized) continue
    const title = item.snippet?.title?.trim() || 'YouTube video'
    const thumbnailUrl =
      item.snippet?.thumbnails?.high?.url ??
      item.snippet?.thumbnails?.medium?.url ??
      item.snippet?.thumbnails?.default?.url
    videos.push({
      title,
      videoUrl: normalized.url,
      thumbnailUrl,
    })
  }

  return videos
}
