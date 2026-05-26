import type { CrewLeaderboardEntry, MyCrew } from '@/lib/community/crewTypes'

const CREW_KEY = 'ios_community_my_crew'
const BOARD_KEY = 'ios_community_crew_board'

export function localGetMyCrew(): MyCrew | null {
  try {
    const raw = localStorage.getItem(CREW_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MyCrew
  } catch {
    return null
  }
}

export function localSetMyCrew(crew: MyCrew | null): void {
  try {
    if (crew) localStorage.setItem(CREW_KEY, JSON.stringify(crew))
    else localStorage.removeItem(CREW_KEY)
  } catch {
    /* ignore */
  }
}

export function localGetCrewBoard(): CrewLeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(BOARD_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CrewLeaderboardEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function localUpsertCrewBoard(entry: CrewLeaderboardEntry): void {
  const board = localGetCrewBoard().filter((c) => c.crewId !== entry.crewId)
  board.push(entry)
  board.sort((a, b) => b.weeklyDb - a.weeklyDb)
  try {
    localStorage.setItem(BOARD_KEY, JSON.stringify(board.slice(0, 20)))
  } catch {
    /* ignore */
  }
}
