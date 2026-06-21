export function trackPagePath(trackId: string): string {
  return `/tracks/${trackId}`
}

type ReleaseCardLinkInput = {
  id: string
  type?: string
  parentReleaseId?: string
  primaryTrackId?: string
}

export function releaseCardPath(release: ReleaseCardLinkInput): string {
  if (release.parentReleaseId) return trackPagePath(release.id)
  if (release.type === 'single' && release.primaryTrackId) {
    return trackPagePath(release.primaryTrackId)
  }
  return `/releases/${release.id}`
}
