import { handleV1CommunityFeed } from '../../_lib/handlers/v1CommunityFeed.js'

export const config = { runtime: 'nodejs' }

type VercelRequest = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
  query?: Record<string, string | string[] | undefined>
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => void
  json: (body: unknown) => void
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleV1CommunityFeed(req, res)
}
