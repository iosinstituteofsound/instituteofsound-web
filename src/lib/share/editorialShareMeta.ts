import { cloudinaryUrl, isCloudinaryUrl } from '@/lib/cloudinary/url'
import { absoluteUrl, defaultOgImage } from '@/lib/seo/urls'

export interface EditorialShareMeta {
  title: string
  description: string
  canonicalUrl: string
  /** Hero cover — used for OG/Twitter preview */
  ogImageUrl: string
  shareTitle: string
  twitterCard: 'summary_large_image'
}

function coverForSocialPreview(coverUrl?: string): string {
  const raw = coverUrl?.trim()
  if (!raw) return defaultOgImage()
  if (isCloudinaryUrl(raw)) {
    return cloudinaryUrl(raw, { width: 1200, height: 630, crop: 'fill', quality: 'auto:good' })
  }
  return absoluteUrl(raw)
}

export function buildEditorialShareMeta(
  siteUrl: string,
  article: {
    slug: string
    title: string
    excerpt: string
    image?: string
    subject?: string
  }
): EditorialShareMeta {
  const base = siteUrl.replace(/\/$/, '')
  const canonicalUrl = `${base}/feature/${article.slug}`
  const description =
    article.excerpt?.trim() ||
    article.subject?.trim() ||
    'Read on Institute of Sound — underground music editorial.'

  return {
    title: `${article.title} | Institute of Sound`,
    description,
    canonicalUrl,
    ogImageUrl: coverForSocialPreview(article.image),
    shareTitle: article.title,
    twitterCard: 'summary_large_image',
  }
}

export function buildEditorialShareLinks(
  canonicalUrl: string,
  title: string,
  description: string
) {
  const url = encodeURIComponent(canonicalUrl)
  const text = encodeURIComponent(title)
  const summary = encodeURIComponent(`${title} — ${description.slice(0, 120)}`)
  const wa = encodeURIComponent(`${title}\n${canonicalUrl}`)

  return {
    copyUrl: canonicalUrl,
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    whatsapp: `https://wa.me/?text=${wa}`,
    telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    reddit: `https://www.reddit.com/submit?url=${url}&title=${text}`,
    email: `mailto:?subject=${text}&body=${summary}%0A%0A${url}`,
  }
}
