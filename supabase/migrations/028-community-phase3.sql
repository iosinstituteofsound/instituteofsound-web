-- Phase 3: Weekly leaderboards per taste tribe (genre)

create index if not exists community_db_events_genre_created_idx
  on public.community_db_events (genre_id, created_at desc)
  where genre_id is not null;

-- Weekly top earners for a genre (by slug)
create or replace function public.community_genre_weekly_leaderboard(
  p_genre_slug text,
  lim int default 15
)
returns table (
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  weekly_db bigint,
  total_db int,
  community_rank text
)
language sql
stable
security definer
set search_path = public
as $$
  with tribe as (
    select id from public.community_genres
    where slug = p_genre_slug and active = true
    limit 1
  ),
  weekly as (
    select
      e.user_id,
      sum(e.amount)::bigint as weekly_db
    from public.community_db_events e
    cross join tribe t
    join public.profiles p on p.id = e.user_id
    where e.created_at >= (timezone('utc', now()) - interval '7 days')
      and (
        e.genre_id = t.id
        or (e.genre_id is null and p.primary_genre_id = t.id)
      )
    group by e.user_id
  )
  select
    p.id as user_id,
    p.name as display_name,
    coalesce(
      nullif(trim(p.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    ) as handle,
    p.avatar_url,
    w.weekly_db,
    p.total_db,
    public.community_rank_for_db(p.total_db) as community_rank
  from weekly w
  join public.profiles p on p.id = w.user_id
  cross join tribe t
  where w.weekly_db > 0
  order by w.weekly_db desc, p.total_db desc
  limit greatest(lim, 1);
$$;

-- Caller's weekly rank within a genre (1-based), null if no tribe dB this week
create or replace function public.community_genre_weekly_rank(
  p_genre_slug text,
  p_user_id uuid
)
returns int
language sql
stable
security definer
set search_path = public
as $$
  with ranked as (
    select
      lb.user_id,
      row_number() over (order by lb.weekly_db desc, lb.total_db desc) as pos
    from public.community_genre_weekly_leaderboard(p_genre_slug, 500) lb
  )
  select pos::int from ranked where user_id = p_user_id;
$$;

grant execute on function public.community_genre_weekly_leaderboard(text, int) to anon, authenticated;
grant execute on function public.community_genre_weekly_rank(text, uuid) to anon, authenticated;
