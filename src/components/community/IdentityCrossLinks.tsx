import { Link } from 'react-router-dom'
import clsx from 'clsx'
import { artistPagePath } from '@/lib/artist-profile/networkLink'
import { networkProfilePath } from '@/lib/community/networkPaths'

interface IdentityCrossLinksProps {
  artistSlug?: string | null
  networkHandle?: string | null
  className?: string
  compact?: boolean
}

/**
 * Phase 6: ties together public artist catalog page and network social profile.
 */
export function IdentityCrossLinks({
  artistSlug,
  networkHandle,
  className,
  compact = false,
}: IdentityCrossLinksProps) {
  const hasArtist = Boolean(artistSlug?.trim())
  const hasNetwork = Boolean(networkHandle?.trim())

  if (!hasArtist && !hasNetwork) return null

  return (
    <nav
      className={clsx('identity-cross-links', compact && 'identity-cross-links-compact', className)}
      aria-label="Related profiles"
    >
      {hasArtist && (
        <Link to={artistPagePath(artistSlug!)} className="identity-cross-links-item">
          Artist page →
        </Link>
      )}
      {hasArtist && hasNetwork && <span className="identity-cross-links-sep" aria-hidden />}
      {hasNetwork && (
        <Link to={networkProfilePath(networkHandle!)} className="identity-cross-links-item">
          Network profile →
        </Link>
      )}
    </nav>
  )
}
