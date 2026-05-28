import { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getFeature, getFeatures } from '@/api/endpoints'
import { RichTextContent } from '@/components/editor/RichTextContent'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { useContent } from '@/hooks/useContent'
import { useSeo } from '@/hooks/useSeo'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { SITE_NAME } from '@/lib/seo/urls'

export default function FeatureDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: feature, loading, error } = useContent(
    useCallback(() => getFeature(slug!), [slug]),
  )
  const { data: allFeatures } = useContent(useCallback(() => getFeatures(), []))

  const seo = useMemo(() => {
    if (!slug || !feature) return null
    const path = `/feature/${slug}`
    return {
      title: `${feature.title} | ${SITE_NAME}`,
      description: feature.excerpt,
      canonicalPath: path,
      ogImage: feature.image,
      ogImageAlt: feature.title,
      ogType: 'article' as const,
      jsonLd: [
        breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Features', path: '/features' },
          { name: feature.title, path },
        ]),
        articleJsonLd({
          headline: feature.title,
          description: feature.excerpt,
          path,
          image: feature.image,
          author: feature.author,
          section: feature.category,
        }),
      ],
    }
  }, [slug, feature])

  useSeo(seo)

  if (loading) return <LoadingTransmission variant="hell" />
  if (error || !feature) {
    return (
      <div className="p-8 text-center">
        <p className="text-mh-red">Editorial not found.</p>
        <Link to="/features" className="mt-4 inline-block text-sm text-mh-red">
          ← All Features
        </Link>
      </div>
    )
  }

  const related = allFeatures?.filter((f) => f.slug !== slug).slice(0, 4) ?? []

  return (
    <article className="editorial-article">
      <header className="editorial-article-hero">
        <img src={feature.image} alt="" className="editorial-article-hero-img" />
        <div className="editorial-article-hero-scrim" aria-hidden />
        <div className="editorial-article-hero-inner px-4 sm:px-6 lg:px-8">
          <Link to="/features" className="editorial-article-back">
            ← Editorial
          </Link>
          <span className="editorial-article-category">{feature.category}</span>
          <h1 className="editorial-article-title">{feature.title}</h1>
          {feature.subject && <p className="editorial-article-dek">{feature.subject}</p>}
          <div className="editorial-article-meta">
            <span>{feature.author}</span>
            <span aria-hidden>·</span>
            <span>{feature.readTime}</span>
          </div>
        </div>
      </header>

      <div className="editorial-article-body px-4 pb-12 sm:px-6 lg:px-8">
        <div className="editorial-article-container">
          <p className="editorial-article-lead">{feature.excerpt}</p>
          {feature.body?.trim() ? (
            <RichTextContent
              html={feature.body}
              className="editorial-article-prose mt-8 max-w-3xl text-signal/90 leading-relaxed"
            />
          ) : (
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">
              Full article text for this feature is coming from the editorial desk. The excerpt
              above is live — check back after the next publish cycle.
            </p>
          )}

          {related.length > 0 && (
            <aside className="mt-16 border-t border-border pt-10">
              <p className="ios-kicker mb-6">More editorial</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {related.map((f) => (
                  <li key={f.id}>
                    <Link
                      to={`/feature/${f.slug}`}
                      className="block rounded border border-border bg-surface p-4 transition-colors hover:border-mh-red/40"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-mh-red">
                        {f.category}
                      </span>
                      <p className="mt-2 font-display text-sm font-bold uppercase text-signal">
                        {f.title}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </article>
  )
}
