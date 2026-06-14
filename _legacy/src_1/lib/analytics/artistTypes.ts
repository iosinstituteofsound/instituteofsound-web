export type ArtistAnalyticsEventType = 'profile_view' | 'track_click'

export interface ArtistTrackClickStat {
  trackId: string
  title: string
  clicks: number
  clicks7d: number
}

export interface ArtistProfileAnalytics {
  profileViews: number
  profileViews7d: number
  profileViews30d: number
  trackClicks: number
  trackClicks7d: number
  topTracks: ArtistTrackClickStat[]
}
