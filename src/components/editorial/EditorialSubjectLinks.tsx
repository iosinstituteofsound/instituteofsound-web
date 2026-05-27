import { Link } from 'react-router-dom'
import { artistPagePath } from '@/lib/artist-profile/networkLink'
import { networkProfilePath } from '@/lib/community/networkPaths'

interface EditorialSubjectLinksProps {
  subject?: string
  artistProfileSlug?: string
  artistProfileName?: string
  authorUsername?: string
}

/**
 * Links editorial subject + featured artist to catalog / network where possible.
 */
export function EditorialSubjectLinks({
  subject,
  artistProfileSlug,
  artistProfileName,
  authorUsername,
}: EditorialSubjectLinksProps) {
  const hasArtist = Boolean(artistProfileSlug?.trim())
  const hasAuthor = Boolean(authorUsername?.trim())
  const subjectLabel = artistProfileName?.trim() || subject?.trim()

  if (!hasArtist && !hasAuthor && !subjectLabel) return null

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
      </ul>
    </div>
  )
}
