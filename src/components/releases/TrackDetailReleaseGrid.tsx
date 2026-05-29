import { Link } from 'react-router-dom'
import { IOSImage } from '@/components/ui/IOSImage'
import { catalogCardHref } from '@/lib/discovery/trackPaths'
import type { DiscoverPremiereCard } from '@/lib/discovery/premieres'

interface TrackDetailReleaseGridProps {
  id: string
  title: string
  viewAllHref: string
  viewAllLabel?: string
  cards: DiscoverPremiereCard[]
  releaseTypeLabel: (rt: 'album' | 'ep' | 'single') => string
  className?: string
}

export function TrackDetailReleaseGrid({
  id,
  title,
  viewAllHref,
  viewAllLabel = 'View all →',
  cards,
  releaseTypeLabel,
  className = '',
}: TrackDetailReleaseGridProps) {
  if (cards.length === 0) return null

  return (
    <section
      className={`tk-more-section ${className}`.trim()}
      aria-labelledby={id}
    >
      <div className="tk-section-head">
        <h2 id={id}>{title}</h2>
        <Link to={viewAllHref}>{viewAllLabel}</Link>
      </div>
      <div className="tk-more-grid">
        {cards.map((card) => (
          <Link
            key={card.trackId}
            to={catalogCardHref(card)}
            className="tk-more-card"
          >
            <div className="tk-more-card__cover-wrap">
              {card.coverUrl ? (
                <IOSImage
                  src={card.coverUrl}
                  alt=""
                  width={200}
                  className="tk-more-card__cover"
                />
              ) : (
                <div
                  className="tk-more-card__cover tk-hero__cover-fb"
                  style={{ fontSize: '1.25rem' }}
                  aria-hidden
                >
                  {card.trackTitle.slice(0, 1)}
                </div>
              )}
            </div>
            <span className="tk-more-card__title">{card.trackTitle}</span>
            <span className="tk-more-card__sub">
              {releaseTypeLabel(card.releaseType)} · {card.artistName}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
