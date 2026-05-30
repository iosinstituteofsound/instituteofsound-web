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

  return (
    <aside className="artist-page-rules ios-panel ios-panel-accent" aria-labelledby="artist-page-rules-title">
      <p id="artist-page-rules-title" className="text-xs uppercase tracking-widest text-signal mb-2">
        {variant === 'create' ? 'Before you create your page' : 'Artist page policy'}
      </p>
      <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
        {ARTIST_PAGE_RULES.onCreate.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="text-xs text-muted mt-3">
        <strong className="text-foreground">Counts as activity:</strong>{' '}
        {ARTIST_PAGE_RULES.activityExamples} Use <strong className="text-foreground">Page update</strong>{' '}
        in My Studio to save profile changes.
      </p>
      <p className="text-xs text-muted mt-2">
        Draft window: <strong className="text-foreground">{draftDays} days</strong> · Activity window:{' '}
        <strong className="text-foreground">{activityDays} days</strong>
      </p>
    </aside>
  )
}
