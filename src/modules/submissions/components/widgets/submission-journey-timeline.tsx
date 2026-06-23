import { SUBMISSION_JOURNEY_STEPS } from '@/modules/submissions/types/submission-wizard.types'
import { cn } from '@/shared/lib/cn'

export function SubmissionJourneyTimeline() {
  return (
    <div className="sub-widget">
      <h3 className="sub-widget__title">Submission Journey</h3>
      <ol className="sub-journey">
        {SUBMISSION_JOURNEY_STEPS.map((label, index) => (
          <li
            key={label}
            className={cn('sub-journey__step', index === 0 && 'sub-journey__step--active')}
          >
            <span className="sub-journey__dot" aria-hidden />
            <span className="sub-journey__label">{label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
