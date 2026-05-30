import type { ApiRequest } from './http.js'

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

export type RateLimitTier = 'read' | 'write' | 'search' | 'sensitive'

const LIMITS: Record<RateLimitTier, { max: number; windowMs: number }> = {
  read: { max: 180, windowMs: 60_000 },
  write: { max: 45, windowMs: 60_000 },
  search: { max: 50, windowMs: 60_000 },
  sensitive: { max: 25, windowMs: 60_000 },
}

const SENSITIVE_PATHS = [
  '/community/award-db',
  '/community/grant-badge',
  '/community/challenges/evaluate',
  '/desk/analytics',
  '/editor-applications/approve',
  '/editor-applications/reject',
  '/collab/respond',
  '/collab/accept',
  '/network/connect',
  '/network/respond',
]

function pruneExpired(now: number) {
  if (buckets.size < 5000) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export function clientIp(req: ApiRequest): string {
  const xff = req.headers?.['x-forwarded-for'] ?? req.headers?.['X-Forwarded-For']
  const raw = Array.isArray(xff) ? xff[0] : xff
  const ip = raw?.split(',')[0]?.trim()
  if (ip) return ip
  const real = req.headers?.['x-real-ip'] ?? req.headers?.['X-Real-IP']
  const realIp = Array.isArray(real) ? real[0] : real
  return realIp?.trim() || 'unknown'
}

export function rateLimitTierForPath(pathname: string, method?: string): RateLimitTier {
  const m = (method ?? 'GET').toUpperCase()
  if (SENSITIVE_PATHS.some((p) => pathname.includes(p))) return 'sensitive'
  if (pathname.includes('/search/')) return 'search'
  if (m !== 'GET' && m !== 'HEAD' && m !== 'OPTIONS') return 'write'
  return 'read'
}

export function checkRateLimit(
  req: ApiRequest,
  pathname: string,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const tier = rateLimitTierForPath(pathname, req.method)
  const { max, windowMs } = LIMITS[tier]
  const now = Date.now()
  pruneExpired(now)

  const ip = clientIp(req)
  const key = `${tier}:${ip}:${pathname.split('?')[0]}`
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }

  if (bucket.count >= max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
  }

  bucket.count += 1
  return { ok: true }
}
