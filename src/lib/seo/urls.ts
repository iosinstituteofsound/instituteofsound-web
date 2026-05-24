import { getSiteUrl } from '@/lib/auth/siteUrl'

export const SITE_NAME = 'Institute of Sound'

const DEFAULT_OG_PATH = '/og/site-og.jpg'

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const base = getSiteUrl().replace(/\/$/, '')
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

export function defaultOgImage(): string {
  return absoluteUrl(DEFAULT_OG_PATH)
}

export function pathUrl(path: string): string {
  return absoluteUrl(path.startsWith('/') ? path : `/${path}`)
}
