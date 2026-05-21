import { buildArtistCatalogFromUrl } from './catalog/buildCatalog'

type VercelRequest = { query: { url?: string | string[] } }
type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => void
  json: (body: unknown) => void
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json')

  const raw = req.query.url
  const url = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined

  if (!url?.trim()) {
    return res.status(400).json({ error: 'Missing url query parameter' })
  }

  if (!process.env.SPOTIFY_CLIENT_ID?.trim() || !process.env.SPOTIFY_CLIENT_SECRET?.trim()) {
    const isSpotify = url.includes('spotify.com')
    if (isSpotify) {
      return res.status(503).json({
        error:
          'Spotify keys server pe missing. Vercel → Settings → Environment Variables → SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET (Production), phir Redeploy.',
        platform: 'spotify',
        profileUrl: url,
        suggestions: { spotifyUrl: url },
        items: [],
        warnings: [],
      })
    }
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
