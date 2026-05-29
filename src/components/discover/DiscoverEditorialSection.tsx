import { useCallback } from 'react'
import { getFeatures } from '@/api/endpoints'
import { GatedLink } from '@/components/auth/GatedLink'
import { useContent } from '@/hooks/useContent'
import type { Feature } from '@/types'
import '@/styles/editorial-desk.css'

function featureViews(slug: string): string {
  let h = 0
  for (let i = 0; i < slug.length; i++) h = (h + slug.charCodeAt(i) * 31) % 100000
  const n = 1200 + (h % 18000)
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n)
}

function featureDate(slug: string): string {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const day = 1 + (slug.length % 28)
  return `${months[slug.charCodeAt(0) % months.length]!} ${day}, 2026`
}

function readLabel(readTime: string): string {
  const t = readTime.trim()
  if (/min/i.test(t)) return t.replace(/\s*min\s*/i, ' MIN READ').toUpperCase()
  return `${t.toUpperCase()} READ`
}

function BookmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M4 2.5h8v11.5l-4-2.5-4 2.5V2.5z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ReadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1" />
      <path d="M6 3.5V6l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

function ViewsIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M1 6s2-3.5 5-3.5 5 3.5 5 3.5-2 3.5-5 3.5S1 6 1 6z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="6" cy="6" r="1.5" fill="currentColor" />
    </svg>
  )
}

function FlameIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M6 10.5c2-1.5 2.5-3.5 1.5-5 .5 0 1-1.5.5-2.5 1 .5 1.5 2 1 3.5-.5 2-2 3.5-3.5 4.5z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EditorialListRow({ feature, index }: { feature: Feature; index: number }) {
  return (
    <div className="ed-desk__row">
      <GatedLink
        to={`/feature/${feature.slug}`}
        forceGate
        className="ed-desk__row-link"
        aria-label={feature.title}
      >
        <span className="ed-desk__row-idx">{String(index).padStart(2, '0')}</span>
        <img src={feature.image} alt="" loading="lazy" className="ed-desk__row-thumb" />
        <div className="ed-desk__row-body">
          <p className="ed-desk__row-cat">{feature.category}</p>
          <p className="ed-desk__row-title">{feature.title}</p>
          <p className="ed-desk__row-meta">
            <span>
              <ReadIcon />
              {readLabel(feature.readTime)}
            </span>
            <span>
              <ViewsIcon />
              {featureViews(feature.slug)} views
            </span>
          </p>
        </div>
      </GatedLink>
      <button
        type="button"
        className="ed-desk__bookmark"
        aria-label={`Save ${feature.title}`}
        onClick={(e) => e.preventDefault()}
      >
        <BookmarkIcon />
      </button>
    </div>
  )
}

export function DiscoverEditorialSection() {
  const features = useContent(useCallback(() => getFeatures(), []))

  if (features.loading && !features.data) {
    return <p className="disco-loading">Loading editorial…</p>
  }
  if (!features.data?.length) return null

  const lead = features.data[0]!
  const rest = features.data.slice(1, 6)

  return (
    <section id="discover-editorial" className="ed-desk-sec scroll-mt-24">
      <header className="ed-desk-sec__head">
        <div className="ed-desk-sec__brand">
          <span className="ed-desk-sec__idx" aria-hidden>
            01
          </span>
          <div>
            <p className="ed-desk-sec__tag">Desk</p>
            <h2 className="ed-desk-sec__title">Editorial</h2>
            <p className="ed-desk-sec__sub">
              Features, reviews, and scene intelligence.
            </p>
          </div>
        </div>
        <GatedLink to="/features" forceGate className="ed-desk__all-btn">
          All features
          <span className="ed-desk__all-btn-icon" aria-hidden>
            →
          </span>
        </GatedLink>
      </header>

      <div className="ed-desk__grid">
        <GatedLink to={`/feature/${lead.slug}`} forceGate className="ed-desk__lead">
          <img src={lead.image} alt="" loading="lazy" className="ed-desk__lead-img" />
          <div className="ed-desk__lead-scrim" aria-hidden />
          <div className="ed-desk__lead-body">
            <span className="ed-desk__feature-tag">Feature</span>
            <h3 className="ed-desk__lead-title">{lead.title}</h3>
            <p className="ed-desk__lead-excerpt">{lead.excerpt}</p>
          </div>
          <div className="ed-desk__lead-foot">
            <div className="ed-desk__lead-brand">
              <span className="ed-desk__ios-mark">IOS</span>
              <span className="ed-desk__lead-desk">IOS Editorial</span>
              <span className="ed-desk__lead-date">{featureDate(lead.slug)}</span>
            </div>
            <div className="ed-desk__lead-stats">
              <span>
                <ReadIcon />
                {readLabel(lead.readTime)}
              </span>
              <span>
                <ViewsIcon />
                {featureViews(lead.slug)} views
              </span>
              <span className="ed-desk__trending">
                <FlameIcon />
                Trending
              </span>
            </div>
            <span className="ed-desk__lead-arrow" aria-hidden>
              ↗
            </span>
          </div>
        </GatedLink>

        <div className="ed-desk__stack">
          {rest.map((f, i) => (
            <EditorialListRow key={f.slug} feature={f} index={i + 2} />
          ))}
        </div>
      </div>
    </section>
  )
}
