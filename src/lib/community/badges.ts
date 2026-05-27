export type CommunityBadgeSlug =
  | 'first_signal'
  | 'quiz_locked'
  | 'golden_ear'
  | 'scout_promoted'
  | 'first_spin'
  | 'first_drop'
  | 'crew_joined'
  | 'weekly_warrior'
  | 'triple_signal'
  | 'collab_verified'

export interface CommunityBadgeDef {
  slug: CommunityBadgeSlug
  name: string
  description: string
  sortOrder: number
}

export const COMMUNITY_BADGE_DEFS: CommunityBadgeDef[] = [
  {
    slug: 'first_signal',
    name: 'First Signal',
    description: 'Completed your first Academy lesson.',
    sortOrder: 10,
  },
  {
    slug: 'quiz_locked',
    name: 'Quiz Locked In',
    description: 'Passed your first Academy quiz.',
    sortOrder: 20,
  },
  {
    slug: 'golden_ear',
    name: 'Golden Ear',
    description: 'Passed Ear Lab with a strong score (7+).',
    sortOrder: 30,
  },
  {
    slug: 'scout_promoted',
    name: 'Scout',
    description: 'Reached Scout rank — 500+ dB.',
    sortOrder: 40,
  },
  {
    slug: 'first_spin',
    name: 'First Spin',
    description: 'Posted your first Spin on the network.',
    sortOrder: 50,
  },
  {
    slug: 'first_drop',
    name: 'First Drop',
    description: 'Posted your first Drop transmission.',
    sortOrder: 55,
  },
  {
    slug: 'crew_joined',
    name: 'Crew',
    description: 'Joined a crew.',
    sortOrder: 60,
  },
  {
    slug: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Completed the weekly dB challenge.',
    sortOrder: 70,
  },
  {
    slug: 'triple_signal',
    name: 'Triple Signal',
    description: 'Completed all three weekly challenges in one week.',
    sortOrder: 80,
  },
  {
    slug: 'collab_verified',
    name: 'Collab Verified',
    description: 'Completed a collab with mutual confirmation on the network.',
    sortOrder: 85,
  },
]

export function badgeDefBySlug(slug: string): CommunityBadgeDef | undefined {
  return COMMUNITY_BADGE_DEFS.find((b) => b.slug === slug)
}
