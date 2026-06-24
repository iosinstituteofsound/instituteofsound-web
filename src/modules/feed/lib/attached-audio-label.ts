function normalizeLabel(value: string): string {
  return value.trim().toLowerCase()
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stripArtistPrefix(artist: string, title: string): string {
  const patterns = [
    new RegExp(`^${escapeRegex(artist)}\\s*[-–—:·]\\s*`, 'i'),
    new RegExp(`^${escapeRegex(artist)}\\s+`, 'i'),
  ]

  for (const pattern of patterns) {
    const stripped = title.replace(pattern, '').trim()
    if (stripped && stripped !== title) return stripped
  }

  return title
}

export function formatAttachedAudioLabel(
  artistName?: string | null,
  trackTitle?: string | null,
): string {
  const artist = artistName?.trim()
  let title = trackTitle?.trim()

  if (!artist && !title) return ''
  if (!artist) return title ?? ''
  if (!title) return artist

  if (normalizeLabel(title) === normalizeLabel(artist)) return artist

  title = stripArtistPrefix(artist, title)

  if (!title || normalizeLabel(title) === normalizeLabel(artist)) return artist

  return `${artist} · ${title}`
}
