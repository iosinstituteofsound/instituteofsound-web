import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { payloadNumber, payloadString } from '@/shared/lib/payload-utils'
import type { PlayerTrack } from '@/modules/player/types/player.types'

/** Stable player id for feed posts — does not change when catalog/enrichment loads. */
export function resolveFeedPlayerTrackId(item: FeedItemDto): string {
  return item.id
}

export function feedItemToPlayerTrack(item: FeedItemDto): PlayerTrack | null {
  const audioUrl = payloadString(item.payload, 'audioUrl')
  if (!audioUrl) return null

  const releaseId = payloadString(item.payload, 'releaseId')
  const trackId = payloadString(item.payload, 'trackId')
  const trackTitle = payloadString(item.payload, 'trackTitle') ?? 'Shared track'
  const artistName = payloadString(item.payload, 'artistName')
  const artworkUrl = payloadString(item.payload, 'artworkUrl')
  const spotifyUrl = payloadString(item.payload, 'spotifyUrl')
  const youtubeUrl = payloadString(item.payload, 'youtubeUrl')

  return {
    id: resolveFeedPlayerTrackId(item),
    trackId: trackId ?? undefined,
    releaseId,
    title: trackTitle,
    artist: artistName,
    artworkUrl,
    audioUrl,
    durationSec: payloadNumber(item.payload, 'durationSec'),
    sourceId: item.id,
    spotifyUrl,
    youtubeUrl,
  }
}

/** Prefer enriched release-share payload fields when building a player track. */
export function releaseShareItemToPlayerTrack(
  item: FeedItemDto,
  share?: { releaseId: string; trackTitle: string; artistName?: string; audioUrl?: string; artworkUrl?: string } | null,
): PlayerTrack | null {
  if (!share?.audioUrl) return feedItemToPlayerTrack(item)

  return feedItemToPlayerTrack({
    ...item,
    payload: {
      ...item.payload,
      releaseId: share.releaseId,
      trackTitle: share.trackTitle,
      artistName: share.artistName,
      audioUrl: share.audioUrl,
      artworkUrl: share.artworkUrl,
    },
  })
}

export function buildFeedQueue(items: FeedItemDto[]): PlayerTrack[] {
  return items
    .map((entry) => feedItemToPlayerTrack(entry))
    .filter((track): track is PlayerTrack => Boolean(track))
    .filter((track, index, list) => list.findIndex((entry) => entry.id === track.id) === index)
}
