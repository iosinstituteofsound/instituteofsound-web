import { handleV1Me } from '../_lib/handlers/v1Me.js'

export const config = {
  runtime: 'nodejs',
}

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
  return handleV1Me(req, res)
}
