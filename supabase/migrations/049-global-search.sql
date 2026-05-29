-- Global categorized search across network members, editors, and music posts.
-- Artists (artist_profiles) and editorial/news + static pages are searched client-side,
-- so this RPC focuses on the entities that need a database query.

create or replace function public.global_search(p_query text, p_limit int default 6)
returns table (
  category text,
  ref_id text,
  title text,
  subtitle text,
  image_url text,
  handle text
)
language sql
stable
security definer
set search_path = public
as $$
  with q as (
    select nullif(trim(coalesce(p_query, '')), '') as term
  ),
  pattern as (
    select '%' || term || '%' as like_term from q where term is not null
  ),
  members as (
    select
      case when p.role in ('editor', 'super_editor') then 'editor' else 'user' end as category,
      p.id::text as ref_id,
      coalesce(nullif(trim(p.name), ''), 'Member') as title,
      coalesce(
        nullif(trim(p.bio), ''),
        case when p.role in ('editor', 'super_editor') then 'Editorial desk' else 'Network member' end
      ) as subtitle,
      p.avatar_url as image_url,
      coalesce(
        nullif(trim(p.username), ''),
        nullif(trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
        'member'
      ) as handle,
      p.total_db as rank_score
    from public.profiles p, pattern
    where
      p.username ilike pattern.like_term
      or p.name ilike pattern.like_term
      or p.bio ilike pattern.like_term
  ),
  ranked_members as (
    select category, ref_id, title, subtitle, image_url, handle,
      row_number() over (partition by category order by rank_score desc nulls last) as rn
    from members
  ),
  music as (
    select
      'music'::text as category,
      cp.id::text as ref_id,
      coalesce(nullif(trim(cp.track_title), ''), left(coalesce(cp.body, ''), 60)) as title,
      coalesce(nullif(trim(pr.name), ''), 'Member') as subtitle,
      pr.avatar_url as image_url,
      coalesce(
        nullif(trim(pr.username), ''),
        nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
        'member'
      ) as handle,
      cp.created_at
    from public.community_posts cp
    join public.profiles pr on pr.id = cp.user_id, pattern
    where cp.status = 'visible'
      and cp.kind = 'spin'
      and (
        cp.track_title ilike pattern.like_term
        or cp.body ilike pattern.like_term
      )
  ),
  ranked_music as (
    select category, ref_id, title, subtitle, image_url, handle,
      row_number() over (order by created_at desc) as rn
    from music
  )
  select category, ref_id, title, subtitle, image_url, handle
  from ranked_members
  where rn <= greatest(p_limit, 1)
  union all
  select category, ref_id, title, subtitle, image_url, handle
  from ranked_music
  where rn <= greatest(p_limit, 1);
$$;

grant execute on function public.global_search(text, int) to anon, authenticated;
