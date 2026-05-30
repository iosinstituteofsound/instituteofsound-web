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

function pathnameFromRequest(req: VercelRequest): string {
  if (req.url) {
    try {
      return new URL(req.url, 'https://instituteofsound.in').pathname
    } catch {
      /* fall through */
    }
  }
  const segments = req.query?.path
  const tail = Array.isArray(segments) ? segments.join('/') : segments ?? ''
  return tail ? `/api/v1/${tail}` : '/api/v1'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await dispatchV1Api(req, res, pathnameFromRequest(req))
}
