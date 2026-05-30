import {
  editorialCoverForOg,
  fetchPublishedEditorialForShare,
  stripHtml,
} from '../_lib/shareEditorial.js'
import { escapeHtml, siteOrigin } from '../_lib/shareProfile.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
}

type VercelRequest = { query?: { slug?: string | string[] } }
type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => VercelResponse
  send: (body: string) => void
}

function metaTags(opts: {
  title: string
  description: string
  url: string
  image: string
  imageAlt?: string
}) {
  const t = escapeHtml(opts.title)
  const d = escapeHtml(opts.description)
  const u = escapeHtml(opts.url)
  const img = escapeHtml(opts.image)
  const alt = escapeHtml(opts.imageAlt ?? opts.title)
  return `
    <title>${t}</title>
    <meta name="description" content="${d}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Institute of Sound" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:url" content="${u}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:secure_url" content="${img}" />
    <meta property="og:image:alt" content="${alt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${t}" />
    <meta name="twitter:description" content="${d}" />
    <meta name="twitter:image" content="${img}" />
    <meta name="twitter:image:alt" content="${alt}" />
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

  const row = await fetchPublishedEditorialForShare(slug)
  const canonical = `${origin}/feature/${slug}`
  const fallbackImage = editorialCoverForOg(null, origin)

  if (!row) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8')
    res.send(
      `<!DOCTYPE html><html><head>${metaTags({
        title: 'Editorial | Institute of Sound',
        description: 'Underground music magazine',
        url: canonical,
        image: fallbackImage,
      })}</head><body><p>Article not found</p></body></html>`
    )
    return
  }

  const title = `${row.title} | Institute of Sound`
  const description =
    row.subject?.trim() || stripHtml(row.body) || 'Editorial on Institute of Sound'
  const image = editorialCoverForOg(row.cover_image_url, origin)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  ${metaTags({ title, description, url: canonical, image, imageAlt: row.title })}
  <meta http-equiv="refresh" content="0;url=${escapeHtml(canonical)}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
</head>
<body>
  <p><a href="${escapeHtml(canonical)}">${escapeHtml(row.title)}</a> — Institute of Sound</p>
</body>
</html>`

  res
    .status(200)
    .setHeader('Content-Type', 'text/html; charset=utf-8')
    .setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    .send(html)
}
