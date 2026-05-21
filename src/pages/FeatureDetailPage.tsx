import { useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useContent } from '@/hooks/useContent'
import { getFeature } from '@/api/endpoints'
import { LoadingTransmission } from '@/components/ui/LoadingTransmission'

export default function FeatureDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const fetcher = useCallback(() => getFeature(slug!), [slug])
  const { data: feature, loading, error } = useContent(fetcher)

  if (loading) return <LoadingTransmission />
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

  return (
    <article className="pt-20">
      <div className="relative h-[50vh] overflow-hidden">
        <img
          src={feature.image}
          alt={feature.title}
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
        <div className="flex gap-4 mt-4 text-sm text-muted">
          <span>{feature.author}</span>
          <span>·</span>
          <span>{feature.readTime}</span>
        </div>
        <p className="text-lg text-muted mt-8 leading-relaxed">{feature.excerpt}</p>
        <div className="mt-12 p-8 border border-border text-muted text-sm leading-relaxed">
          <p>
            [Full editorial content loads from CMS/API in production. This mock
            endpoint returns metadata only — connect Strapi, Supabase, or custom
            Node backend to serve complete articles dynamically.]
          </p>
        </div>
        <Link
          to="/features"
          className="inline-block mt-8 text-xs tracking-widest text-muted hover:text-neon"
        >
          ← All Features
        </Link>
      </div>
    </article>
  )
}
