import type { SubmissionWizardDraft } from '@/modules/submissions/types/submission-wizard.types'

const DRAFT_KEY = 'ios-submission-wizard-draft'

export function loadSubmissionDraft(): SubmissionWizardDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SubmissionWizardDraft
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function saveSubmissionDraft(draft: Omit<SubmissionWizardDraft, 'savedAt'>): void {
  const payload: SubmissionWizardDraft = {
    ...draft,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
}

export function clearSubmissionDraft(): void {
  localStorage.removeItem(DRAFT_KEY)
}
