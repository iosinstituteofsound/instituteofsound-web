import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1GetCrewWeeklyLeaderboard } from '@/api/v1Phase5Client'
import {
  v1CreateCrew,
  v1DisbandCrew,
  v1GetMyCrew,
  v1JoinCrew,
  v1LeaveCrew,
} from '@/api/v1Phase4Client'
import { v1GetNetworkCrewRoster, v1GetNetworkProfileCrew } from '@/api/v1Client'
import { evaluateWeeklyChallenges } from '@/lib/community/challengeService'
import { tryGrantBadge } from '@/lib/community/grantBadge'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import type {
  CrewLeaderboardEntry,
  CrewRosterMember,
  MyCrew,
  PublicUserCrew,
} from '@/lib/community/crewTypes'
import {
  localGetCrewBoard,
  localGetMyCrew,
  localSetMyCrew,
  localUpsertCrewBoard,
} from '@/lib/community/localCrew'
export const COMMUNITY_CREW_EVENT = 'ios-community-crew-change'

function notifyCrew() {
  window.dispatchEvent(new Event(COMMUNITY_CREW_EVENT))
  window.dispatchEvent(new Event(COMMUNITY_DB_EVENT))
}

export async function fetchMyCrew(): Promise<MyCrew | null> {
  if (!isSupabaseConfigured()) return localGetMyCrew()

  const { crew } = await v1GetMyCrew()
  return crew
}

export async function fetchCrewRoster(crewId: string): Promise<CrewRosterMember[]> {
  if (!isSupabaseConfigured()) {
    const crew = localGetMyCrew()
    if (!crew || crew.crewId !== crewId) return []
    return []
  }
  const { roster } = await v1GetNetworkCrewRoster(crewId)
  return roster
}

export async function fetchCrewWeeklyLeaderboard(limit = 15): Promise<CrewLeaderboardEntry[]> {
  if (!isSupabaseConfigured()) return localGetCrewBoard().slice(0, limit)

  const { entries } = await v1GetCrewWeeklyLeaderboard(limit)
  return entries
}

export async function createCrew(input: {
  name: string
  tagline?: string
  genreSlug?: string
}): Promise<MyCrew> {
  const name = input.name.trim()
  if (name.length < 3) throw new Error('Crew name must be at least 3 characters.')

  if (!isSupabaseConfigured()) {
    const crew: MyCrew = {
      crewId: crypto.randomUUID(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      tagline: input.tagline?.trim(),
      genreSlug: input.genreSlug,
      founderId: 'local-user',
      myRole: 'founder',
      memberCount: 1,
      weeklyDb: 0,
      maxMembers: 12,
    }
    localSetMyCrew(crew)
    void evaluateWeeklyChallenges()
    localUpsertCrewBoard({
      crewId: crew.crewId,
      name: crew.name,
      slug: crew.slug,
      tagline: crew.tagline,
      genreSlug: crew.genreSlug,
      inviteCode: crew.inviteCode,
      memberCount: 1,
      weeklyDb: 0,
    })
    notifyCrew()
    return crew
  }

  const { crew: created } = await v1CreateCrew({
    name,
    tagline: input.tagline,
    genreSlug: input.genreSlug,
  })
  if (!created) throw new Error('Crew created but could not load details.')

  void evaluateWeeklyChallenges()
  notifyCrew()
  return created
}

export async function joinCrew(inviteCode: string): Promise<MyCrew> {
  const code = inviteCode.trim()
  if (code.length < 4) throw new Error('Enter a valid invite code.')

  if (!isSupabaseConfigured()) {
    const board = localGetCrewBoard()
    const match = board.find((c) => c.inviteCode.toUpperCase() === code.toUpperCase())
    if (!match) throw new Error('Invalid invite code.')
    if (localGetMyCrew()) throw new Error('You are already in a crew.')
    const crew: MyCrew = {
      crewId: match.crewId,
      name: match.name,
      slug: match.slug,
      inviteCode: match.inviteCode,
      tagline: match.tagline,
      genreSlug: match.genreSlug,
      founderId: 'founder',
      myRole: 'member',
      memberCount: match.memberCount + 1,
      weeklyDb: match.weeklyDb,
      maxMembers: 12,
    }
    localSetMyCrew(crew)
    void tryGrantBadge('crew_joined')
    void evaluateWeeklyChallenges()
    notifyCrew()
    return crew
  }

  const { crew: joined } = await v1JoinCrew(code)
  if (!joined) throw new Error('Joined crew but could not load details.')

  void tryGrantBadge('crew_joined')
  void evaluateWeeklyChallenges()
  notifyCrew()
  return joined
}

export async function leaveCrew(): Promise<void> {
  if (!isSupabaseConfigured()) {
    localSetMyCrew(null)
    notifyCrew()
    return
  }

  await v1LeaveCrew()
  notifyCrew()
}

export async function disbandCrew(): Promise<void> {
  if (!isSupabaseConfigured()) {
    localSetMyCrew(null)
    notifyCrew()
    return
  }

  await v1DisbandCrew()
  notifyCrew()
}

/** Crew a user belongs to (for network profile crews tab). */
export async function fetchCrewForUserId(userId: string): Promise<PublicUserCrew | null> {
  if (!isSupabaseConfigured()) return null
  const { crew } = await v1GetNetworkProfileCrew(userId)
  return crew
}
