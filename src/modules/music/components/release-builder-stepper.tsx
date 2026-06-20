import { Check, AlertTriangle } from 'lucide-react'
import type { ReleaseBuilderStep } from '@/modules/music/types/release-builder.types'
import { RELEASE_BUILDER_STEPS } from '@/modules/music/types/release-builder.types'
import { cn } from '@/shared/lib/cn'

interface ReleaseBuilderStepperProps {
  currentStep: ReleaseBuilderStep
  completedSteps: ReleaseBuilderStep[]
  errorSteps?: ReleaseBuilderStep[]
}

export function ReleaseBuilderStepper({
  currentStep,
  completedSteps,
  errorSteps = [],
}: ReleaseBuilderStepperProps) {
  const currentIndex = RELEASE_BUILDER_STEPS.findIndex((s) => s.id === currentStep)

  return (
    <nav className="rbl-stepper" aria-label="Release builder progress">
      <ol className="rbl-stepper__list">
        {RELEASE_BUILDER_STEPS.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = completedSteps.includes(step.id)
          const hasError = errorSteps.includes(step.id)
          const isUpcoming = index > currentIndex
          const connectorComplete = index < currentIndex

          return (
            <li key={step.id} className="rbl-stepper__item">
              <div
                className={cn(
                  'rbl-step',
                  isActive && 'rbl-step--active',
                  isCompleted && 'rbl-step--done',
                  hasError && 'rbl-step--error',
                  isUpcoming && 'rbl-step--upcoming',
                )}
              >
                <span className="rbl-step__node">
                  {isCompleted && !hasError ? (
                    <Check className="size-3.5" />
                  ) : hasError ? (
                    <AlertTriangle className="size-3.5" />
                  ) : (
                    String(index + 1).padStart(2, '0')
                  )}
                </span>
                <span className="rbl-step__label">{step.label}</span>
              </div>

              {index < RELEASE_BUILDER_STEPS.length - 1 ? (
                <span
                  className={cn('rbl-stepper__connector', connectorComplete && 'rbl-stepper__connector--complete')}
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
