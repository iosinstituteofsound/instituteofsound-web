import { buildArtistCatalogFromUrl } from '../src/lib/media/catalog/buildCatalog'

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
    const catalog = await buildArtistCatalogFromUrl(url)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json(catalog)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Catalog import failed'
    return res.status(502).json({ error: message })
  }
}
