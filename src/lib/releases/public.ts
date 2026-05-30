import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { viaV1Api } from '@/lib/api/v1Route'
import { v1GetPublicRelease } from '@/api/v1Phase4Client'
import type { PublicRelease, ReleaseMilestone } from '@/lib/releases/types'
import * as local from '@/lib/releases/localReleases'
import { listReleaseMilestones } from '@/lib/releases/service'

function mapPublic(row: Record<string, unknown>, milestones: ReleaseMilestone[]): PublicRelease {
  const isLive = Boolean(row.is_live)
  return {
    id: String(row.id),
    profileId: String(row.artist_profile_id ?? row.profile_id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: row.subtitle ? String(row.subtitle) : undefined,
    story: row.story ? String(row.story) : undefined,
    coverUrl: row.cover_url ? String(row.cover_url) : undefined,
    releaseType: row.release_type as PublicRelease['releaseType'],
    liveAt: String(row.live_at),
    status: row.status as PublicRelease['status'],
    spotifyUrl: row.spotify_url ? String(row.spotify_url) : undefined,
    youtubeUrl: row.youtube_url ? String(row.youtube_url) : undefined,
    soundcloudUrl: row.soundcloud_url ? String(row.soundcloud_url) : undefined,
    sceneCity: row.scene_city ? String(row.scene_city) : undefined,
    sceneGenreSlug: row.scene_genre_slug ? String(row.scene_genre_slug) : undefined,
    tracks: Array.isArray(row.tracks) ? (row.tracks as PublicRelease['tracks']) : [],
    linkedCommunityPostId: row.linked_community_post_id
      ? String(row.linked_community_post_id)
      : undefined,
    spinPromoted: Boolean(row.spin_promoted),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
    isLive,
    embedLocked: Boolean(row.embed_locked),
    secondsUntilLive: Number(row.seconds_until_live ?? 0),
    artistSlug: String(row.artist_slug),
    artistName: String(row.artist_name),
    artistAvatarUrl: row.artist_avatar_url ? String(row.artist_avatar_url) : undefined,
    editorialSlug: row.editorial_slug ? String(row.editorial_slug) : undefined,
    editorialTitle: row.editorial_title ? String(row.editorial_title) : undefined,
    milestones,
  }
}

async function directFetchPublicRelease(slug: string): Promise<PublicRelease | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase.rpc('release_public', { p_slug: slug })

  if (error) {
    console.warn('[release] public', error.message)
    return null
  }

  const row = (data ?? [])[0] as Record<string, unknown> | undefined
  if (!row) return null

  const milestones = await listReleaseMilestones(String(row.id))
  return mapPublic(row, milestones)
}

export async function fetchPublicRelease(slug: string): Promise<PublicRelease | null> {
  if (!isSupabaseConfigured()) {
    const r = local.localGetReleaseBySlug(slug)
    if (!r || r.status === 'draft') return null
    const liveAt = new Date(r.liveAt).getTime()
    const now = Date.now()
    const isLive = r.status === 'live' || liveAt <= now
    const milestones = local.localListMilestones(r.id)
    return {
      ...r,
      isLive,
      embedLocked: !isLive,
      secondsUntilLive: Math.max(0, Math.floor((liveAt - now) / 1000)),
      artistSlug: 'demo-artist',
      artistName: 'Demo Artist',
      milestones,
    }
  }

  return viaV1Api(
    async () => {
      const { release } = await v1GetPublicRelease(slug)
      return release
    },
    () => directFetchPublicRelease(slug),
  )
}

export function formatPremiereCountdown(seconds: number): string {
  if (seconds <= 0) return 'Live now'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
