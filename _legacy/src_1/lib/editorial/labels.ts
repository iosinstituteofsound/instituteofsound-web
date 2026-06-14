import type { EditorialDraft } from '@/lib/auth/types'

export const EDITORIAL_TYPE_OPTIONS: { value: EditorialDraft['type']; label: string }[] = [
  { value: 'review', label: 'Album Review' },
  { value: 'single', label: 'Single Review' },
  { value: 'ep', label: 'EP Review' },
  { value: 'band_profile', label: 'Band Profile' },
  { value: 'feature', label: 'Feature Article' },
]

export const EDITORIAL_TYPE_CATEGORY: Record<EditorialDraft['type'], string> = {
  feature: 'FEATURE',
  review: 'ALBUM REVIEW',
  single: 'SINGLE REVIEW',
  ep: 'EP REVIEW',
  band_profile: 'PROFILE',
}

export function editorialTypeLabel(type: EditorialDraft['type']): string {
  return EDITORIAL_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type.replace('_', ' ')
}

export function isEditorialReviewType(type: EditorialDraft['type']): boolean {
  return type === 'review' || type === 'single' || type === 'ep'
}
