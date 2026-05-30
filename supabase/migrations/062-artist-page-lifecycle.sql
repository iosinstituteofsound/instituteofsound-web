-- Artist page lifecycle: draft TTL, activity window, purge helpers.

alter table public.artist_profiles
  add column if not exists last_activity_at timestamptz not null default now();

update public.artist_profiles
set last_activity_at = coalesce(page_refreshed_at, updated_at, created_at, now())
where last_activity_at is null;

comment on column public.artist_profiles.last_activity_at is
  'Last qualifying studio/network activity; inactive live pages are purged after 60 days.';

-- Keep page_refreshed_at in sync when activity is touched from the client.
create or replace function public.touch_artist_page_activity(p_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.artist_profiles
  set
    last_activity_at = now(),
    page_refreshed_at = now(),
    updated_at = now()
  where id = p_profile_id
    and user_id = auth.uid();
end;
$$;

grant execute on function public.touch_artist_page_activity(uuid) to authenticated;

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

    if not v_complete
      and v_row.created_at < now() - interval '7 days'
    then
      delete from public.artist_profiles where id = v_row.id;
      v_deleted := v_deleted + 1;
      continue;
    end if;

    if v_complete
      and v_row.last_activity_at < now() - interval '60 days'
    then
      delete from public.artist_profiles where id = v_row.id;
      v_deleted := v_deleted + 1;
    end if;
  end loop;

  return v_deleted;
end;
$$;

comment on function public.purge_expired_artist_profiles is
  'Deletes incomplete drafts older than 7 days and live pages inactive for 60+ days. Run on a schedule.';

-- service_role only — wire to Supabase cron / edge scheduler in production
revoke all on function public.purge_expired_artist_profiles() from public;
grant execute on function public.purge_expired_artist_profiles() to service_role;
