import { useEffect } from 'react'
import type { ArtistShareMeta } from '@/lib/share/artistShareMeta'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta(meta: ArtistShareMeta | null) {
  useEffect(() => {
    if (!meta) return

    const prevTitle = document.title
    document.title = meta.title

    setMeta('name', 'description', meta.description)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', 'Institute of Sound')
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('property', 'og:url', meta.canonicalUrl)
    setMeta('property', 'og:image', meta.ogImageUrl)
    setMeta('name', 'twitter:card', meta.twitterCard)
    setMeta('name', 'twitter:title', meta.title)
    setMeta('name', 'twitter:description', meta.description)
    setMeta('name', 'twitter:image', meta.ogImageUrl)

    return () => {
      document.title = prevTitle
    }
  }, [meta])
}
