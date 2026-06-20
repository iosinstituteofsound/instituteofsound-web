import { env } from '@/shared/config/env'

/** Turn `/uploads/...` or Cloudinary URLs into something the browser can fetch. */
export function resolveFeedAssetUrl(raw: string | undefined): string | undefined {
  if (!raw?.trim()) return undefined
  const value = raw.trim()
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) {
    const origin =
      typeof window !== 'undefined'
        ? window.location.origin
        : env.apiBaseUrl.replace(/\/+$/, '') || env.siteUrl
    return `${origin.replace(/\/+$/, '')}${value}`
  }
  return value
}
