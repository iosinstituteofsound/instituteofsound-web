import type { IncomingMessage, ServerResponse } from 'node:http'
import { dispatchV1Api } from './v1Router.js'
import type { ApiRequest, ApiResponse } from './http.js'

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (!raw) {
        resolve(undefined)
        return
      }
      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve(raw)
      }
    })
  })
}

function toApiResponse(res: ServerResponse): ApiResponse {
  return {
    status(code: number) {
      res.statusCode = code
      return this
    },
    setHeader(name: string, value: string) {
      res.setHeader(name, value)
      return this
    },
    json(body: unknown) {
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json')
      }
      res.end(JSON.stringify(body))
      return this
    },
  }
}

export async function dispatchV1DevApi(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
): Promise<boolean> {
  if (!pathname.startsWith('/api/v1/')) return false

  const requestUrl = new URL(req.url ?? '/', 'http://localhost')
  const apiReq: ApiRequest = {
    method: req.method,
    headers: req.headers as ApiRequest['headers'],
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await readBody(req),
    query: Object.fromEntries(requestUrl.searchParams.entries()),
  }

  await dispatchV1Api(apiReq, toApiResponse(res), pathname)
  return true
}
