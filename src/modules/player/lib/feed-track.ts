import type { FeedItemDto } from '@/modules/feed/types/feed.types'
import { payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import type { PlayerTrack } from '@/modules/player/types/player.types'

export function feedItemToPlayerTrack(item: FeedItemDto): PlayerTrack | null {
  if (item.type !== 'music') return null

  const audioUrl = payloadString(item.payload, 'audioUrl')
  if (!audioUrl) return null

  const trackTitle = payloadString(item.payload, 'trackTitle') ?? 'Shared track'
  const artistName = payloadString(item.payload, 'artistName')
  const artworkUrl = payloadString(item.payload, 'artworkUrl')
  const spotifyUrl = payloadString(item.payload, 'spotifyUrl')
  const youtubeUrl = payloadString(item.payload, 'youtubeUrl')

  return {
    id: item.id,
    title: trackTitle,
    artist: artistName,
    artworkUrl,
    audioUrl,
    sourceId: item.id,
    spotifyUrl,
    youtubeUrl,
  }
}

export function buildFeedQueue(items: FeedItemDto[]): PlayerTrack[] {
  return items
    .map((entry) => feedItemToPlayerTrack(entry))
    .filter((track): track is PlayerTrack => Boolean(track))
    .filter((track, index, list) => list.findIndex((entry) => entry.id === track.id) === index)
}
