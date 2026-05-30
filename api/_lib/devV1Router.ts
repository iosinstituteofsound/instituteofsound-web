import type { IncomingMessage, ServerResponse } from 'node:http'
import { handleV1Me } from './handlers/v1Me.js'
import { handleV1ArtistProfile } from './handlers/v1ArtistProfile.js'
import { handleV1CommunityFeed } from './handlers/v1CommunityFeed.js'
import {
  handleV1CommunityDropCreate,
  handleV1CommunityDropUpdate,
  handleV1CommunityPostHide,
  handleV1CommunityReaction,
  handleV1CommunitySpinCreate,
  handleV1CommunitySpinUpdate,
} from './handlers/v1CommunityMutations.js'
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
  const apiRes = toApiResponse(res)

  if (pathname === '/api/v1/me') {
    await handleV1Me(apiReq, apiRes)
    return true
  }
  if (pathname === '/api/v1/artist/profile') {
    await handleV1ArtistProfile(apiReq, apiRes)
    return true
  }
  if (pathname === '/api/v1/community/feed') {
    await handleV1CommunityFeed(apiReq, apiRes)
    return true
  }
  if (pathname === '/api/v1/community/spins' && req.method === 'POST') {
    await handleV1CommunitySpinCreate(apiReq, apiRes)
    return true
  }
  if (pathname === '/api/v1/community/drops') {
    if (req.method === 'PATCH') await handleV1CommunityDropUpdate(apiReq, apiRes)
    else await handleV1CommunityDropCreate(apiReq, apiRes)
    return true
  }
  if (pathname === '/api/v1/community/spin' && req.method === 'PATCH') {
    await handleV1CommunitySpinUpdate(apiReq, apiRes)
    return true
  }
  if (pathname === '/api/v1/community/reactions' && req.method === 'POST') {
    await handleV1CommunityReaction(apiReq, apiRes)
    return true
  }
  if (pathname === '/api/v1/community/post' && req.method === 'DELETE') {
    await handleV1CommunityPostHide(apiReq, apiRes)
    return true
  }

  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: 'Not found' }))
  return true
}
