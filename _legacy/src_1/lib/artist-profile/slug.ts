export function slugifyArtistName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'artist'
}

export function ensureUniqueSlug(base: string, taken: string[]): string {
  let slug = slugifyArtistName(base)
  if (!taken.includes(slug)) return slug
  let n = 2
  while (taken.includes(`${slug}-${n}`)) n += 1
  return `${slug}-${n}`
}
