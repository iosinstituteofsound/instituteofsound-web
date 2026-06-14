import { Link } from 'react-router-dom'
import { tribeSlugFromGenreLabel, tribeBoardPath } from '@/lib/editorial/tagBridge'

interface EditorialTribeBridgeProps {
  genreLabel?: string | null
  className?: string
}

export function EditorialTribeBridge({ genreLabel, className }: EditorialTribeBridgeProps) {
  const slug = tribeSlugFromGenreLabel(genreLabel)
  if (!slug) return null

  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <p className={className ?? 'editorial-tribe-bridge text-sm text-muted mt-3'}>
      <span className="text-muted">Tribe on the wire · </span>
      <Link to={tribeBoardPath(slug)} className="editorial-tribe-bridge-link">
        {name} leaderboard →
      </Link>
    </p>
  )
}
