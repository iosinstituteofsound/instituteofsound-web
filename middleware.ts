const BOT_UA =
  /facebookexternalhit|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|embedly|pinterest/i

/** Edge-only: no imports from /api (keeps @vercel/og off the middleware bundle). */
export const config = {
  matcher: '/artist/:slug',
}

export default function middleware(request: Request) {
  const ua = request.headers.get('user-agent') ?? ''
  if (!BOT_UA.test(ua)) return

  const { pathname } = new URL(request.url)
  const slug = pathname.replace(/^\/artist\/?/, '').split('/')[0]?.trim()
  if (!slug) return

  const shareUrl = new URL(request.url)
  shareUrl.pathname = '/api/share/artist'
  shareUrl.search = `?slug=${encodeURIComponent(slug)}`

  return Response.redirect(shareUrl, 307)
}
