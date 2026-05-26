const BOT_UA =
  /facebookexternalhit|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|embedly|pinterest/i

/** Edge-only: no imports from /api (keeps @vercel/og off the middleware bundle). */
export const config = {
  matcher: ['/artist/:slug', '/feature/:slug'],
}

export default function middleware(request: Request) {
  const ua = request.headers.get('user-agent') ?? ''
  if (!BOT_UA.test(ua)) return

  const { pathname } = new URL(request.url)
  const shareUrl = new URL(request.url)

  if (pathname.startsWith('/feature/')) {
    const slug = pathname.replace(/^\/feature\/?/, '').split('/')[0]?.trim()
    if (!slug) return
    shareUrl.pathname = '/api/share/feature'
    shareUrl.search = `?slug=${encodeURIComponent(slug)}`
    return Response.redirect(shareUrl, 307)
  }

  const slug = pathname.replace(/^\/artist\/?/, '').split('/')[0]?.trim()
  if (!slug) return

  shareUrl.pathname = '/api/share/artist'
  shareUrl.search = `?slug=${encodeURIComponent(slug)}`

  return Response.redirect(shareUrl, 307)
}
