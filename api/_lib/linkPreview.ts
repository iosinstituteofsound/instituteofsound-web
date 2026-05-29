import {
  isBlockedPreviewTitle,
  parseOpenGraphFromHtml,
  type ParsedOpenGraph,
} from './parseOpenGraph.js'
import { resolveThumbnailFromUrl } from './thumbnail.js'

export interface ResolvedLinkPreview {
  url: string
  title?: string
  description?: string
  imageUrl?: string
  siteName?: string
}

const CRAWLER_USER_AGENTS = [
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'Twitterbot/1.0',
  'LinkedInBot/1.0 (compatible; Mozilla 5.0; Apache-HttpClient +http://www.linkedin.com)',
  'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
  'Discordbot/2.0 (+https://discordapp.com)',
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

const BROWSER_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...init, signal: controller.signal }).finally(() => clearTimeout(timer))
}

function mergeParsed(target: ResolvedLinkPreview, parsed: ParsedOpenGraph): void {
  if (parsed.title && !isBlockedPreviewTitle(parsed.title) && !target.title) {
    target.title = parsed.title
  }
  if (parsed.description && !target.description) target.description = parsed.description
  if (parsed.imageUrl && !target.imageUrl) target.imageUrl = parsed.imageUrl
  if (parsed.siteName && !target.siteName) target.siteName = parsed.siteName
}

function previewIsRich(preview: ResolvedLinkPreview): boolean {
  return Boolean(preview.title && preview.description && preview.imageUrl)
}

function previewIsUsable(preview: ResolvedLinkPreview): boolean {
  return Boolean(preview.title || preview.description || preview.imageUrl)
}

async function fetchHtmlDocument(url: string): Promise<string | null> {
  for (const userAgent of CRAWLER_USER_AGENTS) {
    try {
      const res = await fetchWithTimeout(
        url,
        {
          headers: { ...BROWSER_HEADERS, 'User-Agent': userAgent },
          redirect: 'follow',
        },
        12_000
      )
      if (!res.ok) continue
      const html = (await res.text()).slice(0, 250_000)
      if (html.length < 200) continue
      if (
        html.includes('og:title') ||
        html.includes('twitter:title') ||
        html.includes('application/ld+json') ||
        html.length > 4_000
      ) {
        return html
      }
    } catch {
      /* try next UA */
    }
  }
  return null
}

type NoembedPayload = {
  title?: string
  description?: string
  thumbnail_url?: string
  provider_name?: string
}

async function fetchNoembed(url: string): Promise<ParsedOpenGraph | null> {
  try {
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as NoembedPayload & { error?: string }
    if (data.error) return null
    return {
      title: data.title?.trim(),
      description: data.description?.trim(),
      imageUrl: data.thumbnail_url?.trim(),
      siteName: data.provider_name?.trim(),
    }
  } catch {
    return null
  }
}

type MicrolinkImage = { url?: string }
type MicrolinkPayload = {
  status?: string
  data?: {
    title?: string
    description?: string
    image?: MicrolinkImage | string
    logo?: MicrolinkImage
    publisher?: string
  }
}

async function fetchMicrolink(url: string): Promise<ParsedOpenGraph | null> {
  const apiKey = process.env.MICROLINK_API_KEY?.trim()
  try {
    const endpoint = new URL('https://api.microlink.io')
    endpoint.searchParams.set('url', url)
    endpoint.searchParams.set('meta', 'true')
    if (apiKey) endpoint.searchParams.set('prerender', 'true')

    const headers: Record<string, string> = { Accept: 'application/json' }
    if (apiKey) headers['x-api-key'] = apiKey

    const res = await fetchWithTimeout(endpoint.toString(), { headers }, apiKey ? 25_000 : 15_000)
    if (!res.ok) return null

    const payload = (await res.json()) as MicrolinkPayload
    if (payload.status !== 'success' || !payload.data) return null

    const imageField = payload.data.image
    const imageUrl =
      typeof imageField === 'string'
        ? imageField
        : imageField?.url || payload.data.logo?.url

    const parsed: ParsedOpenGraph = {
      title: payload.data.title?.trim(),
      description: payload.data.description?.trim(),
      imageUrl: imageUrl?.trim(),
      siteName: payload.data.publisher?.trim(),
    }

    if (isBlockedPreviewTitle(parsed.title)) {
      parsed.title = undefined
      parsed.description = undefined
      parsed.imageUrl = undefined
    }

    return parsed.title || parsed.description || parsed.imageUrl ? parsed : null
  } catch {
    return null
  }
}

/** Server-side: resolve Open Graph / oEmbed metadata for link previews. */
export async function resolveLinkPreview(url: string): Promise<ResolvedLinkPreview> {
  const normalized = url.trim()
  const preview: ResolvedLinkPreview = { url: normalized }

  try {
    preview.siteName = new URL(normalized).hostname.replace(/^www\./, '')
  } catch {
    return preview
  }

  mergeParsed(preview, (await fetchNoembed(normalized)) ?? {})

  const html = await fetchHtmlDocument(normalized)
  if (html) {
    mergeParsed(preview, parseOpenGraphFromHtml(html, normalized))
  }

  if (!previewIsRich(preview)) {
    mergeParsed(preview, (await fetchMicrolink(normalized)) ?? {})
  }

  if (!preview.imageUrl) {
    const thumb = await resolveThumbnailFromUrl(normalized)
    if (thumb) preview.imageUrl = thumb
  }

  if (!preview.title && preview.siteName) {
    preview.title = preview.siteName
  }

  if (!previewIsUsable(preview)) {
    preview.title = preview.siteName
  }

  return preview
}
