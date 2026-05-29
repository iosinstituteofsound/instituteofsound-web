import { resolveThumbnailFromUrl } from './_lib/thumbnail.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 15,
}

type VercelRequest = { query: { url?: string | string[] } }
type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => void
  json: (body: unknown) => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.url
  const url = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined

  if (!url?.trim()) {
    return res.status(400).json({ error: 'Missing url query parameter' })
  }

  try {
    const thumbnailUrl = await resolveThumbnailFromUrl(url)
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
    return res.status(200).json({ thumbnailUrl })
  } catch {
    return res.status(502).json({ error: 'Thumbnail lookup failed', thumbnailUrl: null })
  }
}
