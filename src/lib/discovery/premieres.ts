import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import * as local from '@/lib/artist-profile/storage'
import type { ArtistProfile, ArtistTrack } from '@/lib/artist-profile/types'

export type PremiereBadge = 'wire_pick' | 'hot' | 'new'
export type PremiereFilter = 'all' | 'album' | 'ep' | 'single' | 'archive'

export interface DiscoverPremiereCard {
  trackId: string
  trackTitle: string
  coverUrl?: string
  streamUrl: string
  playCount: number
  trackCreatedAt: string
  profileId: string
  artistSlug: string
  artistName: string
  genreLabel: string
  releaseType: 'album' | 'ep' | 'single'
  badge: PremiereBadge | null
  isEditorPick: boolean
  hourBucket: string
  /** Full /releases catalog — album shell without tracks yet */
  catalogKind?: 'track' | 'album'
  albumTrackCount?: number
}

export interface DiscoverPremierePickRow {
  id: string
  trackId: string
  profileId: string
  trackTitle: string
  artistName: string
  artistSlug: string
  badge: PremiereBadge
  sortOrder: number
  createdAt: string
}

const LOCAL_PICKS_KEY = 'ios_discover_premiere_picks'

type LocalPick = {
  id: string
  trackId: string
  profileId: string
  badge: PremiereBadge
  sortOrder: number
  active: boolean
  createdAt: string
}

export function currentHourBucket(): string {
  const d = new Date()
  const y = d.getUTCFullYear()
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0')
  const da = String(d.getUTCDate()).padStart(2, '0')
  const h = String(d.getUTCHours()).padStart(2, '0')
  return `${y}${mo}${da}${h}`
}

function hashIndex(seed: string, size: number): number {
  if (size <= 0) return 0
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h % size
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

function mapRow(row: {
  track_id: string
  track_title: string
  cover_url: string | null
  stream_url: string
  play_count: number
  track_created_at: string
  profile_id: string
  artist_slug: string
  artist_name: string
  genres: string[] | null
  release_type: string
  badge: string | null
  is_editor_pick: boolean
  hour_bucket: string
}): DiscoverPremiereCard {
  const rt = row.release_type === 'album' || row.release_type === 'ep' ? row.release_type : 'single'
  const badge =
    row.badge === 'wire_pick' || row.badge === 'hot' || row.badge === 'new' ? row.badge : null
  return {
    trackId: row.track_id,
    trackTitle: row.track_title,
    coverUrl: row.cover_url ?? undefined,
    streamUrl: row.stream_url,
    playCount: row.play_count ?? 0,
    trackCreatedAt: row.track_created_at,
    profileId: row.profile_id,
    artistSlug: row.artist_slug,
    artistName: row.artist_name,
    genreLabel: genreLabel(row.genres),
    releaseType: rt,
    badge,
    isEditorPick: row.is_editor_pick,
    hourBucket: row.hour_bucket,
  }
}

function readLocalPicks(): LocalPick[] {
  try {
    const raw = localStorage.getItem(LOCAL_PICKS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as LocalPick[]
  } catch {
    return []
  }
}

function writeLocalPicks(picks: LocalPick[]) {
  localStorage.setItem(LOCAL_PICKS_KEY, JSON.stringify(picks))
}

function buildLocalFeed(limit: number): DiscoverPremiereCard[] {
  const bucket = currentHourBucket()
  const profiles = local.localListPublishedProfiles()
  const picks = readLocalPicks().filter((p) => p.active)
  const pickedProfileIds = new Set<string>()

  const cards: DiscoverPremiereCard[] = []

  for (const pick of picks.sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.localeCompare(a.createdAt))) {
    const profile = profiles.find((p) => p.id === pick.profileId)
    const tracks = profile ? local.localGetTracks(profile.id) : []
    const track = tracks.find((t) => t.id === pick.trackId)
    if (!profile || !track) continue
    pickedProfileIds.add(profile.id)
    const albums = local.localGetAlbums(profile.id)
    const album = track.albumId ? albums.find((a) => a.id === track.albumId) : undefined
    const releaseType =
      album?.releaseType === 'album' || album?.releaseType === 'ep' ? album.releaseType : 'single'
    cards.push({
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
      releaseType,
      badge: pick.badge,
      isEditorPick: true,
      hourBucket: bucket,
    })
  }

  for (const profile of profiles) {
    if (pickedProfileIds.has(profile.id)) continue
    const tracks = local.localGetTracks(profile.id)
    if (tracks.length === 0) continue
    const idx = hashIndex(`${profile.id}:${bucket}`, tracks.length)
    const track = tracks[idx]!
    const albums = local.localGetAlbums(profile.id)
    const album = track.albumId ? albums.find((a) => a.id === track.albumId) : undefined
    const releaseType =
      album?.releaseType === 'album' || album?.releaseType === 'ep' ? album.releaseType : 'single'
    cards.push({
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
      releaseType,
      badge: autoBadge(track),
      isEditorPick: false,
      hourBucket: bucket,
    })
  }

  return cards.slice(0, limit)
}

export async function fetchDiscoverPremiereFeed(limit = 24): Promise<DiscoverPremiereCard[]> {
  if (!isSupabaseConfigured()) return buildLocalFeed(limit)

  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('discover_premiere_feed', { p_limit: limit })
  if (error) {
    console.warn('[premieres] feed', error.message)
    return buildLocalFeed(limit)
  }
  return (data ?? []).map((row: Record<string, unknown>) =>
    mapRow(row as Parameters<typeof mapRow>[0])
  )
}

export function filterPremiereCards(
  cards: DiscoverPremiereCard[],
  filter: PremiereFilter
): DiscoverPremiereCard[] {
  if (filter === 'all') return cards
  if (filter === 'archive') {
    const cutoff = Date.now() - 180 * 86400000
    return cards.filter((c) => new Date(c.trackCreatedAt).getTime() < cutoff)
  }
  return cards.filter((c) => c.releaseType === filter)
}

export function formatPremiereDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).toUpperCase()
}

