import {
  handleV1CommunityDropCreate,
  handleV1CommunityDropUpdate,
} from '../../_lib/handlers/v1CommunityMutations.js'

export const config = { runtime: 'nodejs' }

type VercelRequest = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
  body?: unknown
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => void
  json: (body: unknown) => void
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'PATCH') return handleV1CommunityDropUpdate(req, res)
  return handleV1CommunityDropCreate(req, res)
}
