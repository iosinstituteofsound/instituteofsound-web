import type { LinkPreview } from '@/shared/lib/link-preview/link-preview'

export type DmLinkPreviewLike = {
  url: string
  title?: string
  imageUrl?: string
  description?: string
  siteName?: string
}

export function toLinkPreview(preview: DmLinkPreviewLike): LinkPreview {
  return {
    url: preview.url,
    title: preview.title,
    imageUrl: preview.imageUrl,
    description: preview.description,
    siteName: preview.siteName,
  }
}
