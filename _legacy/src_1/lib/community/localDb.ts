import { localGrantBadge } from '@/lib/community/localCommunity'

const KEY = 'ios_community_db'

interface LocalDbState {
  totalDb: number
  sources: Record<string, number>
}

function read(): LocalDbState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { totalDb: 0, sources: {} }
    const parsed = JSON.parse(raw) as LocalDbState
    return {
      totalDb: parsed.totalDb ?? 0,
      sources: parsed.sources ?? {},
    }
  } catch {
    return { totalDb: 0, sources: {} }
  }
}

function write(state: LocalDbState) {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function localAwardDb(
  source: string,
  sourceId: string,
  amount: number
): { awarded: boolean; totalDb: number } {
  const key = `${source}:${sourceId}`
  const state = read()
  if (state.sources[key]) return { awarded: false, totalDb: state.totalDb }
  state.sources[key] = amount
  state.totalDb += amount
  write(state)
  if (state.totalDb >= 500) localGrantBadge('scout_promoted')
  return { awarded: true, totalDb: state.totalDb }
}

export function localGetTotalDb(): number {
  return read().totalDb
}
