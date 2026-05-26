export interface MyCrew {
  crewId: string
  name: string
  slug: string
  inviteCode: string
  tagline?: string
  genreSlug?: string
  founderId: string
  myRole: 'founder' | 'member'
  memberCount: number
  weeklyDb: number
  maxMembers: number
}

export interface CrewRosterMember {
  userId: string
  name: string
  handle: string
  avatarUrl?: string
  rank: string
  role: 'founder' | 'member'
  weeklyDb: number
}

export interface CrewLeaderboardEntry {
  crewId: string
  name: string
  slug: string
  tagline?: string
  genreSlug?: string
  inviteCode: string
  memberCount: number
  weeklyDb: number
}
