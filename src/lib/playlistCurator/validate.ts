import type { SubmitPlaylistCuratorInput } from './types'

export function validatePlaylistCuratorInput(input: SubmitPlaylistCuratorInput): string | null {
  const links = input.playlistLinks.map((l) => l.trim()).filter(Boolean)
  if (links.length < 1) return 'Add at least one playlist link.'
  for (const link of links) {
    try {
      const url = new URL(link.startsWith('http') ? link : `https://${link}`)
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'Playlist links must be valid http(s) URLs.'
      }
    } catch {
      return `Invalid link: ${link}`
    }
  }
  return null
}
