export interface LinkPreview {
  url: string
  title?: string
  description?: string
  imageUrl?: string
  siteName?: string
}

export function linkPreviewStub(url: string): LinkPreview {
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    return {
      url: parsed.href,
      siteName: parsed.hostname.replace(/^www\./, ''),
    }
  } catch {
    return { url: trimmed }
  }
}

/** Avoid duplicate hostname + generic platform title; flag scrape-thin previews. */
export function normalizeLinkPreviewForDisplay(preview: LinkPreview): {
  preview: LinkPreview
  isMinimal: boolean
} {
  let hostname = ''
  try {
    hostname = new URL(preview.url).hostname.replace(/^www\./, '')
  } catch {
    /* keep empty */
  }

  const siteName = preview.siteName?.trim() || hostname || 'Link'
  let title = preview.title?.trim()

  if (title && hostname) {
    const titleKey = title.toLowerCase()
    const hostKey = hostname.split('.')[0]?.toLowerCase() ?? ''
    const siteKey = siteName.replace(/^www\./, '').split('.')[0]?.toLowerCase() ?? ''
    if (titleKey === hostKey || titleKey === siteKey || titleKey === siteName.toLowerCase()) {
      title = undefined
    }
  }

  const normalized: LinkPreview = {
    ...preview,
    siteName,
    title,
  }

  const isMinimal =
    !normalized.imageUrl && !normalized.description && (!normalized.title || normalized.title === siteName)

  return { preview: normalized, isMinimal }
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const trimmed = url.trim()
  const stub = linkPreviewStub(trimmed)
  try {
    const { apiUtilityUrl } = await import('@/services/api/client')
    const target = encodeURIComponent(trimmed)
    const res = await fetch(`${apiUtilityUrl('/api/link-preview')}?url=${target}`)
    if (!res.ok) {
      return stub
    }
    const data = (await res.json()) as LinkPreview
    return {
      ...stub,
      ...data,
      url: data.url?.trim() || stub.url,
      title: data.title?.trim() || stub.title,
      siteName: data.siteName?.trim() || stub.siteName,
    }
  } catch {
    return stub
  }
}
