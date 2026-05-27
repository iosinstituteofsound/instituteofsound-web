import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { mapFeedRow, type FeedRow } from '@/lib/community/feedService'
import { fetchSpinOfTheWeek, type SpinOfTheWeek } from '@/lib/community/wireHighlights'
import { localGetCrewBoard } from '@/lib/community/localCrew'
import type { CrewLeaderboardEntry } from '@/lib/community/crewTypes'

export interface FridayWire extends SpinOfTheWeek {
  wireLive: boolean
  nextWireAt: string
  featuredFriday: string
}

export interface TribeWarStanding {
  genreSlug: string
  genreName: string
  totalDb: number
  activeMembers: number
  championUserId?: string
  championName?: string
  championHandle?: string
  championDb: number
  seasonLabel: string
}

export interface CrewWarsEntry extends CrewLeaderboardEntry {
  prevWeeklyDb: number
  dbDelta: number
  seasonLabel: string
}

export interface WireDigest {
  seasonLabel: string
  spinTitle?: string
  spinHandle?: string
  spinPostId?: string
  editorialTitle?: string
  editorialSlug?: string
  editorialType?: string
  tribeWinnerGenre?: string
  tribeWinnerChampion?: string
  challengeTitle: string
}

function nextFridayUtcLocal(): Date {
  const now = new Date()
  const utc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const dow = utc.getUTCDay()
  const daysUntilFriday = (5 - dow + 7) % 7
  const friday = new Date(utc)
  if (daysUntilFriday === 0 && now.getUTCHours() >= 0) {
    return friday
  }
  friday.setUTCDate(friday.getUTCDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday))
  return friday
}

export function msUntilNextFridayWire(nextWireAt?: string): number {
  const target = nextWireAt ? new Date(nextWireAt) : nextFridayUtcLocal()
  return Math.max(0, target.getTime() - Date.now())
}

export function formatWireCountdown(ms: number): string {
  if (ms <= 0) return 'Live now'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const d = Math.floor(h / 24)
  const rh = h % 24
  if (d > 0) return `${d}d ${rh}h`
  if (h > 0) return `${rh}h ${m}m`
  return `${m}m`
}

export async function fetchFridayWire(): Promise<FridayWire | null> {
  if (!isSupabaseConfigured()) {
    const spin = await fetchSpinOfTheWeek()
    if (!spin) return null
    const next = nextFridayUtcLocal().toISOString()
    return {
      ...spin,
      wireLive: new Date().getUTCDay() === 5,
      nextWireAt: next,
      featuredFriday: new Date().toISOString().slice(0, 10),
    }
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_friday_wire')
  if (error) {
    console.warn('[community] friday wire', error.message)
    return null
  }

  const row = (data ?? [])[0] as (FeedRow & {
    reaction_score?: number
    wire_live?: boolean
    next_wire_at?: string
    featured_friday?: string
  }) | undefined
  if (!row) return null

  const post = mapFeedRow(row)
  return {
    ...post,
    reactionScore: Number(row.reaction_score ?? 0),
    wireLive: Boolean(row.wire_live),
    nextWireAt: row.next_wire_at ?? nextFridayUtcLocal().toISOString(),
    featuredFriday: row.featured_friday ?? new Date().toISOString().slice(0, 10),
  }
}

export async function fetchTribeWarMonthly(): Promise<TribeWarStanding[]> {
  if (!isSupabaseConfigured()) {
    return [
      {
        genreSlug: 'electronic',
        genreName: 'Electronic',
        totalDb: 420,
        activeMembers: 12,
        championName: 'Wire Operator',
        championHandle: 'operator',
        championDb: 88,
        seasonLabel: new Date().toLocaleString('en', { month: 'long', year: 'numeric' }),
      },
    ]
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_tribe_war_monthly')
  if (error) {
    console.warn('[community] tribe war', error.message)
    return []
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    genreSlug: String(row.genre_slug),
    genreName: String(row.genre_name),
    totalDb: Number(row.total_db ?? 0),
    activeMembers: Number(row.active_members ?? 0),
    championUserId: row.champion_user_id ? String(row.champion_user_id) : undefined,
    championName: row.champion_name ? String(row.champion_name) : undefined,
    championHandle: row.champion_handle ? String(row.champion_handle) : undefined,
    championDb: Number(row.champion_db ?? 0),
    seasonLabel: String(row.season_label ?? ''),
  }))
}

