export function formatArtistTrackTitle(artistName: string, songName: string): string {
  const song = songName.trim()
  const artist = artistName.trim()
  if (!song) return artist || 'Untitled track'
  if (!artist) return song
  const prefix = `${artist} - `
  if (song.toLowerCase().startsWith(prefix.toLowerCase())) return song
  return `${artist} - ${song}`
}

export function stripArtistTrackPrefix(artistName: string, trackTitle: string): string {
  const artist = artistName.trim()
  const title = trackTitle.trim()
  if (!artist || !title) return title
  const prefix = `${artist} - `
  if (title.toLowerCase().startsWith(prefix.toLowerCase())) {
    return title.slice(prefix.length).trim()
  }
  return title
}
