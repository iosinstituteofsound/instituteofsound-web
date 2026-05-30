import { handleV1ArtistProfile } from '../../_lib/handlers/v1ArtistProfile.js'

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
  return handleV1ArtistProfile(req, res)
}
