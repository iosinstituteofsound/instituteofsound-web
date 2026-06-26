/** Mirror of instituteofsound-api/src/infrastructure/websocket/realtimeEnvelope.ts — keep in sync. */

export type RealtimeAnalyticsReason = 'listen' | 'like'

export type RealtimeAnalyticsEnvelope = {
  type: 'analytics.updated'
  scope: 'release' | 'artist'
  releaseId: string
  artistProfileId: string
  trackId: string
  reason: RealtimeAnalyticsReason
  accepted?: boolean
}

export const REALTIME_ANALYTICS_EVENT = 'analytics:updated' as const

export const REALTIME_NAMESPACE = '/realtime' as const
