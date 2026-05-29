import { resolveLinkPreview } from '../src/lib/community/resolveLinkPreview'

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
    const parsed = new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Invalid URL' })
    }

    const preview = await resolveLinkPreview(parsed.toString())
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json(preview)
  } catch {
    return res.status(502).json({ url: url.trim(), error: 'Preview unavailable' })
  }
}