export async function fetchCrewWarsV2(limit = 15): Promise<CrewWarsEntry[]> {
  if (!isSupabaseConfigured()) {
    return localGetCrewBoard().map((e) => ({
      ...e,
      prevWeeklyDb: Math.max(0, e.weeklyDb - 40),
      dbDelta: 40,
      seasonLabel: new Date().toLocaleString('en', { month: 'long', year: 'numeric' }),
    }))
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_crew_wars_v2', { lim: limit })
  if (error) {
    console.warn('[community] crew wars v2', error.message)
    return []
  }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    crewId: String(row.crew_id),
    name: String(row.crew_name),
    slug: String(row.crew_slug),
    tagline: row.tagline ? String(row.tagline) : undefined,
    genreSlug: row.genre_slug ? String(row.genre_slug) : undefined,
    inviteCode: String(row.invite_code),
    memberCount: Number(row.member_count ?? 0),
    weeklyDb: Number(row.weekly_db ?? 0),
    prevWeeklyDb: Number(row.prev_weekly_db ?? 0),
    dbDelta: Number(row.db_delta ?? 0),
    seasonLabel: String(row.season_label ?? ''),
  }))
}

export async function fetchWireDigest(): Promise<WireDigest | null> {
  const seasonLabel = new Date().toLocaleString('en', { month: 'long', year: 'numeric' })

  if (!isSupabaseConfigured()) {
    const spin = await fetchSpinOfTheWeek()
    const tribes = await fetchTribeWarMonthly()
    const top = tribes[0]
    return {
      seasonLabel,
      spinTitle: spin?.trackTitle ?? 'Untitled transmission',
      spinHandle: spin?.handle,
      tribeWinnerGenre: top?.genreName,
      tribeWinnerChampion: top?.championName,
      challengeTitle: 'Spin the wire',
    }
  }

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('community_wire_digest')
  if (error) {
    console.warn('[community] wire digest', error.message)
    return null
  }

  const row = (data ?? [])[0] as Record<string, unknown> | undefined
  if (!row) return null

  return {
    seasonLabel: String(row.season_label ?? seasonLabel),
    spinTitle: row.spin_title ? String(row.spin_title) : undefined,
    spinHandle: row.spin_handle ? String(row.spin_handle) : undefined,
    spinPostId: row.spin_post_id ? String(row.spin_post_id) : undefined,
    editorialTitle: row.editorial_title ? String(row.editorial_title) : undefined,
    editorialSlug: row.editorial_slug ? String(row.editorial_slug) : undefined,
    editorialType: row.editorial_type ? String(row.editorial_type) : undefined,
    tribeWinnerGenre: row.tribe_winner_genre ? String(row.tribe_winner_genre) : undefined,
    tribeWinnerChampion: row.tribe_winner_champion ? String(row.tribe_winner_champion) : undefined,
    challengeTitle: String(row.challenge_title ?? 'Spin the wire'),
  }
}

/** Build plain-text newsletter body for copy/share */
export function formatWireDigestText(d: WireDigest): string {
  const lines = [
    `INSTITUTE OF SOUND — Wire Digest · ${d.seasonLabel}`,
    '',
    d.spinTitle ? `Spin of the Week: ${d.spinTitle}${d.spinHandle ? ` by ${d.spinHandle}` : ''}` : null,
    d.editorialTitle && d.editorialSlug
      ? `Editorial: ${d.editorialTitle} → https://instituteofsound.in/feature/${d.editorialSlug}`
      : null,
    d.tribeWinnerGenre
      ? `Tribe War lead: ${d.tribeWinnerGenre}${d.tribeWinnerChampion ? ` · ${d.tribeWinnerChampion}` : ''}`
      : null,
    `Weekly challenge: ${d.challengeTitle}`,
    '',
    'https://instituteofsound.in/community',
  ]
  return lines.filter(Boolean).join('\n')
}
