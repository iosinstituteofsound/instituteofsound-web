import type { ArtistLineupEntry, LineupEntryType } from './types'

export const LINEUP_ENTRY_TYPES: LineupEntryType[] = ['member', 'guest', 'production']

export const LINEUP_TYPE_LABELS: Record<LineupEntryType, string> = {
  member: 'Band members',
  guest: 'Guest appearances',
  production: 'Production & credits',
}

export function resolveLineupEntryType(value: unknown): LineupEntryType {
  if (value === 'guest' || value === 'production') return value
  return 'member'
}

export function groupLineupByType(entries: ArtistLineupEntry[]): {
  type: LineupEntryType
  label: string
  items: ArtistLineupEntry[]
}[] {
  return LINEUP_ENTRY_TYPES.map((type) => ({
    type,
    label: LINEUP_TYPE_LABELS[type],
    items: entries.filter((e) => e.entryType === type),
  })).filter((g) => g.items.length > 0)
}
