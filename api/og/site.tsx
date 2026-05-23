import { siteOrigin } from '../_lib/shareProfile.js'

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
}

/** Redirect /api/og/site → static gothic poster (public/og/site-og.jpg) */
export default function handler() {
  const origin = siteOrigin()
  return Response.redirect(`${origin}/og/site-og.jpg`, 302)
}
