const BOT_UA =
  /facebookexternalhit|whatsapp|twitterbot|telegrambot|linkedinbot|slackbot|discordbot|embedly|pinterest/i

/** Edge-only — share cards are served by the Express API (Railway). */
export const config = {
  matcher: ['/artist/:slug', '/feature/:slug'],
}

function apiOrigin(request: Request): string {
  const configured = process.env.API_BASE_URL ?? process.env.VITE_API_BASE_URL
  if (configured?.trim()) return configured.trim().replace(/\/+$/, '')
  return new URL(request.url).origin
}

export default function middleware(request: Request) {
  const ua = request.headers.get('user-agent') ?? ''
  if (!BOT_UA.test(ua)) return

  const { pathname } = new URL(request.url)
  const origin = apiOrigin(request)

  if (pathname.startsWith('/feature/')) {
    const slug = pathname.replace(/^\/feature\/?/, '').split('/')[0]?.trim()
    if (!slug) return
    const shareUrl = `${origin}/api/share/feature?slug=${encodeURIComponent(slug)}`
    return Response.redirect(shareUrl, 307)
  }

  const slug = pathname.replace(/^\/artist\/?/, '').split('/')[0]?.trim()
  if (!slug) return

  const shareUrl = `${origin}/api/share/artist?slug=${encodeURIComponent(slug)}`
  return Response.redirect(shareUrl, 307)
}
