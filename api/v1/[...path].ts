import { dispatchV1Api } from '../_lib/v1Router.js'

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
  await dispatchV1Api(req, res, pathnameFromRequest(req))
}
