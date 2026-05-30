import { dispatchV1Api } from './_lib/v1Router.js'
import { checkRateLimit } from './_lib/rateLimit.js'
import { applyApiSecurityHeaders } from './_lib/securityHeaders.js'

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

/** Resolve full /api/v1/... path from the incoming request URL. */
export function pathnameFromRequest(req: VercelRequest): string {
  const rawUrl = req.url ?? ''
  if (rawUrl.startsWith('/api/v1')) return rawUrl.split('?')[0] ?? '/api/v1'

  try {
    const pathname = new URL(rawUrl, 'https://instituteofsound.in').pathname
    if (pathname.startsWith('/api/v1')) return pathname
  } catch {
    /* fall through */
  }

  return '/api/v1'
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
