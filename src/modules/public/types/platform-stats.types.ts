export interface PlatformStats {
  listeners: number
  totalPlays: number
  artists: number
  editors: number
  curators: number
  labels: number
  releases: {
    total: number
    singles: number
    albums: number
    eps: number
    hot: number
  }
  playlists: number
  articles: number
  events: number
}
