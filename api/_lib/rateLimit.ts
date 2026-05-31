import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { ApiRequest } from './http.js'
import { env } from './env.js'

type Bucket = { count: number; resetAt: number }

const memoryBuckets = new Map<string, Bucket>()

export type RateLimitTier = 'read' | 'write' | 'search' | 'sensitive'

const LIMITS: Record<RateLimitTier, { max: number; windowMs: number }> = {
  read: { max: 180, windowMs: 60_000 },
  write: { max: 45, windowMs: 60_000 },
  search: { max: 50, windowMs: 60_000 },
  sensitive: { max: 25, windowMs: 60_000 },
}

const SENSITIVE_PATHS = [
  '/media/sign',
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

let redisClient: Redis | null | undefined
let redisLimiters: Record<RateLimitTier, Ratelimit> | null | undefined

function pruneExpired(now: number) {
  if (memoryBuckets.size < 5000) return
  for (const [key, bucket] of memoryBuckets) {
    if (bucket.resetAt <= now) memoryBuckets.delete(key)
  }
}

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient
  const url = env('UPSTASH_REDIS_REST_URL', 'KV_REST_API_URL')
  const token = env('UPSTASH_REDIS_REST_TOKEN', 'KV_REST_API_TOKEN')
  if (!url || !token) {
    redisClient = null
    return null
  }
  redisClient = new Redis({ url, token })
  return redisClient
}

function getRedisLimiters(): Record<RateLimitTier, Ratelimit> | null {
  const redis = getRedis()
  if (!redis) return null
  if (redisLimiters) return redisLimiters

  redisLimiters = {
    read: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMITS.read.max, '60 s'),
      prefix: 'ios:rl:read',
      analytics: false,
    }),
    write: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMITS.write.max, '60 s'),
      prefix: 'ios:rl:write',
      analytics: false,
    }),
    search: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMITS.search.max, '60 s'),
      prefix: 'ios:rl:search',
      analytics: false,
    }),
    sensitive: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMITS.sensitive.max, '60 s'),
      prefix: 'ios:rl:sensitive',
      analytics: false,
    }),
  }
  return redisLimiters
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

function checkRateLimitMemory(
  ip: string,
  pathname: string,
  tier: RateLimitTier,
): { ok: true } | { ok: false; retryAfterSec: number } {
  const { max, windowMs } = LIMITS[tier]
  const now = Date.now()
  pruneExpired(now)

  const key = `${tier}:${ip}:${pathname.split('?')[0]}`
  const bucket = memoryBuckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }

  if (bucket.count >= max) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
  }

  bucket.count += 1
  return { ok: true }
}

export async function checkRateLimit(
  req: ApiRequest,
  pathname: string,
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const tier = rateLimitTierForPath(pathname, req.method)
  const ip = clientIp(req)
  const pathKey = pathname.split('?')[0]
  const identifier = `${ip}:${pathKey}`

  const limiters = getRedisLimiters()
  if (limiters) {
    try {
      const { success, reset } = await limiters[tier].limit(identifier)
      if (!success) {
        const retryAfterSec = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
        return { ok: false, retryAfterSec }
      }
      return { ok: true }
    } catch (err) {
      console.warn(
        '[rateLimit] Upstash error, falling back to in-memory',
        err instanceof Error ? err.message : err,
      )
    }
  }

  return checkRateLimitMemory(ip, pathname, tier)
}
