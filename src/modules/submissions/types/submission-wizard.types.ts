export type SubmissionWizardStep = 'release' | 'destinations' | 'boost' | 'review'

export type ReleaseSortOption = 'recent' | 'title'

export type DestinationFilter = 'all' | 'suggestions'

export interface SubmissionDestination {
  id: string
  title: string
  description: string
  reach: string
  reachValue: number
  acceptance: 'Low' | 'Medium' | 'High' | 'Varies'
  icon: 'editorial' | 'playlist' | 'curators' | 'wire' | 'events'
  suggested?: boolean
}

export interface SubmissionBoostOption {
  id: string
  title: string
  description: string
  metric: string
  metricLabel: string
  priceInr: number
  popular?: boolean
  icon: 'featured' | 'playlist' | 'newsletter' | 'social' | 'priority'
}

export interface SubmissionWizardDraft {
  step: SubmissionWizardStep
  releaseId: string | null
  destinationIds: string[]
  boostIds: string[]
  savedAt: string
}

export interface EvaluationMetric {
  label: string
  score: string
}

export const SUBMISSION_WIZARD_STEPS: {
  id: SubmissionWizardStep
  label: string
  subtitle: string
}[] = [
  { id: 'release', label: 'Choose Release', subtitle: 'Select from your uploaded tracks' },
  { id: 'destinations', label: 'Choose Destinations', subtitle: 'Where do you want to submit?' },
  { id: 'boost', label: 'Boost Visibility', subtitle: 'Promote your release (optional)' },
  { id: 'review', label: 'Review & Submit', subtitle: 'Review and confirm your submission' },
]

export const SUBMISSION_JOURNEY_STEPS = [
  'Submitted',
  'Under Review',
  'Editor Assigned',
  'Playlist Consideration',
  'Featured',
  'Published',
] as const
