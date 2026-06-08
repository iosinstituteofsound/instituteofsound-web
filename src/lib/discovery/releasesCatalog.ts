/**
 * /releases page catalog — product rule (keep in sync with docs):
 *
 * Anything a published artist adds in **My Studio** must surface here:
 * - Music tracks (`artist_tracks`)
 * - Discography albums / EPs / singles (`artist_albums`)
 * - Scheduled or live premiere releases (`artist_releases`, not draft/archived)
 *
 * Requirements:
 * - `artist_profiles.published = true` only (draft studios stay off the public wire)
 * - Not the hourly one-track-per-artist discover premiere feed (`fetchDiscoverPremiereFeed`)
 * - Explore §03 stays on the premiere feed; this module is the full catalog
 */
import { isSupabaseConfigured } from '@/lib/api/liveMode'
import { v1GetReleasesCatalog } from '@/api/v1Phase5Client'
import * as local from '@/lib/artist-profile/storage'
import type { ArtistAlbum, ArtistProfile, ArtistTrack } from '@/lib/artist-profile/types'
import * as localReleases from '@/lib/releases/localReleases'
import type { ReleaseTrack } from '@/lib/releases/types'
import {
  currentHourBucket,
  type DiscoverPremiereCard,
  type PremiereBadge,
} from '@/lib/discovery/premieres'

const LOCAL_PICKS_KEY = 'ios_discover_premiere_picks'

type LocalPick = {
  trackId: string
  badge: PremiereBadge
  active: boolean
}

function genreLabel(genres: string[] | null | undefined): string {
  const g = genres?.filter(Boolean) ?? []
  if (g.length === 0) return 'UNDERGROUND'
  return g.slice(0, 2).join(' / ').toUpperCase()
}

function autoBadge(track: ArtistTrack): PremiereBadge | null {
  const ageDays = (Date.now() - new Date(track.createdAt).getTime()) / 86400000
  if (ageDays <= 14) return 'new'
  if (track.playCount >= 400) return 'hot'
  return null
}

function releaseTypeFor(
  album: ArtistAlbum | undefined
): 'album' | 'ep' | 'single' {
  if (album?.releaseType === 'album' || album?.releaseType === 'ep') {
    return album.releaseType
  }
  return 'single'
}

function readLocalPickMap(): Map<string, PremiereBadge> {
  try {
    const raw = localStorage.getItem(LOCAL_PICKS_KEY)
    if (!raw) return new Map()
    const picks = JSON.parse(raw) as LocalPick[]
    const map = new Map<string, PremiereBadge>()
    for (const p of picks) {
      if (p.active) map.set(p.trackId, p.badge)
    }
    return map
  } catch {
    return new Map()
  }
}

function trackCard(
  profile: ArtistProfile,
  track: ArtistTrack,
  album: ArtistAlbum | undefined,
  pickBadge: PremiereBadge | undefined,
  bucket: string
): DiscoverPremiereCard {
  const pick = pickBadge
  return {
    trackId: track.id,
    trackTitle: track.title,
    coverUrl: track.coverUrl ?? album?.coverUrl ?? profile.avatarUrl,
    streamUrl: track.streamUrl,
    playCount: track.playCount,
    trackCreatedAt: track.createdAt,
    profileId: profile.id,
    artistSlug: profile.slug,
    artistName: profile.displayName,
    genreLabel: genreLabel(profile.genres),
    releaseType: releaseTypeFor(album),
    badge: pick ?? autoBadge(track),
    isEditorPick: Boolean(pick),
    hourBucket: bucket,
    catalogKind: 'track',
  }
}

function albumCard(
  profile: ArtistProfile,
  album: ArtistAlbum,
  trackCount: number,
  bucket: string
): DiscoverPremiereCard {
  const rt = releaseTypeFor(album)
  return {
    trackId: `album-${album.id}`,
    trackTitle: album.title,
    coverUrl: album.coverUrl ?? profile.avatarUrl,
    streamUrl: '',
    playCount: 0,
    trackCreatedAt: album.createdAt,
    profileId: profile.id,
    artistSlug: profile.slug,
    artistName: profile.displayName,
    genreLabel: genreLabel(profile.genres),
    releaseType: rt,
    badge: rt === 'album' ? 'new' : null,
    isEditorPick: false,
    hourBucket: bucket,
    catalogKind: 'album',
    albumTrackCount: trackCount,
  }
}

function sortCatalog(cards: DiscoverPremiereCard[]): DiscoverPremiereCard[] {
  return [...cards].sort((a, b) => {
    if (a.isEditorPick !== b.isEditorPick) return a.isEditorPick ? -1 : 1
    if (b.playCount !== a.playCount) return b.playCount - a.playCount
    return b.trackCreatedAt.localeCompare(a.trackCreatedAt)
  })
}

