import { useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useContent } from '@/hooks/useContent'
import { getFeature, getFeatures } from '@/api/endpoints'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'
import { IOSImage } from '@/components/ui/IOSImage'
import { RichTextContent } from '@/components/editor/RichTextContent'
import { EditorByline } from '@/components/editor/EditorByline'
import {
  EditorialMediaBlock,
  hasEditorialMedia,
} from '@/components/editorial/EditorialMediaBlock'
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
  const showSidebar = hasEditorialMedia(
    feature.spotifyUrl,
    feature.youtubeUrl,
    feature.galleryImageUrls
  )

  return (
    <article className="editorial-article">
      <header className="editorial-article-hero">
        <IOSImage
          src={feature.image}
          alt=""
          width={1600}
          height={900}
          priority
          className="editorial-article-hero-img"
        />
        <div className="editorial-article-hero-scrim" aria-hidden />
        <div className="editorial-article-hero-inner section-padding">
          <Link to="/features" className="editorial-article-back">
            ← Editorial
          </Link>
          <span className="editorial-article-category">{feature.category}</span>
          <h1 className="editorial-article-title">{feature.title}</h1>
          {feature.subject && (
            <p className="editorial-article-dek">{feature.subject}</p>
          )}
          <div className="editorial-article-meta">
            <EditorByline
              name={feature.authorName}
              username={feature.authorUsername}
              fallback={feature.author}
            />
            <span aria-hidden>·</span>
            <span>{feature.readTime}</span>
          </div>
        </div>
      </header>

      <div className="editorial-article-body section-padding">
        <div className="editorial-article-container">
          <p className="editorial-article-lead">{feature.excerpt}</p>

          <div
            className={
              showSidebar
                ? 'editorial-article-columns'
                : 'editorial-article-columns editorial-article-columns--solo'
            }
          >
            <div className="editorial-article-main">
              {showSidebar && (
                <div className="editorial-article-aside-mobile">
                  <EditorialMediaBlock
                    layout="sidebar"
                    spotifyUrl={feature.spotifyUrl}
                    youtubeUrl={feature.youtubeUrl}
                    galleryImageUrls={feature.galleryImageUrls}
                  />
                </div>
              )}

              <div className="editorial-article-prose-wrap">
                {hasBody ? (
                  <RichTextContent html={feature.body} className="ios-prose-feature" />
                ) : (
                  <p className="text-muted text-sm leading-relaxed">
                    Full article text is not available for this entry yet.
                  </p>
                )}
              </div>
            </div>

            {showSidebar && (
              <div className="editorial-article-aside">
                <div className="editorial-article-aside-sticky">
                  <EditorialMediaBlock
                    layout="sidebar"
                    spotifyUrl={feature.spotifyUrl}
                    youtubeUrl={feature.youtubeUrl}
                    galleryImageUrls={feature.galleryImageUrls}
                  />
                </div>
              </div>
            )}
          </div>

          {allFeatures && slug && (
            <EditorialRelatedLinks
              currentSlug={slug}
              items={allFeatures.map((f) => ({ slug: f.slug, title: f.title }))}
            />
          )}
        </div>
      </div>
    </article>
  )
}