export function formatPlayCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export async function listDiscoverPremierePicksForDesk(): Promise<DiscoverPremierePickRow[]> {
  if (!isSupabaseConfigured()) {
    const profiles = local.localListPublishedProfiles()
    return readLocalPicks()
      .filter((p) => p.active)
      .map((pick) => {
        const profile = profiles.find((pr) => pr.id === pick.profileId)
        const track = profile ? local.localGetTracks(profile.id).find((t) => t.id === pick.trackId) : undefined
        return {
          id: pick.id,
          trackId: pick.trackId,
          profileId: pick.profileId,
          trackTitle: track?.title ?? 'Track',
          artistName: profile?.displayName ?? 'Artist',
          artistSlug: profile?.slug ?? '',
          badge: pick.badge,
          sortOrder: pick.sortOrder,
          createdAt: pick.createdAt,
        }
      })
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('discover_premiere_picks')
    .select('id, track_id, profile_id, badge, sort_order, created_at')
    .eq('active', true)
    .order('sort_order')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  const rows: DiscoverPremierePickRow[] = []
  for (const row of data ?? []) {
    const [{ data: prof }, { data: tr }] = await Promise.all([
      supabase
        .from('artist_profiles')
        .select('slug, display_name')
        .eq('id', row.profile_id)
        .maybeSingle(),
      supabase.from('artist_tracks').select('title').eq('id', row.track_id).maybeSingle(),
    ])
    if (!prof || !tr) continue
    rows.push({
      id: row.id,
      trackId: row.track_id,
      profileId: row.profile_id,
      trackTitle: tr.title,
      artistName: prof.display_name,
      artistSlug: prof.slug,
      badge: row.badge as PremiereBadge,
      sortOrder: row.sort_order ?? 0,
      createdAt: row.created_at,
    })
  }
  return rows
}

export type PremierePickSearchHit = {
  profile: Pick<ArtistProfile, 'id' | 'slug' | 'displayName'>
  track: ArtistTrack
}

export async function searchArtistTracksForPremierePick(
  query: string
): Promise<PremierePickSearchHit[]> {
  const q = query.trim().toLowerCase()
  if (!q) return []

  if (!isSupabaseConfigured()) {
    const out: PremierePickSearchHit[] = []
    for (const profile of local.localListPublishedProfiles()) {
      if (
        !profile.slug.toLowerCase().includes(q) &&
        !profile.displayName.toLowerCase().includes(q)
      ) {
        continue
      }
      for (const track of local.localGetTracks(profile.id)) {
        if (track.title.toLowerCase().includes(q) || profile.displayName.toLowerCase().includes(q)) {
          out.push({ profile, track })
        }
      }
    }
    return out.slice(0, 12)
  }

  const supabase = getSupabase()
  const { data: profiles, error } = await supabase
    .from('artist_profiles')
    .select('id, slug, display_name, genres, published')
    .eq('published', true)
    .or(`slug.ilike.%${q}%,display_name.ilike.%${q}%`)
    .limit(8)

  if (error) throw new Error(error.message)
  const out: PremierePickSearchHit[] = []

  for (const row of profiles ?? []) {
    const { data: byTitle } = await supabase
      .from('artist_tracks')
      .select('*')
      .eq('profile_id', row.id)
      .ilike('title', `%${q}%`)
      .limit(8)
    const tracks =
      byTitle && byTitle.length > 0
        ? byTitle
        : (
            await supabase.from('artist_tracks').select('*').eq('profile_id', row.id).limit(8)
          ).data ?? []

    for (const t of tracks) {
      out.push({
        profile: {
          id: row.id,
          slug: row.slug,
          displayName: row.display_name,
        },
        track: {
          id: t.id,
          profileId: t.profile_id,
          albumId: t.album_id ?? undefined,
          title: t.title,
          streamUrl: t.stream_url,
          coverUrl: t.cover_url ?? undefined,
          playCount: t.play_count ?? 0,
          sortOrder: t.sort_order ?? 0,
          createdAt: t.created_at,
        },
      })
    }
  }
  return out.slice(0, 12)
}

export async function addDiscoverPremierePick(input: {
  trackId: string
  profileId: string
  pickedBy: string
  badge?: PremiereBadge
  sortOrder?: number
}): Promise<void> {
  const badge = input.badge ?? 'wire_pick'

  if (!isSupabaseConfigured()) {
    const picks = readLocalPicks().filter((p) => p.trackId !== input.trackId)
    picks.push({
      id: crypto.randomUUID(),
      trackId: input.trackId,
      profileId: input.profileId,
      badge,
      sortOrder: input.sortOrder ?? 0,
      active: true,
      createdAt: new Date().toISOString(),
    })
    writeLocalPicks(picks)
    return
  }

  const supabase = getSupabase()
  const { error } = await supabase.from('discover_premiere_picks').upsert(
    {
      track_id: input.trackId,
      profile_id: input.profileId,
      picked_by: input.pickedBy,
      badge,
      sort_order: input.sortOrder ?? 0,
      active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'track_id' }
  )
  if (error) throw new Error(error.message)
}

export async function removeDiscoverPremierePick(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    writeLocalPicks(readLocalPicks().map((p) => (p.id === id ? { ...p, active: false } : p)))
    return
  }
  const supabase = getSupabase()
  const { error } = await supabase
    .from('discover_premiere_picks')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}
