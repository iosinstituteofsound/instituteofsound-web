-- Discover /explore premieres: editor-picked profile tracks + hourly random rotation

create table if not exists public.discover_premiere_picks (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.artist_tracks (id) on delete cascade,
  profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  picked_by uuid not null references public.profiles (id) on delete cascade,
  badge text not null default 'wire_pick'
    check (badge in ('wire_pick', 'hot', 'new')),
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (track_id)
);

create index if not exists discover_premiere_picks_active_idx
  on public.discover_premiere_picks (active, sort_order, created_at desc)
  where active;

alter table public.discover_premiere_picks enable row level security;

drop policy if exists "Editor staff manage premiere picks" on public.discover_premiere_picks;
create policy "Editor staff manage premiere picks"
  on public.discover_premiere_picks
  for all
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists "Editor staff read premiere picks" on public.discover_premiere_picks;
create policy "Editor staff read premiere picks"
  on public.discover_premiere_picks
  for select
  to authenticated
  using (public.is_editor());

create or replace function public.discover_premiere_feed(p_limit int default 24)
returns table (
  track_id uuid,
  track_title text,
  cover_url text,
  stream_url text,
  play_count int,
  track_created_at timestamptz,
  profile_id uuid,
  artist_slug text,
  artist_name text,
  genres text[],
  release_type text,
  badge text,
  is_editor_pick boolean,
  hour_bucket text
)
language sql
stable
security definer
set search_path = public
as $$
  with params as (
    select
      to_char(timezone('utc', date_trunc('hour', timezone('utc', now()))), 'YYYYMMDDHH24') as bucket,
      greatest(coalesce(p_limit, 24), 1) as lim
  ),
  editor_rows as (
    select
      t.id as track_id,
      t.title as track_title,
      t.cover_url,
      t.stream_url,
      t.play_count,
      t.created_at as track_created_at,
      p.id as profile_id,
      p.slug as artist_slug,
      p.display_name as artist_name,
      p.genres,
      coalesce(al.release_type, 'single')::text as release_type,
      dp.badge::text as badge,
      true as is_editor_pick,
      dp.sort_order,
      dp.created_at as ord_at
    from public.discover_premiere_picks dp
    join public.artist_tracks t on t.id = dp.track_id
    join public.artist_profiles p on p.id = dp.profile_id and p.published = true
    left join public.artist_albums al on al.id = t.album_id
    where dp.active = true
  ),
  picked_profiles as (
    select er.profile_id from editor_rows er
  ),
  random_rows as (
    select distinct on (p.id)
      t.id as track_id,
      t.title as track_title,
      t.cover_url,
      t.stream_url,
      t.play_count,
      t.created_at as track_created_at,
      p.id as profile_id,
      p.slug as artist_slug,
      p.display_name as artist_name,
      p.genres,
      coalesce(al.release_type, 'single')::text as release_type,
      case
        when t.created_at >= timezone('utc', now()) - interval '14 days' then 'new'
        when t.play_count >= 400 then 'hot'
        else null
      end::text as badge,
      false as is_editor_pick,
      100000 + row_number() over (order by md5(p.id::text || (select bucket from params))) as sort_order,
      t.created_at as ord_at
    from public.artist_profiles p
    join public.artist_tracks t on t.profile_id = p.id
    left join public.artist_albums al on al.id = t.album_id
    cross join params
    where p.published = true
      and p.id not in (select pp.profile_id from picked_profiles pp)
    order by p.id, md5(t.id::text || params.bucket)
  ),
  combined as (
    select * from editor_rows
    union all
    select * from random_rows
  )
  select
    c.track_id,
    c.track_title,
    c.cover_url,
    c.stream_url,
    c.play_count,
    c.track_created_at,
    c.profile_id,
    c.artist_slug,
    c.artist_name,
    c.genres,
    c.release_type,
    c.badge,
    c.is_editor_pick,
    (select bucket from params) as hour_bucket
  from combined c
  order by c.is_editor_pick desc, c.sort_order asc, c.ord_at desc
  limit (select lim from params);
$$;

grant execute on function public.discover_premiere_feed(int) to anon, authenticated;

comment on table public.discover_premiere_picks is
  'Editor/super-editor spotlight tracks on Discover premieres — shown first; other artists rotate hourly.';
