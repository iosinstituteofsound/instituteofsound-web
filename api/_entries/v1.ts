import { dispatchV1Api } from '../_lib/v1Router.js'
import { checkRateLimit } from '../_lib/rateLimit.js'
import { applyApiSecurityHeaders } from '../_lib/securityHeaders.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 15,
}

type VercelRequest = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
  body?: unknown
  query?: Record<string, string | string[] | undefined>
  url?: string
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => VercelResponse
  json: (body: unknown) => void
}

function queryValue(
  query: VercelRequest['query'],
  key: string,
): string | undefined {
  const raw = query?.[key]
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) return raw[0]
  return undefined
}

/** Resolve full /api/v1/... path (supports vercel rewrite ?path=artist/page). */
export function pathnameFromRequest(req: VercelRequest): string {
  const routed = queryValue(req.query, 'path')
  if (routed) {
    const clean = routed.split('?')[0].replace(/^\/+/, '').replace(/\/+$/, '')
    return clean ? `/api/v1/${clean}` : '/api/v1'
  }

  const rawUrl = req.url ?? ''
  if (rawUrl.startsWith('/api/v1/') && rawUrl !== '/api/v1') {
    return rawUrl.split('?')[0] ?? '/api/v1'
  }

  try {
    const pathname = new URL(rawUrl, 'https://instituteofsound.in').pathname
    if (pathname.startsWith('/api/v1/') && pathname !== '/api/v1') return pathname
  } catch {
    /* fall through */
  }

  return '/api/v1'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    applyApiSecurityHeaders(res)

    const pathname = pathnameFromRequest(req)
    const limited = checkRateLimit(req, pathname)
    if (!limited.ok) {
      res.setHeader('Retry-After', String(limited.retryAfterSec))
      return res.status(429).json({ error: 'Too many requests. Please wait and try again.' })
    }

    await dispatchV1Api(req, res, pathname)
  } catch (err) {
    console.error('[api/v1]', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return res.status(500).json({ error: message })
  }
}
