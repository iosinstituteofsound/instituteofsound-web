-- Phase 14: Discovery — India scene hubs (city + taste tribe)

create or replace function public.scene_city_slug(p_city text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(lower(trim(coalesce(p_city, ''))), '[^a-z0-9]+', '-', 'g'));
$$;

create index if not exists artist_releases_scene_discovery_idx
  on public.artist_releases (scene_genre_slug, live_at desc)
  where scene_genre_slug is not null and scene_city is not null and status in ('scheduled', 'live');

-- Premieres tagged for this scene (India city + genre)
create or replace function public.releases_by_scene(
  p_city_slug text,
  p_genre_slug text,
  lim int default 12
)
returns table (
  slug text,
  title text,
  subtitle text,
  release_type text,
  live_at timestamptz,
  status text,
  cover_url text,
  artist_slug text,
  artist_name text,
  scene_city text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.slug,
    r.title,
    r.subtitle,
    r.release_type,
    r.live_at,
    r.status,
    r.cover_url,
    p.slug as artist_slug,
    p.display_name as artist_name,
    r.scene_city
  from public.artist_releases r
  join public.artist_profiles p on p.id = r.profile_id
  where r.status in ('scheduled', 'live')
    and public.scene_city_slug(r.scene_city) = public.scene_city_slug(p_city_slug)
    and lower(trim(coalesce(r.scene_genre_slug, ''))) = lower(trim(coalesce(p_genre_slug, '')))
  order by r.live_at desc
  limit greatest(lim, 1);
$$;

-- Latest published editorial linked to a premiere in this scene
create or replace function public.scene_editorial_pick(
  p_city_slug text,
  p_genre_slug text
)
returns table (
  slug text,
  title text,
  cover_image_url text,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    d.slug,
    d.title,
    d.cover_image_url,
    d.published_at
  from public.editorial_drafts d
  join public.artist_releases r on r.id = d.linked_release_id
  where d.status = 'published'
    and r.status in ('scheduled', 'live', 'archived')
    and public.scene_city_slug(r.scene_city) = public.scene_city_slug(p_city_slug)
    and lower(trim(coalesce(r.scene_genre_slug, ''))) = lower(trim(coalesce(p_genre_slug, '')))
  order by d.published_at desc nulls last, d.updated_at desc
  limit 1;
$$;

grant execute on function public.releases_by_scene(text, text, int) to anon, authenticated;
grant execute on function public.scene_editorial_pick(text, text) to anon, authenticated;
