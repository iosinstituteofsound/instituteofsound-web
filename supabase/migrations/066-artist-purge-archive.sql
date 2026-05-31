-- Phase 6: purge expired artist pages only after archiving a full snapshot.

create or replace function public.build_artist_profile_snapshot_v1(p_profile_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile jsonb;
begin
  select jsonb_build_object(
    'id', ap.id,
    'userId', ap.user_id,
    'slug', ap.slug,
    'displayName', ap.display_name,
    'tagline', ap.tagline,
    'bio', ap.bio,
    'avatarUrl', ap.avatar_url,
    'bannerUrl', ap.banner_url,
    'logoUrl', ap.logo_url,
    'genres', coalesce(ap.genres, '{}'::text[]),
    'influenceTags', coalesce(ap.influence_tags, '{}'::text[]),
    'country', ap.country,
    'artistManagerName', ap.artist_manager_name,
    'artistManagerHandle', ap.artist_manager_handle,
    'social', jsonb_strip_nulls(jsonb_build_object(
      'website', ap.website_url,
      'spotify', ap.spotify_url,
      'youtube', ap.youtube_url,
      'instagram', ap.instagram_url,
      'facebook', ap.facebook_url,
      'bandcamp', ap.bandcamp_url
    )),
    'monthlyListenersDisplay', coalesce(ap.monthly_listeners_display, '—'),
    'artistPickTrackId', ap.artist_pick_track_id,
    'accentColor', coalesce(ap.accent_color, '#c8ff00'),
    'themePreset', coalesce(ap.theme_preset, 'midnight'),
    'heroVideoUrl', ap.hero_video_url,
    'heroLayout', coalesce(ap.hero_layout, 'default'),
    'socialLinkOrder', coalesce(ap.social_link_order, '{}'::text[]),
    'pressKitUrl', ap.press_kit_url,
    'pressKitLabel', ap.press_kit_label,
    'published', ap.published,
    'pageStatus', case when ap.page_status = 'live' then 'live' else 'pending' end,
    'pageRefreshedAt', coalesce(ap.page_refreshed_at, ap.updated_at, ap.created_at),
    'lastActivityAt', coalesce(ap.last_activity_at, ap.page_refreshed_at, ap.updated_at, ap.created_at),
    'createdAt', ap.created_at,
    'updatedAt', ap.updated_at
  )
  into v_profile
  from public.artist_profiles ap
  where ap.id = p_profile_id;

  if v_profile is null then
    raise exception 'Artist profile not found: %', p_profile_id;
  end if;

  return jsonb_build_object(
    'version', 1,
    'profile', v_profile,
    'tracks', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', t.id,
          'profileId', t.profile_id,
          'albumId', t.album_id,
          'title', t.title,
          'streamUrl', t.stream_url,
          'coverUrl', t.cover_url,
          'playCount', coalesce(t.play_count, 0),
          'sortOrder', coalesce(t.sort_order, 0),
          'createdAt', t.created_at
        ) order by t.sort_order, t.created_at
      )
      from public.artist_tracks t
      where t.profile_id = p_profile_id
    ), '[]'::jsonb),
    'albums', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'profileId', a.profile_id,
          'title', a.title,
          'coverUrl', a.cover_url,
          'releaseYear', a.release_year,
          'releaseType', a.release_type,
          'sortOrder', coalesce(a.sort_order, 0),
          'createdAt', a.created_at
        ) order by a.sort_order, a.created_at
      )
      from public.artist_albums a
      where a.profile_id = p_profile_id
    ), '[]'::jsonb),
    'videos', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', v.id,
          'profileId', v.profile_id,
          'title', v.title,
          'videoUrl', v.video_url,
          'thumbnailUrl', v.thumbnail_url,
          'sortOrder', coalesce(v.sort_order, 0),
          'createdAt', v.created_at
        ) order by v.sort_order, v.created_at
      )
      from public.artist_videos v
      where v.profile_id = p_profile_id
    ), '[]'::jsonb),
    'merch', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', m.id,
          'profileId', m.profile_id,
          'title', m.title,
          'productUrl', m.product_url,
          'imageUrl', m.image_url,
          'priceDisplay', m.price_display,
          'showPrice', coalesce(m.show_price, true),
          'sortOrder', coalesce(m.sort_order, 0),
          'createdAt', m.created_at
        ) order by m.sort_order, m.created_at
      )
      from public.artist_merch_items m
      where m.profile_id = p_profile_id
    ), '[]'::jsonb),
    'lineup', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', e.id,
          'profileId', e.profile_id,
          'name', e.name,
          'role', e.role,
          'entryType', e.entry_type,
          'sortOrder', coalesce(e.sort_order, 0),
          'createdAt', e.created_at
        ) order by e.sort_order, e.created_at
      )
      from public.artist_lineup_entries e
      where e.profile_id = p_profile_id
    ), '[]'::jsonb),
    'bioTimeline', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', b.id,
          'profileId', b.profile_id,
          'year', b.year,
          'title', b.title,
          'description', b.description,
          'sortOrder', coalesce(b.sort_order, 0),
          'createdAt', b.created_at
        ) order by b.sort_order, b.created_at
      )
      from public.artist_bio_timeline_entries b
      where b.profile_id = p_profile_id
    ), '[]'::jsonb),
    'releases', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'profileId', r.profile_id,
          'slug', r.slug,
          'title', r.title,
          'subtitle', r.subtitle,
          'story', r.story,
          'coverUrl', r.cover_url,
          'releaseType', r.release_type,
          'liveAt', r.live_at,
          'status', r.status,
          'spotifyUrl', r.spotify_url,
          'youtubeUrl', r.youtube_url,
          'soundcloudUrl', r.soundcloud_url,
          'sceneCity', r.scene_city,
          'sceneGenreSlug', r.scene_genre_slug,
          'tracks', coalesce(r.tracks, '[]'::jsonb),
          'linkedCommunityPostId', r.linked_community_post_id,
          'spinPromoted', coalesce(r.spin_promoted, false),
          'createdAt', r.created_at,
          'updatedAt', r.updated_at
        ) order by r.live_at desc
      )
      from public.artist_releases r
      where r.profile_id = p_profile_id
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.build_artist_profile_snapshot_v1(uuid) from public;
grant execute on function public.build_artist_profile_snapshot_v1(uuid) to service_role;

