import { useEffect } from 'react'

export interface PageMeta {
  title: string
  description?: string
  imageUrl?: string
  url?: string
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

export function usePageMeta(meta: PageMeta | null) {
  useEffect(() => {
    if (!meta) return

    const previousTitle = document.title
    document.title = meta.title

    if (meta.description) {
      upsertMeta('name', 'description', meta.description)
      upsertMeta('property', 'og:description', meta.description)
      upsertMeta('name', 'twitter:description', meta.description)
    }

    upsertMeta('property', 'og:title', meta.title)
    upsertMeta('name', 'twitter:title', meta.title)
    upsertMeta('property', 'og:type', 'article')
    upsertMeta('property', 'og:site_name', 'Institute of Sound')

    if (meta.url) {
      upsertMeta('property', 'og:url', meta.url)
    }

    if (meta.imageUrl) {
      upsertMeta('property', 'og:image', meta.imageUrl)
      upsertMeta('name', 'twitter:image', meta.imageUrl)
      upsertMeta('name', 'twitter:card', 'summary_large_image')
    } else {
      upsertMeta('name', 'twitter:card', 'summary')
    }

    return () => {
      document.title = previousTitle
    }
  }, [meta])
}
