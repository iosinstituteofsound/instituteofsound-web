import { Info } from 'lucide-react'
import { SUBMISSION_BOOST_OPTIONS, formatInr } from '@/modules/submissions/lib/submission-catalog'
import { BoostCard } from '@/modules/submissions/components/boost-visibility/boost-card'
import type { SubmissionWizardState } from '@/modules/submissions/hooks/use-submission-wizard'
import { Button } from '@/shared/components/ui/button'

interface BoostVisibilityStepProps {
  wizard: SubmissionWizardState
  onContinue: () => void
}

export function BoostVisibilityStep({ wizard, onContinue }: BoostVisibilityStepProps) {
  const { boostIds, toggleBoost, totalBoostCost } = wizard

  return (
    <section className="sub-panel" aria-labelledby="sub-step-boost-title">
      <header className="sub-panel__header">
        <div>
          <h2 id="sub-step-boost-title" className="sub-panel__title">
            3 Boost Visibility
          </h2>
          <p className="sub-panel__subtitle">Increase your chances of getting noticed.</p>
        </div>
        <span className="sub-mock-badge">Coming soon — preview only</span>
      </header>

      <div className="sub-panel__body space-y-4">
        <div className="sub-card-scroll">
          {SUBMISSION_BOOST_OPTIONS.map((boost) => (
            <BoostCard
              key={boost.id}
              boost={boost}
              selected={boostIds.includes(boost.id)}
              onToggle={() => toggleBoost(boost.id)}
            />
          ))}
        </div>

        <div className="sub-boost-footer">
          <div className="sub-boost-footer__info">
            <Info className="size-4 shrink-0 text-primary" aria-hidden />
            <span>
              Create a powerful first impression with optional promotional add-ons. Selections are
              for preview only — payment is not enabled yet.
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <div className="sub-boost-footer__total-label">Total Boost Cost</div>
              <div className="sub-boost-footer__total-value">{formatInr(totalBoostCost)}</div>
            </div>
            <Button type="button" onClick={onContinue}>
              Continue to Review →
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
