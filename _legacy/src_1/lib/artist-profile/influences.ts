/** Normalize influence tag strings from comma input or stored arrays. */
export function normalizeInfluenceTags(raw: string[] | string | undefined): string[] {
  if (!raw) return []
  const parts = Array.isArray(raw)
    ? raw
    : raw.split(/[,;|]/)
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of parts) {
    const tag = item.trim()
    if (!tag) continue
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(tag)
  }
  return out.slice(0, 24)
}
