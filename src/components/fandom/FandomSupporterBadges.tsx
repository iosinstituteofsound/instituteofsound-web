import { Link } from 'react-router-dom'
import { MetalBadge } from '@/components/ui/MetalBadge'
import type { PublicSupporterBadgeOnArtist } from '@/lib/fandom/types'

interface FandomSupporterBadgeChipProps {
  label: string
  title?: string
  className?: string
}

export function FandomSupporterBadgeChip({
  label,
  title,
  className,
}: FandomSupporterBadgeChipProps) {
  return (
    <span title={title ?? label} className={className}>
      <MetalBadge variant="live">{label}</MetalBadge>
    </span>
  )
}

interface FandomSupporterBadgesListProps {
  badges: PublicSupporterBadgeOnArtist[]
  className?: string
}

export function FandomSupporterBadgesList({
  badges,
  className,
}: FandomSupporterBadgesListProps) {
  if (badges.length === 0) return null

  return (
    <ul
      className={className ?? 'flex flex-wrap gap-2 list-none p-0 m-0'}
      aria-label="Artist support badges"
    >
      {badges.map((b) => (
        <li key={b.artistProfileId}>
          <Link
            to={`/artists/${b.artistSlug}`}
            className="inline-flex items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-2 py-1 text-[11px] tracking-wide text-foreground/90 hover:border-mh-red/40 hover:text-mh-red transition-colors"
            title={`${b.badgeLabel} for ${b.artistDisplayName}`}
          >
            <span className="text-muted">{b.artistDisplayName}</span>
            <span className="text-mh-red font-semibold">{b.badgeLabel}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
