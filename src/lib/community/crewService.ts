import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { evaluateWeeklyChallenges } from '@/lib/community/challengeService'
import { tryGrantBadge } from '@/lib/community/grantBadge'
import { COMMUNITY_DB_EVENT } from '@/lib/community/events'
import type { CrewLeaderboardEntry, CrewRosterMember, MyCrew } from '@/lib/community/crewTypes'
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

function mapMyCrew(row: {
  crew_id: string
  crew_name: string
  crew_slug: string
  invite_code: string
  tagline: string | null
  genre_slug: string | null
  founder_id: string
  my_role: string
  member_count: number
  weekly_db: number | string
  max_members: number
}): MyCrew {
  return {
    crewId: row.crew_id,
    name: row.crew_name,
    slug: row.crew_slug,
    inviteCode: row.invite_code,
    tagline: row.tagline ?? undefined,
    genreSlug: row.genre_slug ?? undefined,
    founderId: row.founder_id,
    myRole: row.my_role as MyCrew['myRole'],
    memberCount: row.member_count,
    weeklyDb: Number(row.weekly_db),
    maxMembers: row.max_members,
  }
}

export async function fetchMyCrew(): Promise<MyCrew | null> {
  if (!isSupabaseConfigured()) return localGetMyCrew()

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_my_crew')

  if (error) {
    console.warn('[community] my crew', error.message)
    return null
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) return null
  return mapMyCrew(row)
}

export async function fetchCrewRoster(crewId: string): Promise<CrewRosterMember[]> {
  if (!isSupabaseConfigured()) {
    const crew = localGetMyCrew()
    if (!crew || crew.crewId !== crewId) return []
    return []
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_crew_roster', { p_crew_id: crewId })

  if (error) {
    console.warn('[community] crew roster', error.message)
    return []
  }

  return (data ?? []).map(
    (row: {
      user_id: string
      display_name: string
      handle: string
      avatar_url: string | null
      community_rank: string
      role: string
      weekly_db: number | string
    }) => ({
      userId: row.user_id,
      name: row.display_name,
      handle: row.handle.startsWith('@') ? row.handle : `@${row.handle}`,
      avatarUrl: row.avatar_url ?? undefined,
      rank: row.community_rank,
      role: row.role as CrewRosterMember['role'],
      weeklyDb: Number(row.weekly_db),
    })
  )
}

export async function fetchCrewWeeklyLeaderboard(limit = 15): Promise<CrewLeaderboardEntry[]> {
  if (!isSupabaseConfigured()) return localGetCrewBoard().slice(0, limit)

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_crew_weekly_leaderboard', { lim: limit })

  if (error) {
    console.warn('[community] crew leaderboard', error.message)
    return []
  }

  return (data ?? []).map(
    (row: {
      crew_id: string
      crew_name: string
      crew_slug: string
      tagline: string | null
      genre_slug: string | null
      invite_code: string
      member_count: number
      weekly_db: number | string
    }) => ({
      crewId: row.crew_id,
      name: row.crew_name,
      slug: row.crew_slug,
      tagline: row.tagline ?? undefined,
      genreSlug: row.genre_slug ?? undefined,
      inviteCode: row.invite_code,
      memberCount: row.member_count,
      weeklyDb: Number(row.weekly_db),
    })
  )
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

  const supabase = getSupabase()
  const { error } = await supabase.rpc('community_create_crew', {
    p_name: name,
    p_tagline: input.tagline?.trim() || null,
    p_genre_slug: input.genreSlug || null,
  })

  if (error) throw new Error(error.message)

  void evaluateWeeklyChallenges()
  notifyCrew()
  const crew = await fetchMyCrew()
  if (!crew) throw new Error('Crew created but could not load details.')
  return crew
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

  const supabase = getSupabase()
  const { error } = await supabase.rpc('community_join_crew', { p_invite_code: code })
  if (error) throw new Error(error.message)

  void tryGrantBadge('crew_joined')
  void evaluateWeeklyChallenges()
  notifyCrew()
  const crew = await fetchMyCrew()
  if (!crew) throw new Error('Joined crew but could not load details.')
  return crew
}

export async function leaveCrew(): Promise<void> {
  if (!isSupabaseConfigured()) {
    localSetMyCrew(null)
    notifyCrew()
    return
  }

  const supabase = getSupabase()
  const { error } = await supabase.rpc('community_leave_crew')
  if (error) throw new Error(error.message)
  notifyCrew()
}

export async function disbandCrew(): Promise<void> {
  if (!isSupabaseConfigured()) {
    localSetMyCrew(null)
    notifyCrew()
    return
  }

  const supabase = getSupabase()
  const { error } = await supabase.rpc('community_disband_crew')
  if (error) throw new Error(error.message)
  notifyCrew()
}
