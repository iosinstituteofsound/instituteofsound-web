import type { QueryClient } from '@tanstack/react-query'

export function invalidateTrackLyricsQueries(
  queryClient: QueryClient,
  params: { trackId?: string; releaseId?: string },
) {
  if (params.trackId) {
    void queryClient.invalidateQueries({ queryKey: ['track-lyrics', params.trackId] })
  }
  if (params.releaseId) {
    void queryClient.invalidateQueries({ queryKey: ['release-detail', params.releaseId] })
  }
}
