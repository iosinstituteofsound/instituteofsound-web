import { Link } from 'react-router-dom'
import { artistPagePath } from '@/lib/artist-profile/networkLink'
import { networkProfilePath } from '@/lib/community/networkPaths'
import { tribeBoardPath } from '@/lib/editorial/tagBridge'

interface EditorialSubjectLinksProps {
  subject?: string
  artistProfileSlug?: string
  artistProfileName?: string
  authorUsername?: string
  tribeSlug?: string
}

/**
 * Links editorial subject + featured artist to catalog / network where possible.
 */
export function EditorialSubjectLinks({
  subject,
  artistProfileSlug,
  artistProfileName,
  authorUsername,
  tribeSlug,
}: EditorialSubjectLinksProps) {
  const hasArtist = Boolean(artistProfileSlug?.trim())
  const hasAuthor = Boolean(authorUsername?.trim())
  const hasTribe = Boolean(tribeSlug?.trim())
  const subjectLabel = artistProfileName?.trim() || subject?.trim()

  if (!hasArtist && !hasAuthor && !subjectLabel && !hasTribe) return null

  return (
    <div className="editorial-subject-links ios-card">
      <p className="editorial-subject-links-kicker">On the wire</p>
      <ul className="editorial-subject-links-list">
        {subjectLabel && (
          <li>
            <span className="text-muted">Subject · </span>
            {hasArtist ? (
              <Link to={artistPagePath(artistProfileSlug!)} className="editorial-subject-links-a">
                {subjectLabel}
              </Link>
            ) : (
              <span className="text-signal">{subjectLabel}</span>
            )}
          </li>
        )}
        {hasArtist && (
          <li>
            <Link to={artistPagePath(artistProfileSlug!)} className="editorial-subject-links-a">
              Artist catalog →
            </Link>
          </li>
        )}
        {hasAuthor && (
          <li>
            <Link
              to={networkProfilePath(authorUsername!)}
              className="editorial-subject-links-a"
            >
              Editor @{authorUsername!.replace(/^@/, '')} on the network →
            </Link>
          </li>
        )}
        {hasTribe && (
          <li>
            <Link to={tribeBoardPath(tribeSlug!)} className="editorial-subject-links-a">
              {tribeSlug!.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}{' '}
              tribe board →
            </Link>
          </li>
        )}
      </ul>
    </div>
  )
}
