import { useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useContent } from '@/hooks/useContent'
import { getFeature, getFeatures } from '@/api/endpoints'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'
import { RichTextContent } from '@/components/editor/RichTextContent'
import { EditorByline } from '@/components/editor/EditorByline'
import { EditorialMediaBlock } from '@/components/editorial/EditorialMediaBlock'
import { EditorialRelatedLinks } from '@/components/seo/EditorialRelatedLinks'
import { useSeo } from '@/hooks/useSeo'
import { articleJsonLd, breadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { SITE_NAME } from '@/lib/seo/urls'

export default function FeatureDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const fetcher = useCallback(() => getFeature(slug!), [slug])
  const { data: feature, loading, error } = useContent(fetcher)
  const { data: allFeatures } = useContent(useCallback(() => getFeatures(), []))

  const seo = useMemo(() => {
    if (!slug || !feature) return null
    const path = `/feature/${slug}`
    return {
      title: `${feature.title} | ${SITE_NAME}`,
      description: feature.excerpt,
      canonicalPath: path,
      ogImage: feature.image,
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
          author: feature.authorName ?? feature.author,
          section: feature.category,
        }),
      ],
    }
  }, [slug, feature])

  useSeo(seo)

  if (loading) return <LoadingTransmission variant="hell" />
  if (error || !feature) {
    return (
      <div className="section-padding pt-32 text-center">
        <p className="text-crimson">Editorial not found.</p>
        <Link to="/features" className="text-neon text-sm mt-4 inline-block">
          ← All Features
        </Link>
      </div>
    )
  }

  const hasBody = feature.body?.trim().length > 0

  return (
    <article className="pt-20">
      <div className="relative h-[50vh] overflow-hidden">
        <IOSImage
          src={feature.image}
          alt={feature.title}
          width={1400}
          height={788}
          priority
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent" />
      </div>
      <div className="section-padding max-w-3xl mx-auto">
        <span className="text-[10px] tracking-[0.3em] text-neon uppercase">
          {feature.category}
        </span>
        <h1 className="font-display text-4xl md:text-6xl font-bold mt-4">
          {feature.title}
        </h1>
        {feature.subject && (
          <p className="text-lg text-rs-red font-serif italic mt-3">{feature.subject}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-sm text-muted">
          <EditorByline
            name={feature.authorName}
            username={feature.authorUsername}
            fallback={feature.author}
          />
          <span aria-hidden>·</span>
          <span>{feature.readTime}</span>
        </div>
        <p className="text-lg text-muted mt-8 leading-relaxed">{feature.excerpt}</p>
        <div className="mt-12 border-t border-border pt-10">
          {hasBody ? (
            <RichTextContent html={feature.body} className="ios-prose-feature" />
          ) : (
            <p className="text-muted text-sm leading-relaxed">
              Full article text is not available for this entry yet.
            </p>
          )}
          <EditorialMediaBlock
            spotifyUrl={feature.spotifyUrl}
            youtubeUrl={feature.youtubeUrl}
            galleryImageUrls={feature.galleryImageUrls}
          />
        </div>
        {allFeatures && slug && (
          <EditorialRelatedLinks
            currentSlug={slug}
            items={allFeatures.map((f) => ({ slug: f.slug, title: f.title }))}
          />
        )}
      </div>
    </article>
  )
}
