import { linkPreviewStub, type LinkPreview } from '@/shared/lib/link-preview/link-preview'

type OembedPayload = {
  title?: string
  thumbnail_url?: string
  provider_name?: string
  description?: string
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

function parseYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return id || null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const v = u.searchParams.get('v')
      if (v) return v
      const embed = u.pathname.match(/^\/embed\/([^/?]+)/)
      if (embed) return embed[1] ?? null
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/)
      if (shorts) return shorts[1] ?? null
    }
  } catch {
    return null
  }
  return null
}

async function fetchOembed(endpoint: string): Promise<OembedPayload | null> {
  try {
    const res = await fetch(endpoint, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return (await res.json()) as OembedPayload
  } catch {
    return null
  }
}

function mergePreview(base: LinkPreview, patch: Partial<LinkPreview>): LinkPreview {
  return {
    url: patch.url?.trim() || base.url,
    title: patch.title?.trim() || base.title,
    description: patch.description?.trim() || base.description,
    imageUrl: patch.imageUrl?.trim() || base.imageUrl,
    siteName: patch.siteName?.trim() || base.siteName,
  }
}

function fromOembed(url: string, data: OembedPayload, fallbackSite?: string): LinkPreview {
  return mergePreview(linkPreviewStub(url), {
    url,
    title: data.title,
    description: data.description,
    imageUrl: data.thumbnail_url,
    siteName: data.provider_name || fallbackSite,
  })
}

async function resolveYouTube(url: string): Promise<LinkPreview> {
  const base = linkPreviewStub(url)
  const oembed = await fetchOembed(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
  )
  if (oembed) return fromOembed(url, oembed, 'YouTube')

  const id = parseYouTubeId(url)
  if (!id) return base
  return mergePreview(base, {
    url,
    siteName: 'YouTube',
    imageUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
  })
}

async function resolveSpotify(url: string): Promise<LinkPreview> {
  const oembed = await fetchOembed(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
  return oembed ? fromOembed(url, oembed, 'Spotify') : linkPreviewStub(url)
}

async function resolveSoundCloud(url: string): Promise<LinkPreview> {
  const oembed = await fetchOembed(
    `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`,
  )
  return oembed ? fromOembed(url, oembed, 'SoundCloud') : linkPreviewStub(url)
}

async function resolveNoembed(url: string): Promise<LinkPreview> {
  const oembed = await fetchOembed(`https://noembed.com/embed?url=${encodeURIComponent(url)}`)
  return oembed ? fromOembed(url, oembed) : linkPreviewStub(url)
}

/** Browser-side preview when API is unavailable (YouTube oEmbed allows CORS). */
export async function fetchClientLinkPreview(url: string): Promise<LinkPreview> {
  const trimmed = url.trim()
  const host = hostOf(trimmed)

  if (host.includes('youtube.com') || host === 'youtu.be' || host === 'music.youtube.com') {
    return resolveYouTube(trimmed)
  }
  if (host.includes('spotify.com')) {
    return resolveSpotify(trimmed)
  }
  if (host.includes('soundcloud.com')) {
    return resolveSoundCloud(trimmed)
  }

  const noembed = await resolveNoembed(trimmed)
  if (noembed.imageUrl || noembed.title) return noembed

  return linkPreviewStub(trimmed)
}

export function hasRichPreview(preview: LinkPreview): boolean {
  return Boolean(preview.imageUrl || preview.title || preview.description)
}
