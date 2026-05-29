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
      title: parsed.hostname.replace(/^www\./, ''),
    }
  } catch {
    return { url: trimmed, title: trimmed }
  }
}

export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  const trimmed = url.trim()
  const stub = linkPreviewStub(trimmed)
  try {
    const target = encodeURIComponent(trimmed)
    const res = await fetch(`/api/link-preview?url=${target}`)
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
