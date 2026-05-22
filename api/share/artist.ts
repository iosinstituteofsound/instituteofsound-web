import {
  escapeHtml,
  fetchPublishedProfileForShare,
  siteOrigin,
} from '../_lib/shareProfile.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
}

type VercelRequest = { query?: { slug?: string | string[] } }
type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => void
  send: (body: string) => void
}

function metaTags(opts: {
  title: string
  description: string
  url: string
  image: string
}) {
  const t = escapeHtml(opts.title)
  const d = escapeHtml(opts.description)
  const u = escapeHtml(opts.url)
  const img = escapeHtml(opts.image)
  return `
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Institute of Sound" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${u}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
  `
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query?.slug
  const slug = (Array.isArray(raw) ? raw[0] : raw)?.trim()
  const origin = siteOrigin()

  if (!slug) {
    res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send('<!DOCTYPE html><html><body>Missing slug</body></html>')
    return
  }

  const row = await fetchPublishedProfileForShare(slug)
  const canonical = `${origin}/artist/${slug}`

  if (!row) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(
      `<!DOCTYPE html><html><head>${metaTags({
        title: 'Artist | Institute of Sound',
        description: 'Underground music archive',
        url: canonical,
        image: `${origin}/api/og/artist?slug=${encodeURIComponent(slug)}`,
      })}</head><body><p>Profile not found</p></body></html>`
    )
    return
  }

  const genres = (row.genres ?? []).slice(0, 2).join(' · ')
  const title = `${row.display_name} | Institute of Sound`
  const description =
    row.tagline?.trim() ||
    (row.bio?.trim()
      ? row.bio.trim().slice(0, 155) + (row.bio.length > 155 ? '…' : '')
      : '') ||
    (genres ? `${genres} — Institute of Sound` : 'Artist on Institute of Sound')

  const image = `${origin}/api/og/artist?slug=${encodeURIComponent(slug)}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  ${metaTags({ title, description, url: canonical, image })}
  <meta http-equiv="refresh" content="0;url=${escapeHtml(canonical)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
</head>
<body>
  <p><a href="${escapeHtml(canonical)}">${escapeHtml(row.display_name)}</a> — Institute of Sound</p>
</body>
</html>`

  res
    .status(200)
    .setHeader('Content-Type', 'text/html; charset=utf-8')
    .setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    .send(html)
}
