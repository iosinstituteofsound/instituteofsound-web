-- Public network handles for sitemap generation (profiles with community presence)

create or replace function public.community_sitemap_handles()
returns table (handle text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct coalesce(
    nullif(trim(lower(p.username)), ''),
    nullif(
      trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g')),
      ''
    )
  ) as handle
  from public.profiles p
  where (
    coalesce(nullif(trim(p.username), ''), '') <> ''
    or exists (
      select 1 from public.community_posts cp
      where cp.user_id = p.id and cp.status = 'visible'
    )
    or coalesce(p.total_db, 0) > 0
  )
  and coalesce(
    nullif(trim(lower(p.username)), ''),
    nullif(
      trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g')),
      ''
    )
  ) is not null;
$$;

grant execute on function public.community_sitemap_handles() to anon, authenticated;
