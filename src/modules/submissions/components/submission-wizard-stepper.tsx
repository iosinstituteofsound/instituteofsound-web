import { Check } from 'lucide-react'
import type { SubmissionWizardStep } from '@/modules/submissions/types/submission-wizard.types'
import { SUBMISSION_WIZARD_STEPS } from '@/modules/submissions/types/submission-wizard.types'
import { cn } from '@/shared/lib/cn'

interface SubmissionWizardStepperProps {
  currentStep: SubmissionWizardStep
  completedSteps: SubmissionWizardStep[]
}

export function SubmissionWizardStepper({ currentStep, completedSteps }: SubmissionWizardStepperProps) {
  const currentIndex = SUBMISSION_WIZARD_STEPS.findIndex((s) => s.id === currentStep)

  return (
    <nav className="sub-stepper" aria-label="Submission progress">
      <ol className="sub-stepper__list">
        {SUBMISSION_WIZARD_STEPS.map((wizardStep, index) => {
          const isActive = wizardStep.id === currentStep
          const isCompleted = completedSteps.includes(wizardStep.id) && !isActive
          const isUpcoming = index > currentIndex && !isCompleted
          const connectorComplete = index < currentIndex || isCompleted

          return (
            <li key={wizardStep.id} className="sub-stepper__item">
              <div
                className={cn(
                  'sub-step',
                  isActive && 'sub-step--active',
                  isCompleted && 'sub-step--done',
                  isUpcoming && 'sub-step--upcoming',
                )}
              >
                <span className="sub-step__node">
                  {isCompleted ? <Check className="size-3.5" /> : String(index + 1)}
                </span>
                <span className="sub-step__label">{wizardStep.label}</span>
              </div>
              {index < SUBMISSION_WIZARD_STEPS.length - 1 ? (
                <span
                  className={cn('sub-stepper__connector', connectorComplete && 'sub-stepper__connector--complete')}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
