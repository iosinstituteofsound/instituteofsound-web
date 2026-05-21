import { resolveThumbnailFromUrl, youtubeThumbnailFromUrl } from './resolveThumbnail'

const cache = new Map<string, string>()

async function fetchNoembedClient(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`)
    if (!res.ok) return null
    const data = (await res.json()) as { thumbnail_url?: string }
    return data.thumbnail_url?.trim() || null
  } catch {
    return null
  }
}

/** Client: fetch thumbnail for any stream URL (cached). */
export async function fetchThumbnailFromUrl(url: string): Promise<string | null> {
  const key = url.trim()
  if (!key) return null

  const cached = cache.get(key)
  if (cached) return cached

  const youtube = youtubeThumbnailFromUrl(key)
  if (youtube) {
    cache.set(key, youtube)
    return youtube
  }

  try {
    const res = await fetch(`/api/thumbnail?url=${encodeURIComponent(key)}`)
    if (res.ok) {
      const data = (await res.json()) as { thumbnailUrl?: string | null }
      const thumb = data.thumbnailUrl?.trim()
      if (thumb) {
        cache.set(key, thumb)
        return thumb
      }
    }
  } catch {
    /* API unavailable in some environments */
  }

  const fallback = await fetchNoembedClient(key)
  if (fallback) cache.set(key, fallback)
  return fallback
}

export { resolveThumbnailFromUrl }
