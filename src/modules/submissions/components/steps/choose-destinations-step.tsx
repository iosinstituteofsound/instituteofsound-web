import { DestinationCard } from '@/modules/submissions/components/choose-destinations/destination-card'
import type { SubmissionWizardState } from '@/modules/submissions/hooks/use-submission-wizard'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/cn'

interface ChooseDestinationsStepProps {
  wizard: SubmissionWizardState
}

export function ChooseDestinationsStep({ wizard }: ChooseDestinationsStepProps) {
  const { destinationFilter, setDestinationFilter, visibleDestinations, destinationIds, toggleDestination } =
    wizard

  return (
    <section className="sub-panel" aria-labelledby="sub-step-destinations-title">
      <header className="sub-panel__header">
        <div>
          <h2 id="sub-step-destinations-title" className="sub-panel__title">
            2 Choose Destinations
          </h2>
          <p className="sub-panel__subtitle">Where do you want to submit?</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={destinationFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setDestinationFilter('all')}
          >
            Browse All
          </Button>
          <Button
            type="button"
            size="sm"
            variant={destinationFilter === 'suggestions' ? 'default' : 'outline'}
            onClick={() => setDestinationFilter('suggestions')}
          >
            Suggestions
          </Button>
        </div>
      </header>

      <div className="sub-panel__body">
        <div className="sub-card-scroll">
          {visibleDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              selected={destinationIds.includes(destination.id)}
              onToggle={() => toggleDestination(destination.id)}
            />
          ))}
        </div>
        {destinationIds.length === 0 ? (
          <p className={cn('mt-3 text-sm text-muted-foreground')}>
            Select at least one destination to continue.
          </p>
        ) : null}
      </div>
    </section>
  )
}
