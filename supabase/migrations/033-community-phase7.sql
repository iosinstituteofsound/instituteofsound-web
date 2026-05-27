-- Phase 7: Spin of the Week, tribe spotlight, feed filters

drop function if exists public.community_feed(int);

create or replace function public.community_feed(
  lim int default 30,
  p_kind text default null,
  p_genre_slug text default null
)
returns table (
  id uuid,
  kind text,
  body text,
  spotify_url text,
  youtube_url text,
  track_title text,
  created_at timestamptz,
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  community_rank text,
  primary_genre_slug text,
  reactions_fire bigint,
  reactions_headphones bigint,
  reactions_bolt bigint,
  my_reaction text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.kind,
    p.body,
    p.spotify_url,
    p.youtube_url,
    p.track_title,
    p.created_at,
    p.user_id,
    pr.name as display_name,
    coalesce(
      nullif(trim(pr.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    ) as handle,
    pr.avatar_url,
    public.community_rank_for_db(pr.total_db) as community_rank,
    g.slug as primary_genre_slug,
    coalesce(rx.reactions_fire, 0) as reactions_fire,
    coalesce(rx.reactions_headphones, 0) as reactions_headphones,
    coalesce(rx.reactions_bolt, 0) as reactions_bolt,
    mine.reaction as my_reaction
  from public.community_posts p
  join public.profiles pr on pr.id = p.user_id
  left join public.community_genres g on g.id = pr.primary_genre_id
  left join lateral (
    select
      count(*) filter (where r.reaction = 'fire') as reactions_fire,
      count(*) filter (where r.reaction = 'headphones') as reactions_headphones,
      count(*) filter (where r.reaction = 'bolt') as reactions_bolt
    from public.community_post_reactions r
    where r.post_id = p.id
  ) rx on true
  left join public.community_post_reactions mine
    on mine.post_id = p.id and mine.user_id = auth.uid()
  where p.status = 'visible'
    and (p_kind is null or p.kind = p_kind)
    and (p_genre_slug is null or g.slug = p_genre_slug)
  order by p.created_at desc
  limit greatest(lim, 1);
$$;

-- Top spin this week by total reactions (wire signal)
create or replace function public.community_spin_of_the_week()
returns table (
  id uuid,
  kind text,
  body text,
  spotify_url text,
  youtube_url text,
  track_title text,
  created_at timestamptz,
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  community_rank text,
  primary_genre_slug text,
  reactions_fire bigint,
  reactions_headphones bigint,
  reactions_bolt bigint,
  my_reaction text,
  reaction_score bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    f.id,
    f.kind,
    f.body,
    f.spotify_url,
    f.youtube_url,
    f.track_title,
    f.created_at,
    f.user_id,
    f.display_name,
    f.handle,
    f.avatar_url,
    f.community_rank,
    f.primary_genre_slug,
    f.reactions_fire,
    f.reactions_headphones,
    f.reactions_bolt,
    f.my_reaction,
    (f.reactions_fire + f.reactions_headphones + f.reactions_bolt) as reaction_score
  from public.community_feed(100, 'spin', null) f
  where f.created_at >= (timezone('utc', now()) - interval '7 days')
    and (f.reactions_fire + f.reactions_headphones + f.reactions_bolt) > 0
  order by reaction_score desc, f.created_at desc
  limit 1;
$$;

-- Recent tribe spins for spotlight rail
create or replace function public.community_tribe_recent_spins(
  p_genre_slug text,
  lim int default 3
)
returns table (
  id uuid,
  kind text,
  body text,
  spotify_url text,
  youtube_url text,
  track_title text,
  created_at timestamptz,
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  community_rank text,
  primary_genre_slug text,
  reactions_fire bigint,
  reactions_headphones bigint,
  reactions_bolt bigint,
  my_reaction text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    f.id,
    f.kind,
    f.body,
    f.spotify_url,
    f.youtube_url,
    f.track_title,
    f.created_at,
    f.user_id,
    f.display_name,
    f.handle,
    f.avatar_url,
    f.community_rank,
    f.primary_genre_slug,
    f.reactions_fire,
    f.reactions_headphones,
    f.reactions_bolt,
    f.my_reaction
  from public.community_feed(greatest(lim, 1) * 4, 'spin', p_genre_slug) f
  order by f.created_at desc
  limit greatest(lim, 1);
$$;

grant execute on function public.community_feed(int, text, text) to anon, authenticated;
grant execute on function public.community_spin_of_the_week() to anon, authenticated;
grant execute on function public.community_tribe_recent_spins(text, int) to anon, authenticated;
