/** Fields required before a profile goes live on Discover */
export interface ProfileCompletenessInput {
  displayName: string
  slug: string
  bio: string
  genres: string[]
  avatarUrl: string
  trackCount: number
  videoCount: number
}

export interface ProfileCompletenessResult {
  complete: boolean
  missing: string[]
}

export const PROFILE_COMPLETION_ITEMS = [
  { key: 'name', label: 'Band / artist name' },
  { key: 'slug', label: 'URL slug' },
  { key: 'bio', label: 'Bio (About tab)' },
  { key: 'genres', label: 'At least one genre' },
  { key: 'avatar', label: 'Avatar image' },
  { key: 'media', label: 'At least one track or video' },
] as const

export function getProfileCompletionStatus(input: ProfileCompletenessInput) {
  return {
    name: !!input.displayName.trim(),
    slug: !!input.slug.trim(),
    bio: input.bio.trim().length >= 24,
    genres: input.genres.length > 0,
    avatar: !!input.avatarUrl.trim(),
    media: input.trackCount >= 1 || input.videoCount >= 1,
  }
}

export function evaluateProfileCompleteness(
  input: ProfileCompletenessInput
): ProfileCompletenessResult {
  const missing: string[] = []

  if (!input.displayName.trim()) missing.push('Band / artist name')
  if (!input.slug.trim()) missing.push('URL slug')
  if (input.bio.trim().length < 24) missing.push('Bio (min. 24 characters)')
  if (input.genres.length === 0) missing.push('At least one genre')
  if (!input.avatarUrl.trim()) missing.push('Avatar image')
  if (input.trackCount < 1 && input.videoCount < 1) {
    missing.push('At least one track or video')
  }

  return { complete: missing.length === 0, missing }
}
