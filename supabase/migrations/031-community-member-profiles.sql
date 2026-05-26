-- Member public profiles + posts by handle + activity timeline

create or replace function public.community_normalize_handle(p_handle text)
returns text
language sql
immutable
as $$
  select lower(trim(both '@' from coalesce(p_handle, '')));
$$;

-- Public profile card (by @handle)
create or replace function public.community_profile_public(p_handle text)
returns table (
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  bio text,
  total_db int,
  weekly_db bigint,
  community_rank text,
  primary_genre_slug text,
  member_since timestamptz,
  post_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with target as (
    select p.*
    from public.profiles p
    where lower(coalesce(nullif(trim(p.username), ''), '')) = public.community_normalize_handle(p_handle)
       or public.community_normalize_handle(p_handle) = lower(
         trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g'))
       )
    limit 1
  )
  select
    t.id as user_id,
    t.name as display_name,
    coalesce(
      nullif(trim(t.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(t.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    ) as handle,
    t.avatar_url,
    t.bio,
    t.total_db,
    coalesce((
      select sum(e.amount)::bigint
      from public.community_db_events e
      where e.user_id = t.id
        and e.created_at >= (timezone('utc', now()) - interval '7 days')
    ), 0) as weekly_db,
    public.community_rank_for_db(t.total_db) as community_rank,
    g.slug as primary_genre_slug,
    t.created_at as member_since,
    (
      select count(*)::bigint
      from public.community_posts cp
      where cp.user_id = t.id and cp.status = 'visible'
    ) as post_count
  from target t
  left join public.community_genres g on g.id = t.primary_genre_id;
$$;

-- Posts on a member profile (same shape as feed)
create or replace function public.community_posts_by_handle(p_handle text, lim int default 30)
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
  with target as (
    select p.id as user_id
    from public.profiles p
    where lower(coalesce(nullif(trim(p.username), ''), '')) = public.community_normalize_handle(p_handle)
       or public.community_normalize_handle(p_handle) = lower(
         trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g'))
       )
    limit 1
  )
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
  join target t on t.user_id = p.user_id
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
  order by p.created_at desc
  limit greatest(lim, 1);
$$;

-- Recent activity (dB + posts) for profile timeline
create or replace function public.community_member_activity(p_handle text, lim int default 20)
returns table (
  kind text,
  label text,
  detail text,
  amount int,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with target as (
    select p.id as user_id
    from public.profiles p
    where lower(coalesce(nullif(trim(p.username), ''), '')) = public.community_normalize_handle(p_handle)
       or public.community_normalize_handle(p_handle) = lower(
         trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g'))
       )
    limit 1
  ),
  events as (
    select
      'db'::text as kind,
      e.source as label,
      e.source_id as detail,
      e.amount,
      e.created_at
    from public.community_db_events e
    join target t on t.user_id = e.user_id
  ),
  posts as (
    select
      'post'::text as kind,
      p.kind as label,
      coalesce(nullif(trim(p.track_title), ''), left(coalesce(p.body, ''), 80)) as detail,
      null::int as amount,
      p.created_at
    from public.community_posts p
    join target t on t.user_id = p.user_id
    where p.status = 'visible'
  ),
  combined as (
    select * from events
    union all
    select * from posts
  )
  select kind, label, detail, amount, created_at
  from combined
  order by created_at desc
  limit greatest(lim, 1);
$$;

grant execute on function public.community_profile_public(text) to anon, authenticated;
grant execute on function public.community_posts_by_handle(text, int) to anon, authenticated;
grant execute on function public.community_member_activity(text, int) to anon, authenticated;
