export const EVENT_KINDS = [
  { id: 'gig', label: 'Live gig' },
  { id: 'dj-night', label: 'DJ night' },
  { id: 'listening', label: 'Listening session' },
  { id: 'open-mic', label: 'Open mic' },
  { id: 'beat-battle', label: 'Beat battle' },
  { id: 'warehouse', label: 'Warehouse / rave' },
  { id: 'other', label: 'Other' },
] as const

export type EventKind = (typeof EVENT_KINDS)[number]['id']

export function eventKindLabel(kind: string): string {
  return EVENT_KINDS.find((k) => k.id === kind)?.label ?? kind.replace(/-/g, ' ')
}
