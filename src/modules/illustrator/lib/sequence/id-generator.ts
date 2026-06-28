/** Sequence-scoped human-readable ids — not global UUIDs. */

export function createTrackId(slug: string): string {
  const safe = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  return safe.startsWith('track_') ? safe : `track_${safe || 'layer'}`
}

export function nextInstanceId(existing: string[]): string {
  let n = 1
  const set = new Set(existing)
  while (set.has(`inst_${String(n).padStart(3, '0')}`)) n += 1
  return `inst_${String(n).padStart(3, '0')}`
}

export function nextSequenceId(existing: string[]): string {
  let n = 1
  const set = new Set(existing)
  while (set.has(`seq_${String(n).padStart(3, '0')}`)) n += 1
  return `seq_${String(n).padStart(3, '0')}`
}

export function nextBlockId(existing: string[]): string {
  let n = 1
  const set = new Set(existing)
  while (set.has(`block_${String(n).padStart(3, '0')}`)) n += 1
  return `block_${String(n).padStart(3, '0')}`
}

export function nextMarkerId(existing: string[]): string {
  let n = 1
  const set = new Set(existing)
  while (set.has(`marker_${String(n).padStart(3, '0')}`)) n += 1
  return `marker_${String(n).padStart(3, '0')}`
}

export function slugFromLayerName(name: string): string {
  return createTrackId(name.replace(/^layer\s+/i, ''))
}
