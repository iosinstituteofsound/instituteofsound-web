import { useEffect, useId } from 'react'
import type { JsonLdObject, SeoConfig } from '@/lib/seo/types'
import { SITE_NAME, absoluteUrl, defaultOgImage, pathUrl } from '@/lib/seo/urls'

const DEFAULT_DESCRIPTION =
  'Institute of Sound — underground music magazine. Reviews, features, bands, and culture.'

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

function setLink(rel: string, href: string) {
  const selector = `link[rel="${rel}"]`
  let el = document.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function normalizeJsonLd(jsonLd?: SeoConfig['jsonLd']): JsonLdObject[] {
  if (!jsonLd) return []
  if (Array.isArray(jsonLd)) {
    return jsonLd.flatMap((item) => (Array.isArray(item) ? item : [item]))
  }
  return [jsonLd]
}

function injectJsonLd(scripts: Record<string, unknown>[], scriptId: string) {
  const existing = document.getElementById(scriptId)
  existing?.remove()

  scripts.forEach((data, index) => {
    const el = document.createElement('script')
    el.id = index === 0 ? scriptId : `${scriptId}-${index}`
    el.type = 'application/ld+json'
    el.textContent = JSON.stringify(data)
    document.head.appendChild(el)
  })
}

function removeJsonLd(scriptId: string) {
  document.querySelectorAll(`[id^="${scriptId}"]`).forEach((el) => el.remove())
}

export function useSeo(config: SeoConfig | null) {
  const scriptId = useId().replace(/:/g, '')

  useEffect(() => {
    if (!config) return

    const prevTitle = document.title
    const canonical = pathUrl(config.canonicalPath)
    const description = config.description || DEFAULT_DESCRIPTION
    const ogImage = config.ogImage ? absoluteUrl(config.ogImage) : defaultOgImage()
    const robots = config.robots ?? 'index, follow'
    const ogType = config.ogType ?? 'website'

    document.title = config.title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', robots)
    setLink('canonical', canonical)

    setMeta('property', 'og:type', ogType)
    setMeta('property', 'og:site_name', SITE_NAME)
    setMeta('property', 'og:title', config.title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', canonical)
    setMeta('property', 'og:image', ogImage)
    setMeta('property', 'og:image:secure_url', ogImage)
    if (config.ogImageAlt) {
      setMeta('property', 'og:image:alt', config.ogImageAlt)
      setMeta('name', 'twitter:image:alt', config.ogImageAlt)
    }
    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', config.title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', ogImage)

    const ld = normalizeJsonLd(config.jsonLd)
    if (ld.length > 0) injectJsonLd(ld, `jsonld-${scriptId}`)

    return () => {
      document.title = prevTitle
      removeJsonLd(`jsonld-${scriptId}`)
    }
  }, [config, scriptId])
}
