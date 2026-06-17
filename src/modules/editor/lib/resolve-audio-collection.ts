import { API_V1 } from '@/shared/config/env'
import { apiClient } from '@/shared/services/api/api-client'
import type { ApiSuccessResponse } from '@/shared/types/api.types'
import { isCollectionLink, parseExternalAudioLink } from '@/modules/editor/lib/external-audio-link'
import type { SessionAudioTrack } from '@/modules/editor/lib/session-audio-tracks'
import { sessionTrackFromUrl, toSessionTracks } from '@/modules/editor/lib/session-audio-tracks'
import type { ExplorePayload } from '@/modules/explore/types/explore.types'
import {
  resolveSiteCollectionTracks,
  type SiteAudioTrack,
} from '@/modules/editor/lib/site-audio-library'

export interface AudioCollectionResponse {
  collectionTitle?: string
  collectionUrl: string
  isCollection: boolean
  tracks: Array<{
    id: string
    title: string
    artistName: string
    durationSec?: number
    url: string
  }>
}

export async function fetchExternalAudioCollection(url: string): Promise<AudioCollectionResponse | null> {
  try {
    const { data } = await apiClient.get<ApiSuccessResponse<AudioCollectionResponse>>(
      `${API_V1}/explore/audio-collection`,
      { params: { url: url.trim() } },
    )
    return data.data
  } catch {
    return null
  }
}

export function resolveSiteAudioCollection(
  explore: ExplorePayload,
  track: SiteAudioTrack,
): SessionAudioTrack[] {
  return resolveSiteCollectionTracks(explore, track)
}

export async function resolveAudioSessionTracks(input: {
  audioUrl: string
  trackTitle?: string
  sessionTracks?: SessionAudioTrack[]
  explore?: ExplorePayload | null
  siteTrack?: SiteAudioTrack | null
}): Promise<SessionAudioTrack[]> {
  if (input.sessionTracks && input.sessionTracks.length > 0) {
    return input.sessionTracks
  }

  if (input.explore && input.siteTrack) {
    const siteTracks = resolveSiteCollectionTracks(input.explore, input.siteTrack)
    if (siteTracks.length > 0) return siteTracks
  }

  const parsed = parseExternalAudioLink(input.audioUrl)
  if (!parsed.valid) return []

  if (parsed.streamUrl && parsed.provider === 'direct') {
    return [
      sessionTrackFromUrl(
        parsed.normalizedUrl,
        input.trackTitle?.trim() || parsed.title,
        'Direct audio',
        parsed.streamUrl,
      ),
    ]
  }

  if (!isCollectionLink(parsed)) {
    return [
      sessionTrackFromUrl(
        parsed.normalizedUrl,
        input.trackTitle?.trim() || parsed.title,
        parsed.providerLabel,
        parsed.openUrl,
      ),
    ]
  }

  const collection = await fetchExternalAudioCollection(parsed.rawUrl)
  if (collection?.tracks?.length) {
    return toSessionTracks(collection.tracks)
  }

  return [
    sessionTrackFromUrl(
      parsed.normalizedUrl,
      input.trackTitle?.trim() || parsed.title,
      parsed.providerLabel,
      parsed.openUrl,
    ),
  ]
}
