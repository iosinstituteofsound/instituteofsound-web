import type { ReactNode } from 'react'
import '@/modules/submissions/styles/submission-wizard.css'

interface SubmissionWizardSceneProps {
  children: ReactNode
}

export function SubmissionWizardScene({ children }: SubmissionWizardSceneProps) {
  return (
    <div className="sub-scene">
      <div className="sub-scene__backdrop" aria-hidden />
      <div className="sub-scene__content">{children}</div>
    </div>
  )
}
