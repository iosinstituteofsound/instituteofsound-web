import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { createArtistSubmission } from '@/modules/explore/api/explore.api'
import { SubmissionSidebar } from '@/modules/submissions/components/submission-sidebar'
import { SubmissionWizardScene } from '@/modules/submissions/components/submission-wizard-scene'
import { SubmissionWizardStepper } from '@/modules/submissions/components/submission-wizard-stepper'
import { BoostVisibilityStep } from '@/modules/submissions/components/steps/boost-visibility-step'
import { ChooseDestinationsStep } from '@/modules/submissions/components/steps/choose-destinations-step'
import { ChooseReleaseStep } from '@/modules/submissions/components/steps/choose-release-step'
import { ReviewSubmitStep } from '@/modules/submissions/components/steps/review-submit-step'
import { useSubmissionWizard } from '@/modules/submissions/hooks/use-submission-wizard'
import { mapReleaseToSubmissionPayload } from '@/modules/submissions/lib/submission-mapper'
import { AppBreadcrumb } from '@/shared/components/navigation/app-breadcrumb'
import { Button } from '@/shared/components/ui/button'

const breadcrumbs = [
  { label: 'Studio', href: '/artist' },
  { label: 'My Submissions', href: '/artist/submissions' },
  { label: 'New Submission' },
]

export function ArtistSubmissionWizardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const wizard = useSubmissionWizard()

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!wizard.selectedRelease) throw new Error('Select a release first.')
      const payload = mapReleaseToSubmissionPayload(
        wizard.selectedRelease,
        wizard.selectedDestinations,
        wizard.selectedBoosts,
      )
      return createArtistSubmission(payload)
    },
    onSuccess: () => {
      wizard.resetAfterSubmit()
      void queryClient.invalidateQueries({ queryKey: ['artist-submissions'] })
      toast.success('Submission sent for editorial review.')
      navigate('/artist/submissions')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit release.')
    },
  })

  const handleNext = () => {
    if (!wizard.canGoNext()) {
      if (wizard.step === 'release') toast.error('Select a release to continue.')
      if (wizard.step === 'destinations') toast.error('Select at least one destination.')
      return
    }
    wizard.goNext()
  }

  const handleBoostContinue = () => {
    wizard.goToStep('review')
  }

  return (
    <SubmissionWizardScene>
      <div className="sub-wizard">
        <AppBreadcrumb items={breadcrumbs} />

        <div className="sub-wizard__header">
          <SubmissionWizardStepper
            currentStep={wizard.step}
            completedSteps={wizard.completedSteps}
          />
          <Button type="button" variant="outline" size="sm" onClick={wizard.saveDraft}>
            <Save className="size-4" />
            Save as Draft
          </Button>
        </div>

        <div className="sub-wizard__body">
          <div className="sub-wizard__main">
            {wizard.step === 'release' ? <ChooseReleaseStep wizard={wizard} /> : null}
            {wizard.step === 'destinations' ? <ChooseDestinationsStep wizard={wizard} /> : null}
            {wizard.step === 'boost' ? (
              <BoostVisibilityStep wizard={wizard} onContinue={handleBoostContinue} />
            ) : null}
            {wizard.step === 'review' ? (
              <ReviewSubmitStep
                wizard={wizard}
                onSubmit={() => submitMutation.mutate()}
                isSubmitting={submitMutation.isPending}
              />
            ) : null}

            {wizard.step !== 'boost' && wizard.step !== 'review' ? (
              <div className="sub-deck">
                <Button
                  type="button"
                  variant="outline"
                  onClick={wizard.goBack}
                  disabled={wizard.step === 'release'}
                >
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
                <Button type="button" onClick={handleNext}>
                  Continue
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            ) : wizard.step === 'boost' ? (
              <div className="sub-deck">
                <Button type="button" variant="outline" onClick={wizard.goBack}>
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
              </div>
            ) : (
              <div className="sub-deck">
                <Button type="button" variant="outline" onClick={wizard.goBack}>
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
              </div>
            )}
          </div>

          <SubmissionSidebar wizard={wizard} />
        </div>
      </div>
    </SubmissionWizardScene>
  )
}
