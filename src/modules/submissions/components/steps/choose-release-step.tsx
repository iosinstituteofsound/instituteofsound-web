import type { SubmissionWizardState } from '@/modules/submissions/hooks/use-submission-wizard'
import { ReleaseListPanel } from '@/modules/submissions/components/choose-release/release-list-panel'

interface ChooseReleaseStepProps {
  wizard: SubmissionWizardState
}

export function ChooseReleaseStep({ wizard }: ChooseReleaseStepProps) {
  return <ReleaseListPanel wizard={wizard} />
}
