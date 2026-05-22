import { ImageResponse } from '@vercel/og'
import { fetchPublishedProfileForShare } from '../_lib/shareProfile.js'

/** Node runtime — @vercel/og font/wasm assets fail on Edge for Vite projects. */
export const config = {
  runtime: 'nodejs',
  maxDuration: 15,
}

type VercelRequest = { query?: { slug?: string | string[] } }

function normalizeAccent(hex: string | null | undefined) {
  const h = (hex ?? '#d40000').trim()
  return /^#[0-9a-f]{6}$/i.test(h) ? h : '#d40000'
}

export default async function handler(req: VercelRequest) {
  const raw = req.query?.slug
  const slug = (Array.isArray(raw) ? raw[0] : raw)?.trim()

  if (!slug) {
    return new Response('Missing slug', { status: 400 })
  }

  const row = await fetchPublishedProfileForShare(slug)
  const accent = normalizeAccent(row?.accent_color)
  const name = row?.display_name ?? 'Artist'
  const tagline =
    row?.tagline?.trim() ||
    (row?.genres ?? []).slice(0, 2).join(' · ') ||
    'Institute of Sound'
  const banner = row?.banner_url || row?.avatar_url || null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: '#050505',
          position: 'relative',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.55,
            }}
          />
        ) : null}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(105deg, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.55) 45%, rgba(5,5,5,0.75) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: accent,
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '56px 64px',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: 22,
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              color: accent,
              marginBottom: 20,
            }}
          >
            Institute of Sound
          </div>
          <div
            style={{
              fontSize: name.length > 22 ? 56 : 72,
              fontWeight: 800,
              color: '#f5f5f5',
              lineHeight: 0.95,
              textTransform: 'uppercase',
              maxWidth: 900,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'rgba(245,245,245,0.78)',
              marginTop: 24,
              maxWidth: 820,
              lineHeight: 1.35,
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 40,
              fontSize: 18,
              color: 'rgba(245,245,245,0.45)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            instituteofsound.in/artist/{slug}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
