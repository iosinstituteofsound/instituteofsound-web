import { isSupabaseConfigured } from '@/lib/api/liveMode'
import {
  v1GetCrewWarsV2,
  v1GetFridayWire,
  v1GetTribeWarMonthly,
  v1GetWireDigest,
} from '@/api/v1Phase5Client'
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

  const { wire } = await v1GetFridayWire()
  return wire
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

  const { standings } = await v1GetTribeWarMonthly()
  return standings
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

  const { entries } = await v1GetCrewWarsV2(limit)
  return entries
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

  const { digest } = await v1GetWireDigest()
  return digest
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
