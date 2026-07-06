export type TribeReputationTag =
  | 'peaceful'
  | 'competitive'
  | 'hardcore'
  | 'friendly'
  | 'elite'
  | 'creative'

export type AllianceScoreBreakdown = {
  power: number
  activity: number
  loyalty: number
  growth: number
  support: number
}

export type AllianceSummary = {
  id: string
  slug: string
  name: string
  tagline?: string
  genreSlug: string
  genreLabel?: string
  reputationTag: TribeReputationTag
  visibility: 'public' | 'invite_only' | 'private'
  status: 'active' | 'disbanding' | 'archived'
  level: number
  verified: boolean
  memberCount: number
  maxMembers: number
  tribeScore: number
  scoreBreakdown: AllianceScoreBreakdown
  weeklyDb: number
  seasonDb: number
  signalsBalance: number
  emblemUrl?: string
  bannerUrl?: string
  founderId: string
  leaderId: string
  inviteCode?: string
  allianceThreadId?: string
  underReview: boolean
  disbandAt?: string
  createdAt: string
}

export type AllianceRosterMember = {
  userId: string
  name: string
  username?: string
  avatarUrl?: string
  rank: number
  rankTitle: string
  platformRole: 'listener' | 'artist'
  weeklyDbContributed: number
  totalDbContributed: number
  joinedAt: string
  isFounder: boolean
  isLeader: boolean
}

export type MyAlliance = {
  alliance: AllianceSummary
  membership: {
    rank: number
    rankTitle: string
    platformRole: 'listener' | 'artist'
    probationUntil?: string
    weeklyDbContributed: number
    totalDbContributed: number
    founderBadge: boolean
  }
  threadId?: string
}

export type AllianceDetail = {
  alliance: AllianceSummary
  roster: AllianceRosterMember[]
  viewerMembership?: MyAlliance['membership']
}

export type GenreDto = {
  slug: string
  label: string
  sortOrder: number
  worldChatEnabled: boolean
  allianceCount: number
  seasonScore: number
  weeklyScore: number
  warStanding?: { rank: number }
}

export type GenreDetail = GenreDto & {
  topAlliances: Array<{
    slug: string
    name: string
    tribeScore: number
    memberCount: number
    level: number
  }>
}

export type AllianceLegacyEvent = {
  id: string
  kind: string
  actorId?: string
  actorName?: string
  targetId?: string
  targetName?: string
  meta?: Record<string, unknown>
  createdAt: string
}

export type AllianceChallenge = {
  id: string
  weekKey: string
  warType: string
  title: string
  description?: string
  target: number
  progress: number
  signalsReward: number
  status: 'active' | 'completed' | 'claimed'
}