create or replace function public.archive_artist_profile_before_delete(
  p_profile_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.artist_profiles%rowtype;
  v_snapshot jsonb;
begin
  if p_reason not in ('incomplete_draft_expired', 'inactive_live_page', 'manual') then
    raise exception 'Invalid deletion reason: %', p_reason;
  end if;

  select * into v_row
  from public.artist_profiles
  where id = p_profile_id;

  if not found then
    return;
  end if;

  v_snapshot := public.build_artist_profile_snapshot_v1(p_profile_id);

  insert into public.artist_profile_archives (
    user_id,
    profile_id,
    slug,
    display_name,
    deletion_reason,
    deleted_at,
    snapshot,
    restored_at,
    restored_by
  )
  values (
    v_row.user_id,
    v_row.id,
    v_row.slug,
    v_row.display_name,
    p_reason,
    now(),
    v_snapshot,
    null,
    null
  )
  on conflict (profile_id) do update set
    user_id = excluded.user_id,
    slug = excluded.slug,
    display_name = excluded.display_name,
    deletion_reason = excluded.deletion_reason,
    deleted_at = excluded.deleted_at,
    snapshot = excluded.snapshot,
    restored_at = null,
    restored_by = null;
end;
$$;

revoke all on function public.archive_artist_profile_before_delete(uuid, text) from public;
grant execute on function public.archive_artist_profile_before_delete(uuid, text) to service_role;

create or replace function public.purge_expired_artist_profiles()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted integer := 0;
  v_row record;
  v_complete boolean;
  v_reason text;
begin
  for v_row in
    select
      ap.id,
      ap.user_id,
      ap.created_at,
      ap.last_activity_at,
      ap.display_name,
      ap.slug,
      ap.bio,
      ap.genres,
      ap.avatar_url,
      (select count(*)::int from public.artist_tracks t where t.profile_id = ap.id) as track_count,
      (select count(*)::int from public.artist_videos v where v.profile_id = ap.id) as video_count
    from public.artist_profiles ap
  loop
    v_complete :=
      coalesce(trim(v_row.display_name), '') <> ''
      and coalesce(trim(v_row.slug), '') <> ''
      and coalesce(length(trim(v_row.bio)), 0) >= 24
      and coalesce(array_length(v_row.genres, 1), 0) > 0
      and coalesce(trim(v_row.avatar_url), '') <> ''
      and (v_row.track_count >= 1 or v_row.video_count >= 1);

    v_reason := null;

    if not v_complete
      and v_row.created_at < now() - interval '7 days'
    then
      v_reason := 'incomplete_draft_expired';
    elsif v_complete
      and v_row.last_activity_at < now() - interval '60 days'
    then
      v_reason := 'inactive_live_page';
    end if;

    if v_reason is null then
      continue;
    end if;

    perform public.archive_artist_profile_before_delete(v_row.id, v_reason);
    delete from public.artist_profiles where id = v_row.id;
    v_deleted := v_deleted + 1;
  end loop;

  return v_deleted;
end;
$$;

comment on function public.purge_expired_artist_profiles is
  'Archives then deletes incomplete drafts (7d) and inactive live pages (60d). Run daily via /api/cron/purge-artist-pages or Supabase cron.';

comment on function public.build_artist_profile_snapshot_v1 is
  'JSON snapshot (v1) for artist page recovery — matches app ArtistProfileSnapshotV1 shape.';

revoke all on function public.purge_expired_artist_profiles() from public;
grant execute on function public.purge_expired_artist_profiles() to service_role;
