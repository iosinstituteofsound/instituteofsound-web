export type EditorApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface EditorApplication {
  id: string
  userId: string
  portfolioLinks: string
  motivation: string
  termsVersion: string
  termsAcceptedAt: string
  status: EditorApplicationStatus
  reviewerId?: string
  reviewerNotes?: string
  reviewedAt?: string
  congratsPending: boolean
  createdAt: string
  updatedAt: string
}

export interface EditorApplicationWithProfile extends EditorApplication {
  applicantName: string
  applicantEmail: string
  applicantUsername?: string
}

export interface SubmitEditorApplicationInput {
  portfolioLinks: string
  motivation: string
  termsVersion: string
}
