import type { SubmissionBoostOption, SubmissionDestination } from '@/modules/submissions/types/submission-wizard.types'

export const SUBMISSION_DESTINATIONS: SubmissionDestination[] = [
  {
    id: 'ios-editorial',
    title: 'Institute of Sound Editorial',
    description: 'Submit for editorial review and potential feature coverage across the network.',
    reach: '50K+',
    reachValue: 50000,
    acceptance: 'Medium',
    icon: 'editorial',
    reviewerRoleSlug: 'editor',
    suggested: true,
  },
  {
    id: 'ios-playlists',
    title: 'iOS Official Playlists',
    description: 'Pitch your release for placement on curated official playlists.',
    reach: '120K+',
    reachValue: 120000,
    acceptance: 'Low',
    icon: 'playlist',
    reviewerRoleSlug: 'curator',
    suggested: true,
  },
  {
    id: 'playlist-curators',
    title: 'Playlist Curators',
    description: 'Reach independent curators actively scouting new metal and alternative acts.',
    reach: '35K+',
    reachValue: 35000,
    acceptance: 'Varies',
    icon: 'curators',
    reviewerRoleSlug: 'curator',
    suggested: true,
  },
  {
    id: 'weekly-wire',
    title: 'Weekly Wire',
    description: 'Get considered for the weekly editorial roundup sent to subscribers.',
    reach: '18K+',
    reachValue: 18000,
    acceptance: 'Medium',
    icon: 'wire',
    reviewerRoleSlug: 'editor',
  },
  {
    id: 'live-events',
    title: 'Live Events & Sessions',
    description: 'Pitch for live session features, listening parties, and event spotlights.',
    reach: '12K+',
    reachValue: 12000,
    acceptance: 'Low',
    icon: 'events',
    reviewerRoleSlug: 'editor',
  },
  {
    id: 'label-partners',
    title: 'Label Partners',
    description: 'Submit to label A&R partners for signing and distribution consideration.',
    reach: '—',
    reachValue: 0,
    acceptance: 'Varies',
    icon: 'editorial',
    reviewerRoleSlug: 'label',
  },
]

export const SUBMISSION_BOOST_OPTIONS: SubmissionBoostOption[] = [
  {
    id: 'featured-placement',
    title: 'Featured Placement',
    description: 'Priority homepage and explore placement for 7 days.',
    metric: '50K+',
    metricLabel: 'Estimated Reach',
    priceInr: 2499,
    popular: true,
    icon: 'featured',
  },
  {
    id: 'playlist-spotlight',
    title: 'Playlist Spotlight',
    description: 'Highlighted in editorial playlist rotation for 14 days.',
    metric: '30K+',
    metricLabel: 'Estimated Reach',
    priceInr: 1499,
    icon: 'playlist',
  },
  {
    id: 'newsletter-feature',
    title: 'Newsletter Feature',
    description: 'Dedicated mention in the Weekly Wire newsletter.',
    metric: '18K+',
    metricLabel: 'Estimated Reach',
    priceInr: 999,
    icon: 'newsletter',
  },
  {
    id: 'social-promotion',
    title: 'Social Media Promotion',
    description: 'Cross-platform social push across iOS channels.',
    metric: '25K+',
    metricLabel: 'Estimated Reach',
    priceInr: 1499,
    icon: 'social',
  },
  {
    id: 'priority-review',
    title: 'Priority Review',
    description: 'Fast-track editorial review within 48 hours.',
    metric: '2 Days',
    metricLabel: 'Review Time',
    priceInr: 799,
    icon: 'priority',
  },
]

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatReach(value: number): string {
  if (value >= 1000) return `${Math.round(value / 1000)}K+`
  return String(value)
}
