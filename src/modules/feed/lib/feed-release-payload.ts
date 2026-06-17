import type { ArtistProfileDto, ExplorePayload, ReleaseDto } from '@/modules/explore/types/explore.types'
import { findArtistForRelease, artistReleaseStats } from '@/modules/explore/lib/release-meta'
import { payloadString } from '@/modules/feed/components/cards/feed-card-shell'
import type { FeedItemDto } from '@/modules/feed/types/feed.types'

export type ReleaseShareArtistSnapshot = {
  profileId?: string
  userId?: string
  displayName: string
  avatarUrl?: string
  bio?: string
  labelName?: string
  genres: string[]
  trackCount?: number
  totalPlays?: string
  releaseCount?: number
  listeners?: string
}

export type ReleaseSharePayload = {
  releaseId: string
  trackTitle: string
  artistName?: string
  audioUrl?: string
  artworkUrl?: string
  releaseUrl?: string
  releaseType?: string
  artist?: ReleaseShareArtistSnapshot
}

function payloadNumber(payload: Record<string, unknown>, key: string): number | undefined {
  const value = payload[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function payloadArtistSnapshot(payload: Record<string, unknown>): ReleaseShareArtistSnapshot | undefined {
  const artistPayload = payload.artist
  if (!artistPayload || typeof artistPayload !== 'object' || Array.isArray(artistPayload)) return undefined

  const artist = artistPayload as Record<string, unknown>
  const displayName = typeof artist.displayName === 'string' ? artist.displayName.trim() : ''
  if (!displayName) return undefined

  return {
    profileId: typeof artist.profileId === 'string' ? artist.profileId : undefined,
    userId: typeof artist.userId === 'string' ? artist.userId : undefined,
    displayName,
    avatarUrl: typeof artist.avatarUrl === 'string' ? artist.avatarUrl : undefined,
    bio: typeof artist.bio === 'string' ? artist.bio : undefined,
    labelName: typeof artist.labelName === 'string' ? artist.labelName : undefined,
    genres: Array.isArray(artist.genres)
      ? artist.genres.filter((entry): entry is string => typeof entry === 'string')
      : [],
    trackCount: payloadNumber(artist, 'trackCount'),
    totalPlays: typeof artist.totalPlays === 'string' ? artist.totalPlays : undefined,
    releaseCount: payloadNumber(artist, 'releaseCount'),
    listeners: typeof artist.listeners === 'string' ? artist.listeners : undefined,
  }
}

export function isReleaseSharePayload(payload: Record<string, unknown>): boolean {
  return Boolean(payloadString(payload, 'releaseId'))
}

export function parseReleaseSharePayload(payload: Record<string, unknown>): ReleaseSharePayload | null {
  const releaseId = payloadString(payload, 'releaseId')
  if (!releaseId) return null

  const trackTitle = payloadString(payload, 'trackTitle') ?? 'Shared release'

  return {
    releaseId,
    trackTitle,
    artistName: payloadString(payload, 'artistName'),
    audioUrl: payloadString(payload, 'audioUrl'),
    artworkUrl: payloadString(payload, 'artworkUrl'),
    releaseUrl: payloadString(payload, 'releaseUrl'),
    releaseType: payloadString(payload, 'releaseType'),
    artist: payloadArtistSnapshot(payload),
  }
}

export function releaseSharePayloadToReleaseDto(payload: ReleaseSharePayload): ReleaseDto {
  return {
    id: payload.releaseId,
    title: payload.trackTitle,
    coverUrl: payload.artworkUrl,
    artistName: payload.artistName,
    streamUrl: payload.audioUrl,
    type: payload.releaseType as ReleaseDto['type'],
    artistProfileId: payload.artist?.profileId,
    labelName: payload.artist?.labelName,
    genre: payload.artist?.genres[0],
  }
}

/** Fill missing preview audio/art from the live explore catalog (e.g. old shared posts). */
export function resolveReleaseShareFromCatalog(
  share: ReleaseSharePayload,
  explore?: ExplorePayload | null,
): ReleaseSharePayload {
  if (!explore) return share

  const match = findReleaseForMusicPayload(
    {
      releaseId: share.releaseId,
      trackTitle: share.trackTitle,
      artistName: share.artistName,
    },
    explore.releases,
    explore.artists,
  )
  if (!match) return share

  const catalogPayload = buildReleaseSharePayload(match.release, match.artist, explore.releases)

  return {
    ...share,
    audioUrl: share.audioUrl ?? catalogPayload.audioUrl,
    artworkUrl: share.artworkUrl ?? catalogPayload.artworkUrl,
    releaseUrl: share.releaseUrl ?? catalogPayload.releaseUrl,
    releaseType: share.releaseType ?? catalogPayload.releaseType,
    artistName: share.artistName ?? catalogPayload.artistName,
    artist: share.artist ?? catalogPayload.artist,
  }
}

export function buildReleaseSharePayload(
  release: ReleaseDto,
  artist?: ArtistProfileDto,
  allReleases: ReleaseDto[] = [],
): ReleaseSharePayload {
  const origin = typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : ''
  const stats = artist ? artistReleaseStats(artist, allReleases) : null

  const payload: ReleaseSharePayload = {
    releaseId: release.id,
    trackTitle: release.title,
    artistName: release.artistName ?? artist?.displayName,
    audioUrl: release.streamUrl,
    artworkUrl: release.coverUrl,
    releaseUrl: origin ? `${origin}/releases/${release.id}` : `/releases/${release.id}`,
    releaseType: release.type,
  }

  if (artist) {
    payload.artist = {
      profileId: artist.id,
      userId: artist.userId,
      displayName: artist.displayName,
      avatarUrl: artist.avatarUrl,
      bio: artist.bio,
      labelName: artist.labelName,
      genres: artist.genres.slice(0, 4),
      trackCount: stats?.trackCount,
      totalPlays: stats?.totalPlays,
      releaseCount: stats?.releaseCount,
      listeners: stats?.listeners,
    }
  }

  return payload
}

export function releaseSharePayloadToRecord(payload: ReleaseSharePayload): Record<string, unknown> {
  return { ...payload }
}

function normalizeLookup(value?: string): string {
  return value?.trim().toLowerCase() ?? ''
}

function artistNamesMatch(left?: string, right?: string): boolean {
  const a = normalizeLookup(left)
  const b = normalizeLookup(right)
  if (!a || !b) return false
  return a === b || a.includes(b) || b.includes(a)
}

export function findReleaseForMusicPayload(
  payload: Record<string, unknown>,
  releases: ReleaseDto[],
  artists: ArtistProfileDto[],
): { release: ReleaseDto; artist?: ArtistProfileDto } | null {
  const releaseId = payloadString(payload, 'releaseId')
  if (releaseId) {
    const release = releases.find((entry) => entry.id === releaseId)
    if (release) {
      return { release, artist: findArtistForRelease(release, artists) }
    }
  }

  const trackTitle = payloadString(payload, 'trackTitle')
  if (!trackTitle) return null

  const artistName = payloadString(payload, 'artistName')
  const normalizedTitle = normalizeLookup(trackTitle)

  const candidates = releases.filter((release) => normalizeLookup(release.title) === normalizedTitle)
  if (candidates.length === 0) return null

  const ranked = candidates
    .map((release) => {
      const artist = findArtistForRelease(release, artists)
      const artistMatch =
        !artistName ||
        artistNamesMatch(release.artistName, artistName) ||
        artistNamesMatch(artist?.displayName, artistName)
      return { release, artist, artistMatch }
    })
    .sort((left, right) => {
      if (left.artistMatch !== right.artistMatch) return left.artistMatch ? -1 : 1
      if (Boolean(left.release.streamUrl) !== Boolean(right.release.streamUrl)) {
        return left.release.streamUrl ? -1 : 1
      }
      return 0
    })

  const match = ranked.find((entry) => entry.artistMatch) ?? ranked[0]
  if (!match) return null
  return { release: match.release, artist: match.artist }
}

export function enrichMusicFeedItem(item: FeedItemDto, explore?: ExplorePayload | null): FeedItemDto {
  if (item.type !== 'music' || !explore) return item

  const parsedShare = parseReleaseSharePayload(item.payload)
  if (parsedShare) {
    const resolvedShare = resolveReleaseShareFromCatalog(parsedShare, explore)
    const resolvedAudio = resolvedShare.audioUrl
    const existingAudio = payloadString(item.payload, 'audioUrl')

    if (existingAudio === resolvedAudio && payloadString(item.payload, 'releaseId') === resolvedShare.releaseId) {
      return item
    }

    return {
      ...item,
      payload: {
        ...item.payload,
        ...releaseSharePayloadToRecord(resolvedShare),
      },
    }
  }

  const match = findReleaseForMusicPayload(item.payload, explore.releases, explore.artists)
  if (!match) return item

  const enrichedPayload = releaseSharePayloadToRecord(
    buildReleaseSharePayload(match.release, match.artist, explore.releases),
  )

  const trackTitle = payloadString(item.payload, 'trackTitle')
  const artistName = payloadString(item.payload, 'artistName')
  if (trackTitle) enrichedPayload.trackTitle = trackTitle
  if (artistName) enrichedPayload.artistName = artistName

  return {
    ...item,
    payload: {
      ...item.payload,
      ...enrichedPayload,
    },
  }
}

export function isReleaseShareItem(item: FeedItemDto): boolean {
  return item.type === 'music' && isReleaseSharePayload(item.payload)
}
