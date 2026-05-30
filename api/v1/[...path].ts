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

function segmentsFromQuery(req: VercelRequest): string[] {
  const raw = req.query?.path
  if (Array.isArray(raw)) return raw.filter(Boolean)
  if (typeof raw === 'string' && raw) return [raw]
  return []
}

export function pathnameFromRequest(req: VercelRequest): string {
  if (req.url) {
    try {
      const pathname = new URL(req.url, 'https://instituteofsound.in').pathname
      if (pathname.startsWith('/api/v1')) return pathname
    } catch {
      /* fall through */
    }
  }
  const tail = segmentsFromQuery(req).join('/')
  return tail ? `/api/v1/${tail}` : '/api/v1'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyApiSecurityHeaders(res)

  const pathname = pathnameFromRequest(req)
  const limited = checkRateLimit(req, pathname)
  if (!limited.ok) {
    res.setHeader('Retry-After', String(limited.retryAfterSec))
    return res.status(429).json({ error: 'Too many requests. Please wait and try again.' })
  }

  await dispatchV1Api(req, res, pathname)
}
