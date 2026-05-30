import type { SupabaseClient } from '@supabase/supabase-js'
import { repoGetArtistProfileByUserId } from '../../src/lib/artist-profile/profileRepository.js'
import type { ArtistProfile } from '../../src/lib/artist-profile/types.js'
import type { ArtistProfileSnapshotV1 } from '../../src/lib/artist-page-recovery/types.js'

function profileInsertRow(p: ArtistProfileSnapshotV1['profile']) {
  const social = p.social ?? {}
  return {
    id: p.id,
    user_id: p.userId,
    slug: p.slug,
    display_name: p.displayName,
    tagline: p.tagline ?? null,
    bio: p.bio ?? null,
    avatar_url: p.avatarUrl ?? null,
    banner_url: p.bannerUrl ?? null,
    logo_url: p.logoUrl ?? null,
    genres: p.genres ?? [],
    influence_tags: p.influenceTags ?? [],
    country: p.country ?? null,
    artist_manager_name: p.artistManagerName ?? null,
    artist_manager_handle: p.artistManagerHandle ?? null,
    website_url: social.website ?? null,
    spotify_url: social.spotify ?? null,
    youtube_url: social.youtube ?? null,
    instagram_url: social.instagram ?? null,
    facebook_url: social.facebook ?? null,
    bandcamp_url: social.bandcamp ?? null,
    monthly_listeners_display: p.monthlyListenersDisplay ?? '—',
    artist_pick_track_id: p.artistPickTrackId ?? null,
    accent_color: p.accentColor,
    theme_preset: p.themePreset,
    hero_video_url: p.heroVideoUrl ?? null,
    hero_layout: p.heroLayout,
    social_link_order: p.socialLinkOrder ?? [],
    press_kit_url: p.pressKitUrl ?? null,
    press_kit_label: p.pressKitLabel ?? null,
    published: p.published,
    page_status: p.pageStatus ?? (p.published ? 'live' : 'pending'),
    page_refreshed_at: p.pageRefreshedAt ?? p.updatedAt,
    last_activity_at: p.lastActivityAt ?? p.pageRefreshedAt ?? p.updatedAt,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  }
}

/** Desk-only restore using service-role (or elevated) Supabase client — no browser/local paths. */
export async function restoreArtistProfileArchiveWithAdmin(
  archiveId: string,
  restoredByUserId: string,
  supabase: SupabaseClient,
): Promise<ArtistProfile> {
  const { data: archiveRow, error: archErr } = await supabase
    .from('artist_profile_archives')
    .select('*')
    .eq('id', archiveId)
    .maybeSingle()
  if (archErr) throw new Error(archErr.message)
  if (!archiveRow) throw new Error('Archive not found.')
  if (archiveRow.restored_at) throw new Error('This page was already restored.')

  const snapshot = archiveRow.snapshot as ArtistProfileSnapshotV1
  const { data: existing } = await supabase
    .from('artist_profiles')
    .select('id')
    .eq('user_id', archiveRow.user_id)
    .maybeSingle()
  if (existing) throw new Error('This user already has an active artist page.')

  const { error: profileErr } = await supabase
    .from('artist_profiles')
    .insert(profileInsertRow(snapshot.profile))
  if (profileErr) throw new Error(profileErr.message)

  if (snapshot.albums.length) {
    const { error } = await supabase.from('artist_albums').insert(
      snapshot.albums.map((a) => ({
        id: a.id,
        profile_id: a.profileId,
        title: a.title,
        cover_url: a.coverUrl ?? null,
        release_year: a.releaseYear ?? null,
        release_type: a.releaseType,
        sort_order: a.sortOrder ?? 0,
        created_at: a.createdAt,
      })),
    )
    if (error) throw new Error(error.message)
  }

  if (snapshot.tracks.length) {
    const { error } = await supabase.from('artist_tracks').insert(
      snapshot.tracks.map((t) => ({
        id: t.id,
        profile_id: t.profileId,
        album_id: t.albumId ?? null,
        title: t.title,
        stream_url: t.streamUrl,
        cover_url: t.coverUrl ?? null,
        play_count: t.playCount ?? 0,
        sort_order: t.sortOrder ?? 0,
        created_at: t.createdAt,
      })),
    )
    if (error) throw new Error(error.message)
  }

  if (snapshot.videos.length) {
    const { error } = await supabase.from('artist_videos').insert(
      snapshot.videos.map((v) => ({
        id: v.id,
        profile_id: v.profileId,
        title: v.title,
        video_url: v.videoUrl,
        thumbnail_url: v.thumbnailUrl ?? null,
        sort_order: v.sortOrder ?? 0,
        created_at: v.createdAt,
      })),
    )
    if (error) throw new Error(error.message)
  }

  if (snapshot.merch.length) {
    const { error } = await supabase.from('artist_merch_items').insert(
      snapshot.merch.map((m) => ({
        id: m.id,
        profile_id: m.profileId,
        title: m.title,
        product_url: m.productUrl,
        image_url: m.imageUrl ?? null,
        price_display: m.priceDisplay ?? null,
        show_price: m.showPrice ?? true,
        sort_order: m.sortOrder ?? 0,
        created_at: m.createdAt,
      })),
    )
    if (error) throw new Error(error.message)
  }

  if (snapshot.lineup.length) {
    const { error } = await supabase.from('artist_lineup_entries').insert(
      snapshot.lineup.map((e) => ({
        id: e.id,
        profile_id: e.profileId,
        name: e.name,
        role: e.role,
        entry_type: e.entryType,
        sort_order: e.sortOrder ?? 0,
        created_at: e.createdAt,
      })),
    )
    if (error) throw new Error(error.message)
  }

  if (snapshot.bioTimeline.length) {
    const { error } = await supabase.from('artist_bio_timeline_entries').insert(
      snapshot.bioTimeline.map((e) => ({
        id: e.id,
        profile_id: e.profileId,
        year: e.year,
        title: e.title,
        description: e.description ?? null,
        sort_order: e.sortOrder ?? 0,
        created_at: e.createdAt,
      })),
    )
    if (error) throw new Error(error.message)
  }

  if (snapshot.releases.length) {
    const { error } = await supabase.from('artist_releases').insert(
      snapshot.releases.map((r) => ({
        id: r.id,
        profile_id: r.profileId,
        slug: r.slug,
        title: r.title,
        subtitle: r.subtitle ?? null,
        story: r.story ?? null,
        cover_url: r.coverUrl ?? null,
        release_type: r.releaseType,
        live_at: r.liveAt,
        status: r.status,
        spotify_url: r.spotifyUrl ?? null,
        youtube_url: r.youtubeUrl ?? null,
        soundcloud_url: r.soundcloudUrl ?? null,
        scene_city: r.sceneCity ?? null,
        scene_genre_slug: r.sceneGenreSlug ?? null,
        tracks: r.tracks ?? [],
        spin_promoted: r.spinPromoted ?? false,
        linked_community_post_id: r.linkedCommunityPostId ?? null,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      })),
    )
    if (error) throw new Error(error.message)
  }

  const stamp = new Date().toISOString()
  const { error: markErr } = await supabase
    .from('artist_profile_archives')
    .update({ restored_at: stamp, restored_by: restoredByUserId })
    .eq('id', archiveId)
  if (markErr) throw new Error(markErr.message)

  const restored = await repoGetArtistProfileByUserId(supabase, String(archiveRow.user_id))
  if (!restored) throw new Error('Restore failed — profile missing after insert.')
  return restored
}
