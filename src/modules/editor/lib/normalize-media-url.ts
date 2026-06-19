import { apiUrl } from '@/shared/config/env'

/** Ensure saved cover/gallery URLs pass API zod `.url()` validation. */
export function normalizeMediaUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined
  const trimmed = url.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  return apiUrl(trimmed.startsWith('/') ? trimmed : `/${trimmed}`)
}

export function normalizeMediaUrls(urls: string[]): string[] {
  const normalized = urls
    .map((url) => normalizeMediaUrl(url))
    .filter((url): url is string => Boolean(url))
  return [...new Set(normalized)]
}
