import { escapeHtml, siteOrigin } from '../_lib/shareProfile.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
}

type VercelResponse = {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => void
  send: (body: string) => void
}

const TITLE = 'Institute of Sound'
const DESCRIPTION =
  'Underground music magazine — reviews, features, bands, and culture. Not a blog. A transmission.'

export default function handler(_req: unknown, res: VercelResponse) {
  const origin = siteOrigin()
  const url = `${origin}/`
  const image = `${origin}/api/og/site`
  const t = escapeHtml(TITLE)
  const d = escapeHtml(DESCRIPTION)
  const u = escapeHtml(url)
  const img = escapeHtml(image)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
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
  <meta http-equiv="refresh" content="0;url=${u}" />
</head>
<body><p><a href="${u}">${t}</a></p></body>
</html>`)
}
