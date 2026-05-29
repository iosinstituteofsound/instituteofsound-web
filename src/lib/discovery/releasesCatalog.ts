import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import * as local from '@/lib/artist-profile/storage'
import { DEFAULT_HERO_LAYOUT } from '@/lib/artist-profile/heroLayout'
import type { ArtistAlbum, ArtistProfile, ArtistTrack } from '@/lib/artist-profile/types'
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
      if (count === 0) cards.push(albumCard(profile, album, 0, bucket))
    }
  }

  return sortCatalog(cards)
}

async function fetchSupabaseCatalog(): Promise<DiscoverPremiereCard[]> {
  const supabase = getSupabase()
  const bucket = currentHourBucket()

  const { data: profiles, error: profileErr } = await supabase
    .from('artist_profiles')
    .select('id, slug, display_name, genres, avatar_url')
    .eq('published', true)

  if (profileErr) throw new Error(profileErr.message)
  if (!profiles?.length) return []

  const profileIds = profiles.map((p) => p.id)
  const profileById = new Map(
    profiles.map((p) => [
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

  const [{ data: trackRows, error: trackErr }, { data: albumRows, error: albumErr }, { data: pickRows }] =
    await Promise.all([
      supabase.from('artist_tracks').select('*').in('profile_id', profileIds),
      supabase.from('artist_albums').select('*').in('profile_id', profileIds),
      supabase
        .from('discover_premiere_picks')
        .select('track_id, badge')
        .eq('active', true),
    ])

  if (trackErr) throw new Error(trackErr.message)
  if (albumErr) throw new Error(albumErr.message)

  const picks = new Map<string, PremiereBadge>()
  for (const row of pickRows ?? []) {
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
    if (count > 0) continue
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
        0,
        bucket
      )
    )
  }

  return sortCatalog(cards)
}

/** Every published track + album shells (full catalog for /releases). */
export async function fetchReleasesCatalog(): Promise<DiscoverPremiereCard[]> {
  if (!isSupabaseConfigured()) return buildLocalCatalog()
  try {
    return await fetchSupabaseCatalog()
  } catch (e) {
    console.warn('[releases catalog]', e)
    return buildLocalCatalog()
  }
}
