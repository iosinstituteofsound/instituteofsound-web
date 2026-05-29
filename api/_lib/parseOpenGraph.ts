export interface ParsedOpenGraph {
  title?: string
  description?: string
  imageUrl?: string
  siteName?: string
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function readMetaContent(html: string, attr: string, key: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${key}["']`, 'i'),
    new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)`, 'i'),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]?.trim()) return decodeHtmlEntities(match[1].trim())
  }
  return undefined
}

function readTitleTag(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return match?.[1]?.trim() ? decodeHtmlEntities(match[1].trim()) : undefined
}

function absolutizeUrl(base: string, value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return trimmed
  try {
    return new URL(trimmed, base).href
  } catch {
    return trimmed
  }
}

function pickImage(raw: string | undefined, pageUrl: string): string | undefined {
  if (!raw?.trim()) return undefined
  const first = raw.split(',')[0]?.trim()
  return first ? absolutizeUrl(pageUrl, first) : undefined
}

function readJsonLd(html: string, pageUrl: string): ParsedOpenGraph {
  const out: ParsedOpenGraph = {}
  const scripts = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )

  const visit = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    const record = node as Record<string, unknown>
    const type = String(record['@type'] ?? '').toLowerCase()

    if (Array.isArray(record['@graph'])) {
      for (const item of record['@graph']) visit(item)
    }

    const isArticle =
      type.includes('article') ||
      type.includes('webpage') ||
      type.includes('website') ||
      type.includes('product')

    if (isArticle || record.headline || record.name) {
      const title = String(record.headline ?? record.name ?? '').trim()
      const description = String(record.description ?? '').trim()
      const imageRaw =
        typeof record.image === 'string'
          ? record.image
          : Array.isArray(record.image)
            ? String((record.image[0] as Record<string, unknown>)?.url ?? record.image[0] ?? '')
            : String((record.image as Record<string, unknown>)?.url ?? '')

      if (!out.title && title) out.title = title
      if (!out.description && description) out.description = description
      if (!out.imageUrl && imageRaw) out.imageUrl = pickImage(imageRaw, pageUrl)
    }
  }

  for (const match of scripts) {
    try {
      const json = JSON.parse(match[1]) as unknown
      if (Array.isArray(json)) {
        for (const item of json) visit(item)
      } else {
        visit(json)
      }
    } catch {
      /* invalid JSON-LD */
    }
  }

  return out
}

export function parseOpenGraphFromHtml(html: string, pageUrl: string): ParsedOpenGraph {
  const og: ParsedOpenGraph = {}

  const title =
    readMetaContent(html, 'property', 'og:title') ||
    readMetaContent(html, 'name', 'twitter:title') ||
    readTitleTag(html)
  const description =
    readMetaContent(html, 'property', 'og:description') ||
    readMetaContent(html, 'name', 'twitter:description') ||
    readMetaContent(html, 'name', 'description')
  const image =
    readMetaContent(html, 'property', 'og:image:secure_url') ||
    readMetaContent(html, 'property', 'og:image:url') ||
    readMetaContent(html, 'property', 'og:image') ||
    readMetaContent(html, 'name', 'twitter:image') ||
    readMetaContent(html, 'name', 'twitter:image:src')
  const siteName =
    readMetaContent(html, 'property', 'og:site_name') ||
    readMetaContent(html, 'name', 'application-name')

  if (title) og.title = title
  if (description) og.description = description
  if (image) og.imageUrl = pickImage(image, pageUrl)
  if (siteName) og.siteName = siteName

  const jsonLd = readJsonLd(html, pageUrl)
  return {
    title: og.title || jsonLd.title,
    description: og.description || jsonLd.description,
    imageUrl: og.imageUrl || jsonLd.imageUrl,
    siteName: og.siteName || jsonLd.siteName,
  }
}

export function isBlockedPreviewTitle(title?: string): boolean {
  if (!title?.trim()) return false
  const t = title.trim().toLowerCase()
  return (
    t.includes('access denied') ||
    t.includes('just a moment') ||
    t.includes('attention required') ||
    t.includes('request blocked') ||
    t.includes('403 forbidden') ||
    t === 'error'
  )
}
