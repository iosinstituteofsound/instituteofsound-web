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
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1GetReleasesCatalog } from '@/api/v1Phase5Client'
import { isArtistDiscoverVisible } from '@/lib/artist-profile/profileVisibility'
import * as local from '@/lib/artist-profile/storage'
import { DEFAULT_HERO_LAYOUT } from '@/lib/artist-profile/heroLayout'
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

function stubProfile(p: {
  id: string
  slug: string
  displayName: string
  genres: string[]
  avatarUrl?: string
}): ArtistProfile {
  return {
    id: p.id,
    userId: '',
    slug: p.slug,
    displayName: p.displayName,
    genres: p.genres,
    influenceTags: [],
    social: {},
    monthlyListenersDisplay: '',
    accentColor: '#d40000',
    themePreset: 'metal',
    heroLayout: DEFAULT_HERO_LAYOUT,
    socialLinkOrder: [],
    published: true,
    pageStatus: 'live',
    pageRefreshedAt: '',
    lastActivityAt: '',
    createdAt: '',
    updatedAt: '',
    avatarUrl: p.avatarUrl,
  }
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

type TrackRow = {
  id: string
  profile_id: string
  album_id: string | null
  title: string
  stream_url: string
  cover_url: string | null
  play_count: number | null
  sort_order: number | null
  created_at: string
}

type AlbumRow = {
  id: string
  profile_id: string
  title: string
  cover_url: string | null
  release_type: string
  created_at: string
}

type ReleaseRow = {
  id: string
  profile_id: string
  slug: string
  title: string
  cover_url: string | null
  release_type: string
  live_at: string
  spotify_url: string | null
  youtube_url: string | null
  soundcloud_url: string | null
  tracks: unknown
}

async function paginate<T>(
  fetchPage: (from: number, to: number) => Promise<{ data: T[] | null; error: { message: string } | null }>
): Promise<T[]> {
  const out: T[] = []
  const page = 1000
  let from = 0
  while (true) {
    const { data, error } = await fetchPage(from, from + page - 1)
    if (error) throw new Error(error.message)
    if (!data?.length) break
    out.push(...data)
    if (data.length < page) break
    from += page
  }
  return out
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

export async function fetchSupabaseCatalogWithClient(
  supabase: import('@supabase/supabase-js').SupabaseClient,
): Promise<DiscoverPremiereCard[]> {
  const bucket = currentHourBucket()

  const { data: profiles, error: profileErr } = await supabase
    .from('artist_profiles')
    .select('id, slug, display_name, genres, avatar_url, last_activity_at, page_refreshed_at, published')
    .eq('published', true)

  if (profileErr) throw new Error(profileErr.message)
  const liveProfiles = (profiles ?? []).filter((p) =>
    isArtistDiscoverVisible({
      id: p.id,
      userId: '',
      slug: p.slug,
      displayName: p.display_name,
      genres: (p.genres as string[]) ?? [],
      influenceTags: [],
      social: {},
      monthlyListenersDisplay: '',
      accentColor: '#d40000',
      themePreset: 'metal',
      heroLayout: DEFAULT_HERO_LAYOUT,
      socialLinkOrder: [],
      published: p.published,
      pageStatus: 'live',
      pageRefreshedAt: p.page_refreshed_at ?? '',
      lastActivityAt: p.last_activity_at ?? p.page_refreshed_at ?? '',
      createdAt: '',
      updatedAt: '',
    }),
  )
  if (!liveProfiles.length) return []

  const profileIds = liveProfiles.map((p) => p.id)
  const profileById = new Map(
    liveProfiles.map((p) => [
      p.id,
      {
        id: p.id,
        slug: p.slug,
        displayName: p.display_name,
        genres: (p.genres as string[]) ?? [],
        avatarUrl: p.avatar_url ?? undefined,
      },
    ])
  )

  const [trackRows, albumRows, pickResult, releaseRows] = await Promise.all([
    paginate<TrackRow>(async (from, to) =>
      supabase.from('artist_tracks').select('*').in('profile_id', profileIds).range(from, to)
    ),
    paginate<AlbumRow>(async (from, to) =>
      supabase.from('artist_albums').select('*').in('profile_id', profileIds).range(from, to)
    ),
    supabase.from('discover_premiere_picks').select('track_id, badge').eq('active', true),
    paginate<ReleaseRow>(async (from, to) =>
      supabase
        .from('artist_releases')
        .select('*')
        .in('profile_id', profileIds)
        .in('status', ['live', 'scheduled'])
        .range(from, to)
    ),
  ])

  const picks = new Map<string, PremiereBadge>()
  for (const row of pickResult.data ?? []) {
    const b = row.badge as PremiereBadge
    if (b === 'wire_pick' || b === 'hot' || b === 'new') picks.set(row.track_id, b)
  }

  const albumsById = new Map(
    (albumRows ?? []).map((a) => [
      a.id,
      {
        id: a.id,
        profileId: a.profile_id,
        title: a.title,
        coverUrl: a.cover_url ?? undefined,
        releaseType: a.release_type as ArtistAlbum['releaseType'],
        createdAt: a.created_at,
      },
    ])
  )

  const tracksByAlbum = new Map<string, number>()
  const cards: DiscoverPremiereCard[] = []

  for (const row of trackRows ?? []) {
    const profile = profileById.get(row.profile_id)
    if (!profile) continue
    const album = row.album_id ? albumsById.get(row.album_id) : undefined
    if (row.album_id) {
      tracksByAlbum.set(row.album_id, (tracksByAlbum.get(row.album_id) ?? 0) + 1)
    }
    const track: ArtistTrack = {
      id: row.id,
      profileId: row.profile_id,
      albumId: row.album_id ?? undefined,
      title: row.title,
      streamUrl: row.stream_url,
      coverUrl: row.cover_url ?? undefined,
      playCount: row.play_count ?? 0,
      sortOrder: row.sort_order ?? 0,
      createdAt: row.created_at,
    }
    const fullProfile = stubProfile(profile)
    cards.push(
      trackCard(
        fullProfile,
        track,
        album
          ? {
              id: album.id,
              profileId: album.profileId,
              title: album.title,
              coverUrl: album.coverUrl,
              releaseType: album.releaseType,
              sortOrder: 0,
              createdAt: album.createdAt,
            }
          : undefined,
        picks.get(row.id),
        bucket
      )
    )
  }

  for (const album of albumsById.values()) {
    const count = tracksByAlbum.get(album.id) ?? 0
    const profile = profileById.get(album.profileId)
    if (!profile) continue
    cards.push(
      albumCard(
        stubProfile(profile),
        {
          id: album.id,
          profileId: album.profileId,
          title: album.title,
          coverUrl: album.coverUrl,
          releaseType: album.releaseType,
          sortOrder: 0,
          createdAt: album.createdAt,
        },
        count,
        bucket
      )
    )
  }

  for (const row of releaseRows) {
    const profile = profileById.get(row.profile_id)
    if (!profile) continue
    const tracks = Array.isArray(row.tracks) ? (row.tracks as ReleaseTrack[]) : []
    cards.push(
      ...releaseToCards(
        stubProfile(profile),
        {
          id: row.id,
          slug: row.slug,
          title: row.title,
          coverUrl: row.cover_url ?? undefined,
          releaseType: row.release_type as 'single' | 'ep' | 'album',
          liveAt: row.live_at,
          spotifyUrl: row.spotify_url ?? undefined,
          youtubeUrl: row.youtube_url ?? undefined,
          soundcloudUrl: row.soundcloud_url ?? undefined,
          tracks,
        },
        bucket
      )
    )
  }

  return dedupeCatalog(sortCatalog(cards))
}

async function fetchSupabaseCatalog(): Promise<DiscoverPremiereCard[]> {
  return fetchSupabaseCatalogWithClient(getSupabase())
}

/** Public /releases grid — full published artist studio catalog. */
export async function fetchReleasesCatalog(): Promise<DiscoverPremiereCard[]> {
  if (!isSupabaseConfigured()) return buildLocalCatalog()
  try {
    return await viaV1Api(
      async () => {
        const { cards } = await v1GetReleasesCatalog()
        return cards
      },
      () => fetchSupabaseCatalog(),
    )
  } catch (e) {
    console.warn('[releases catalog]', e)
    return buildLocalCatalog()
  }
}
