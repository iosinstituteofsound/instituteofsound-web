import {
  ARTIST_PAGE_RULES,
  ARTIST_INCOMPLETE_DRAFT_MS,
  ARTIST_PAGE_ACTIVITY_MS,
} from '@/lib/artist-profile/pageLifecycle'

interface ArtistPageRulesCalloutProps {
  variant?: 'create' | 'studio'
}

export function ArtistPageRulesCallout({ variant = 'studio' }: ArtistPageRulesCalloutProps) {
  const draftDays = Math.round(ARTIST_INCOMPLETE_DRAFT_MS / (24 * 60 * 60 * 1000))
  const activityDays = Math.round(ARTIST_PAGE_ACTIVITY_MS / (24 * 60 * 60 * 1000))
  const defaultOpen = variant === 'create'

  return (
    <details
      className="artist-page-rules"
      open={defaultOpen}
    >
      <summary className="artist-page-rules-summary">
        <span>
          {variant === 'create' ? 'Before you create your page' : 'Page policy & activity rules'}
        </span>
        <span className="artist-page-rules-summary-meta">
          {draftDays}d draft · {activityDays}d activity
        </span>
      </summary>
      <div className="artist-page-rules-body">
        <ul className="artist-page-rules-list">
          {ARTIST_PAGE_RULES.onCreate.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="artist-page-rules-footnote">
          <strong>Counts as activity:</strong> {ARTIST_PAGE_RULES.activityExamples} Use{' '}
          <strong>Page update</strong> after profile edits.
        </p>
      </div>
    </details>
  )
}
