import { useState } from 'react'
import { GatedLink } from '@/components/auth/GatedLink'
import { IOSImage } from '@/components/ui/IOSImage'
import { catalogCardHref } from '@/lib/discovery/trackPaths'
import {
  formatPlayCount,
  formatPremiereDate,
  type DiscoverPremiereCard,
  type PremiereBadge,
} from '@/lib/discovery/premieres'

const BADGE_LABEL: Record<PremiereBadge, string> = {
  wire_pick: 'Wire pick',
  hot: 'Hot',
  new: 'New',
}

interface PremiereCardProps {
  card: DiscoverPremiereCard
  headingLevel?: 'h2' | 'h3'
  className?: string
}

export function PremiereCard({ card, headingLevel = 'h3', className }: PremiereCardProps) {
  const [coverBroken, setCoverBroken] = useState(false)
  const isAlbum = card.catalogKind === 'album'
  const badge = isAlbum
    ? card.releaseType === 'ep'
      ? 'EP'
      : 'Album'
    : card.badge
      ? BADGE_LABEL[card.badge]
      : card.isEditorPick
        ? 'Wire pick'
        : null
  const TitleTag = headingLevel
  const href = catalogCardHref(card)

  return (
    <GatedLink
      to={href}
      forceGate={false}
      className={className ?? 'prem-card'}
      aria-label={`${card.trackTitle} by ${card.artistName}`}
    >
      <article className="prem-card__inner">
        <div className="prem-card__art">
          {badge && <span className="prem-card__badge">{badge}</span>}
          {!isAlbum && (
            <span className="prem-card__play" aria-hidden>
              <PlayIcon />
            </span>
          )}
          {card.coverUrl && !coverBroken ? (
            <IOSImage
              src={card.coverUrl}
              alt={card.trackTitle}
              width={400}
              className="prem-card__img"
              onBroken={() => setCoverBroken(true)}
            />
          ) : (
            <div className="prem-card__art-fallback" aria-hidden>
              {card.trackTitle.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="prem-card__body">
          <p className="prem-card__genre">{card.genreLabel}</p>
          <TitleTag className="prem-card__title">{card.trackTitle}</TitleTag>
          <p className="prem-card__artist">{card.artistName}</p>
        </div>
        <footer className="prem-card__foot">
          <span className="prem-card__date">
            <CalendarIcon />
            {formatPremiereDate(card.trackCreatedAt)}
          </span>
          <span className="prem-card__plays">
            {isAlbum ? (
              card.albumTrackCount && card.albumTrackCount > 0
                ? `${card.albumTrackCount} tracks`
                : 'Full release'
            ) : (
              <>
                <MiniWave />
                {formatPlayCount(card.playCount)} plays
              </>
            )}
          </span>
          <span className="prem-card__ext" aria-hidden>
            ↗
          </span>
        </footer>
      </article>
    </GatedLink>
  )
}

function MiniWave() {
  return (
    <span className="prem-wave" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} />
      ))}
    </span>
  )
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 4.8v4.4l4-2.2-4-2.2z" fill="currentColor" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
      <rect x="1.5" y="2" width="8" height="7.5" rx="1" stroke="currentColor" strokeWidth="1" />
      <path d="M3.5 1v2M7.5 1v2M1.5 4.5h8" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
