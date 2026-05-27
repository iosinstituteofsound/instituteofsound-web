-- Phase 13: Release system — premiere pages at /release/:slug

create table if not exists public.artist_releases (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  slug text not null unique,
  title text not null check (char_length(trim(title)) between 1 and 120),
  subtitle text,
  story text,
  cover_url text,
  release_type text not null default 'single'
    check (release_type in ('single', 'ep', 'album')),
  live_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('draft', 'scheduled', 'live', 'archived')),
  spotify_url text,
  youtube_url text,
  soundcloud_url text,
  scene_city text,
  scene_genre_slug text,
  tracks jsonb not null default '[]'::jsonb,
  linked_community_post_id uuid references public.community_posts (id) on delete set null,
  spin_promoted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artist_releases_embed_required check (
    coalesce(length(trim(spotify_url)), 0) > 0
    or coalesce(length(trim(youtube_url)), 0) > 0
    or coalesce(length(trim(soundcloud_url)), 0) > 0
  )
);

create index if not exists artist_releases_profile_idx
  on public.artist_releases (profile_id, live_at desc);

create index if not exists artist_releases_live_idx
  on public.artist_releases (live_at desc)
  where status in ('scheduled', 'live');

create table if not exists public.artist_release_milestones (
  id uuid primary key default gen_random_uuid(),
  release_id uuid not null references public.artist_releases (id) on delete cascade,
  kind text not null default 'note'
    check (kind in ('teaser', 'bts', 'preview', 'note')),
  title text not null,
  body text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists artist_release_milestones_release_idx
  on public.artist_release_milestones (release_id, sort_order);

alter table public.editorial_drafts
  add column if not exists linked_release_id uuid references public.artist_releases (id) on delete set null;

create index if not exists editorial_drafts_linked_release_idx
  on public.editorial_drafts (linked_release_id)
  where linked_release_id is not null;

alter table public.artist_releases enable row level security;
alter table public.artist_release_milestones enable row level security;

-- Flip due premieres to live (idempotent)
create or replace function public.artist_releases_flip_due()
returns void
language sql
security definer
set search_path = public
as $$
  update public.artist_releases r
  set status = 'live', updated_at = timezone('utc', now())
  where r.status = 'scheduled'
    and r.live_at <= timezone('utc', now());
$$;

drop policy if exists "Public read scheduled and live releases" on public.artist_releases;
create policy "Public read scheduled and live releases"
  on public.artist_releases for select
  to anon, authenticated
  using (
    status in ('scheduled', 'live')
    or exists (
      select 1 from public.artist_profiles p
      where p.id = profile_id and (p.user_id = auth.uid() or public.is_editor())
    )
  );

drop policy if exists "Artists manage own releases" on public.artist_releases;
create policy "Artists manage own releases"
  on public.artist_releases for all
  to authenticated
  using (
    exists (
      select 1 from public.artist_profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
    or public.is_editor()
  )
  with check (
    exists (
      select 1 from public.artist_profiles p
      where p.id = profile_id and p.user_id = auth.uid()
    )
    or public.is_editor()
  );

drop policy if exists "Public read release milestones" on public.artist_release_milestones;
create policy "Public read release milestones"
  on public.artist_release_milestones for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.artist_releases r
      join public.artist_profiles p on p.id = r.profile_id
      where r.id = release_id
        and (
          r.status in ('scheduled', 'live')
          or p.user_id = auth.uid()
          or public.is_editor()
        )
    )
  );

drop policy if exists "Artists manage release milestones" on public.artist_release_milestones;
create policy "Artists manage release milestones"
  on public.artist_release_milestones for all
  to authenticated
  using (
    exists (
      select 1 from public.artist_releases r
      join public.artist_profiles p on p.id = r.profile_id
      where r.id = release_id and (p.user_id = auth.uid() or public.is_editor())
    )
  )
  with check (
    exists (
      select 1 from public.artist_releases r
      join public.artist_profiles p on p.id = r.profile_id
      where r.id = release_id and (p.user_id = auth.uid() or public.is_editor())
    )
  );

-- Public premiere page payload
create or replace function public.release_public(p_slug text)
returns table (
  id uuid,
  slug text,
  title text,
  subtitle text,
  story text,
  cover_url text,
  release_type text,
  live_at timestamptz,
  status text,
  is_live boolean,
  embed_locked boolean,
  seconds_until_live bigint,
  spotify_url text,
  youtube_url text,
  soundcloud_url text,
  scene_city text,
  scene_genre_slug text,
  tracks jsonb,
  linked_community_post_id uuid,
  spin_promoted boolean,
  artist_profile_id uuid,
  artist_slug text,
  artist_name text,
  artist_avatar_url text,
  editorial_slug text,
  editorial_title text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  perform public.artist_releases_flip_due();

  return query
  select
    r.id,
    r.slug,
    r.title,
    r.subtitle,
    r.story,
    r.cover_url,
    r.release_type,
    r.live_at,
    r.status,
    (r.status = 'live' or r.live_at <= timezone('utc', now())) as is_live,
    (r.status = 'scheduled' and r.live_at > timezone('utc', now())) as embed_locked,
    greatest(0, extract(epoch from (r.live_at - timezone('utc', now())))::bigint) as seconds_until_live,
    r.spotify_url,
    r.youtube_url,
    r.soundcloud_url,
    r.scene_city,
    r.scene_genre_slug,
    r.tracks,
    r.linked_community_post_id,
    r.spin_promoted,
    p.id as artist_profile_id,
    p.slug as artist_slug,
    p.display_name as artist_name,
    p.avatar_url as artist_avatar_url,
    ed.slug as editorial_slug,
    ed.title as editorial_title
  from public.artist_releases r
  join public.artist_profiles p on p.id = r.profile_id
  left join lateral (
    select d.slug, d.title
    from public.editorial_drafts d
    where d.linked_release_id = r.id and d.status = 'published'
    order by d.published_at desc nulls last
    limit 1
  ) ed on true
  where lower(trim(r.slug)) = lower(trim(p_slug))
    and r.status in ('scheduled', 'live', 'archived')
  limit 1;
end;
$$;

create or replace function public.release_sitemap_slugs()
returns table (slug text, live_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select r.slug, r.live_at
  from public.artist_releases r
  where r.status in ('scheduled', 'live')
  order by r.live_at desc;
$$;

grant execute on function public.release_public(text) to anon, authenticated;
grant execute on function public.release_sitemap_slugs() to anon, authenticated;
grant execute on function public.artist_releases_flip_due() to authenticated;
