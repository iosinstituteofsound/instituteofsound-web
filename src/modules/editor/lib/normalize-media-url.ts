import { apiUrl, env } from '@/shared/config/env'

/** Ensure saved cover/gallery URLs pass API zod `.url()` validation. */
export function normalizeMediaUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('//')) return `https:${trimmed}`

  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  const resolved = apiUrl(path)
  if (/^https?:\/\//i.test(resolved)) return resolved

  const origin = typeof window !== 'undefined' ? window.location.origin : env.siteUrl.replace(/\/+$/, '')
  return `${origin}${resolved.startsWith('/') ? resolved : `/${resolved}`}`
}

export function normalizeMediaUrls(urls: string[]): string[] {
  const normalized = urls
    .map((url) => normalizeMediaUrl(url))
    .filter((url): url is string => Boolean(url))
  return [...new Set(normalized)]
}
