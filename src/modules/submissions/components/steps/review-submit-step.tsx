import { Disc3, HelpCircle, Lock, Send } from 'lucide-react'
import { formatInr } from '@/modules/submissions/lib/submission-catalog'
import { formatDuration } from '@/modules/submissions/lib/submission-mapper'
import { ReviewSummaryCard } from '@/modules/submissions/components/review/review-summary-card'
import type { SubmissionWizardState } from '@/modules/submissions/hooks/use-submission-wizard'
import { Button } from '@/shared/components/ui/button'

interface ReviewSubmitStepProps {
  wizard: SubmissionWizardState
  onSubmit: () => void
  isSubmitting: boolean
}

export function ReviewSubmitStep({ wizard, onSubmit, isSubmitting }: ReviewSubmitStepProps) {
  const { selectedRelease, selectedDestinations, selectedBoosts, totalBoostCost, goToStep } = wizard
  const track = selectedRelease?.tracks[0]

  return (
    <section className="sub-panel" aria-labelledby="sub-step-review-title">
      <header className="sub-panel__header">
        <div>
          <h2 id="sub-step-review-title" className="sub-panel__title">
            4 Review & Submit
          </h2>
          <p className="sub-panel__subtitle">Review your selections and submit your release.</p>
        </div>
      </header>

      <div className="sub-panel__body space-y-4">
        <div className="sub-review-grid">
          <ReviewSummaryCard title="Release" onEdit={() => goToStep('release')} editLabel="Edit Release">
            {selectedRelease ? (
              <div className="flex gap-3">
                {selectedRelease.coverUrl ? (
                  <img src={selectedRelease.coverUrl} alt="" className="size-12 rounded-md object-cover" />
                ) : (
                  <span className="grid size-12 place-items-center rounded-md bg-muted text-muted-foreground">
                    <Disc3 className="size-5" />
                  </span>
                )}
                <div>
                  <p className="font-semibold">{track?.title ?? selectedRelease.title}</p>
                  <p className="text-xs text-muted-foreground">{selectedRelease.artistName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedRelease.genre} · {formatDuration(track?.durationSec)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No release selected</p>
            )}
          </ReviewSummaryCard>

          <ReviewSummaryCard
            title="Destinations"
            onEdit={() => goToStep('destinations')}
            editLabel="Edit Destinations"
          >
            <ul className="sub-review-card__list">
              {selectedDestinations.length === 0 ? (
                <li>None selected</li>
              ) : (
                selectedDestinations.map((d) => <li key={d.id}>{d.title}</li>)
              )}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">{selectedDestinations.length} selected</p>
          </ReviewSummaryCard>

          <ReviewSummaryCard
            title="Boost Visibility"
            onEdit={() => goToStep('boost')}
            editLabel="Edit Boost Options"
          >
            <ul className="sub-review-card__list">
              {selectedBoosts.length === 0 ? (
                <li>No boosts selected (preview)</li>
              ) : (
                selectedBoosts.map((b) => (
                  <li key={b.id}>
                    <strong>{b.title}</strong> — {formatInr(b.priceInr)}
                  </li>
                ))
              )}
            </ul>
            {totalBoostCost > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Preview total: {formatInr(totalBoostCost)}
              </p>
            ) : null}
          </ReviewSummaryCard>

          <ReviewSummaryCard title="Release Details" onEdit={() => goToStep('release')} editLabel="Edit Details">
            <ul className="sub-review-card__list">
              <li>
                <strong>Genre:</strong> {selectedRelease?.genre ?? '—'}
              </li>
              <li>
                <strong>Sub-genre:</strong> —
              </li>
              <li>
                <strong>Language:</strong> —
              </li>
              <li>
                <strong>Explicit:</strong> —
              </li>
              <li>
                <strong>Release Date:</strong>{' '}
                {selectedRelease?.releaseDate
                  ? new Date(selectedRelease.releaseDate).toLocaleDateString()
                  : '—'}
              </li>
              <li>
                <strong>ISRC:</strong> —
              </li>
            </ul>
          </ReviewSummaryCard>
        </div>

        <div className="sub-deck">
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="size-3.5" aria-hidden />
              Secure & Private
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HelpCircle className="size-3.5" aria-hidden />
              Need Help?
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button type="button" size="lg" onClick={onSubmit} disabled={isSubmitting || !selectedRelease}>
              <Send className="size-4" />
              {isSubmitting ? 'Submitting…' : 'Submit Release'}
            </Button>
            <p className="text-xs text-muted-foreground">You won&apos;t be able to edit after submission.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
