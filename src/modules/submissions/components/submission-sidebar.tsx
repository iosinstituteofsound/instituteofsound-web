import { FileText } from 'lucide-react'
import type { SubmissionWizardState } from '@/modules/submissions/hooks/use-submission-wizard'
import { EstimatedReachWidget } from '@/modules/submissions/components/widgets/estimated-reach-widget'
import { EvaluationScoreWidget } from '@/modules/submissions/components/widgets/evaluation-score-widget'
import { SubmissionJourneyTimeline } from '@/modules/submissions/components/widgets/submission-journey-timeline'

interface SubmissionSidebarProps {
  wizard: SubmissionWizardState
}

export function SubmissionSidebar({ wizard }: SubmissionSidebarProps) {
  const { selectedRelease, selectedDestinations, selectedBoosts, estimatedReach, evaluationMetrics, evaluationPercent } =
    wizard

  return (
    <aside className="sub-wizard__sidebar" aria-label="Submission summary">
      <div className="sub-widget">
        <h3 className="sub-widget__title">
          {selectedDestinations.length} destination{selectedDestinations.length === 1 ? '' : 's'} selected
        </h3>
        {!selectedRelease && selectedDestinations.length === 0 ? (
          <div className="sub-widget__empty">
            <FileText className="size-5 opacity-60" aria-hidden />
            <span>No destinations selected yet.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedRelease ? (
              <div className="flex items-center gap-2.5">
                {selectedRelease.coverUrl ? (
                  <img
                    src={selectedRelease.coverUrl}
                    alt=""
                    className="size-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="size-10 rounded-md bg-muted" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{selectedRelease.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedRelease.artistName ?? 'Artist'}
                  </p>
                </div>
              </div>
            ) : null}
            {selectedDestinations.length > 0 ? (
              <div className="sub-summary-chips">
                {selectedDestinations.map((d) => (
                  <span key={d.id} className="sub-summary-chip">
                    {d.title}
                  </span>
                ))}
              </div>
            ) : null}
            {selectedBoosts.length > 0 ? (
              <div className="text-xs text-muted-foreground">
                Boost preview: {selectedBoosts.map((b) => b.title).join(', ')}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <EstimatedReachWidget reach={estimatedReach} />
      <EvaluationScoreWidget metrics={evaluationMetrics} percent={evaluationPercent} />
      <SubmissionJourneyTimeline />
    </aside>
  )
}
