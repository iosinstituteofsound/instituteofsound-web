import type { ArtistShareMeta } from '@/lib/share/artistShareMeta'
import { breadcrumbJsonLd, musicGroupJsonLd } from '@/lib/seo/jsonLd'
import type { SeoConfig } from '@/lib/seo/types'
import { useSeo } from '@/hooks/useSeo'

export function artistShareToSeo(
  slug: string,
  meta: ArtistShareMeta,
  profile?: { genres?: string[] }
): SeoConfig {
  const path = `/artist/${slug}`
  const displayName = meta.title.replace(/ \| Institute of Sound$/, '')
  return {
    title: meta.title,
    description: meta.description,
    canonicalPath: path,
    ogImage: meta.ogImageUrl,
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Discover', path: '/discover' },
        { name: displayName, path },
      ]),
      musicGroupJsonLd({
        name: displayName,
        description: meta.description,
        path,
        image: meta.ogImageUrl,
        genre: profile?.genres?.[0],
      }),
    ],
  }
}

export function usePageMeta(
  slug: string | undefined,
  meta: ArtistShareMeta | null,
  profile?: { genres?: string[] }
) {
  useSeo(slug && meta ? artistShareToSeo(slug, meta, profile) : null)
}
