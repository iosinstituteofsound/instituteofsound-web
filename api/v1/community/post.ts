import { handleV1CommunityPostHide } from '../../_lib/handlers/v1CommunityMutations.js'

export const config = { runtime: 'nodejs' }

type VercelRequest = {
  method?: string
  headers?: Record<string, string | string[] | undefined>
  body?: unknown
  query?: Record<string, string | string[] | undefined>
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => void
  json: (body: unknown) => void
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  return handleV1CommunityPostHide(req, res)
}
