import type { QueryClient } from '@tanstack/react-query'

export function notifyArtistSurfaceUpdated(userId?: string) {
  window.dispatchEvent(new CustomEvent('ios:artist-updated', { detail: { userId } }))
}

/** Refresh explore + discography caches that feed the artist terminal and release pages. */
export function invalidateArtistSurfaceQueries(queryClient: QueryClient, userId?: string) {
  void queryClient.invalidateQueries({ queryKey: ['explore'] })
  void queryClient.invalidateQueries({ queryKey: ['explore', 'releases-catalog'] })
  if (userId) {
    void queryClient.invalidateQueries({ queryKey: ['profile-discography', userId] })
  } else {
    void queryClient.invalidateQueries({ queryKey: ['profile-discography'] })
  }
  void queryClient.invalidateQueries({ queryKey: ['release-detail'] })
  notifyArtistSurfaceUpdated(userId)
}