function pickStreamUrl(
  track?: ReleaseTrack,
  fallback?: { spotifyUrl?: string; youtubeUrl?: string; soundcloudUrl?: string }
): string {
  const t = track?.spotifyUrl || track?.youtubeUrl || track?.soundcloudUrl
  if (t) return t
  return fallback?.spotifyUrl || fallback?.youtubeUrl || fallback?.soundcloudUrl || ''
}

function buildLocalCatalog(): DiscoverPremiereCard[] {
  const bucket = currentHourBucket()
  const picks = readLocalPickMap()
  const profiles = local.localListPublishedProfiles()
  const cards: DiscoverPremiereCard[] = []

  for (const profile of profiles) {
    const albums = local.localGetAlbums(profile.id)
    const tracks = local.localGetTracks(profile.id)
    const tracksByAlbum = new Map<string, number>()
    for (const t of tracks) {
      if (t.albumId) tracksByAlbum.set(t.albumId, (tracksByAlbum.get(t.albumId) ?? 0) + 1)
    }

    for (const track of tracks) {
      const album = track.albumId ? albums.find((a) => a.id === track.albumId) : undefined
      cards.push(trackCard(profile, track, album, picks.get(track.id), bucket))
    }

    for (const album of albums) {
      const count = tracksByAlbum.get(album.id) ?? 0
      cards.push(albumCard(profile, album, count, bucket))
    }

    const releases = localReleases.localListReleasesForProfile(profile.id).filter(
      (r) => r.status === 'live' || r.status === 'scheduled'
    )
    for (const release of releases) {
      cards.push(...releaseToCards(profile, release, bucket))
    }
  }

  return dedupeCatalog(sortCatalog(cards))
}

function releaseToCards(
  profile: ArtistProfile,
  release: {
    id: string
    slug: string
    title: string
    coverUrl?: string
    releaseType: 'single' | 'ep' | 'album'
    liveAt: string
    spotifyUrl?: string
    youtubeUrl?: string
    soundcloudUrl?: string
    tracks: ReleaseTrack[]
  },
  bucket: string
): DiscoverPremiereCard[] {
  const embed = {
    spotifyUrl: release.spotifyUrl,
    youtubeUrl: release.youtubeUrl,
    soundcloudUrl: release.soundcloudUrl,
  }
  const rt =
    release.releaseType === 'album' || release.releaseType === 'ep'
      ? release.releaseType
      : 'single'

  if (release.tracks.length === 0) {
    const url = pickStreamUrl(undefined, embed)
    return [
      {
        trackId: `release-${release.id}`,
        trackTitle: release.title,
        coverUrl: release.coverUrl ?? profile.avatarUrl,
        streamUrl: url,
        playCount: 0,
        trackCreatedAt: release.liveAt,
        profileId: profile.id,
        artistSlug: profile.slug,
        artistName: profile.displayName,
        genreLabel: genreLabel(profile.genres),
        releaseType: rt,
        badge: 'new',
        isEditorPick: false,
        hourBucket: bucket,
        catalogKind: 'track',
        releaseSlug: release.slug,
      },
    ]
  }

  return release.tracks.map((t, i) => ({
    trackId: `release-${release.id}-t${i}`,
    trackTitle: t.title,
    coverUrl: release.coverUrl ?? profile.avatarUrl,
    streamUrl: pickStreamUrl(t, embed),
    playCount: 0,
    trackCreatedAt: release.liveAt,
    profileId: profile.id,
    artistSlug: profile.slug,
    artistName: profile.displayName,
    genreLabel: genreLabel(profile.genres),
    releaseType: rt,
    badge: null,
    isEditorPick: false,
    hourBucket: bucket,
    catalogKind: 'track' as const,
    releaseSlug: release.slug,
  }))
}

function dedupeCatalog(cards: DiscoverPremiereCard[]): DiscoverPremiereCard[] {
  const seen = new Set<string>()
  const out: DiscoverPremiereCard[] = []
  for (const c of cards) {
    const streamKey = c.streamUrl?.trim().toLowerCase()
    const key =
      c.catalogKind === 'album'
        ? `album:${c.profileId}:${c.trackTitle.toLowerCase()}`
        : streamKey
          ? `stream:${c.profileId}:${streamKey}`
          : `id:${c.trackId}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(c)
  }
  return out
}

/** Public /releases grid — full published artist studio catalog. */
export async function fetchReleasesCatalog(): Promise<DiscoverPremiereCard[]> {
  if (!isSupabaseConfigured()) return buildLocalCatalog()
  try {
    const { cards } = await v1GetReleasesCatalog()
    return cards
  } catch (e) {
    console.warn('[releases catalog]', e)
    return buildLocalCatalog()
  }
}
