-- Phase 12: Tribe wars, Friday wire, crew wars v2, wire digest

-- Current calendar month label (UTC)
create or replace function public.community_season_label()
returns text
language sql
immutable
as $$
  select to_char(timezone('utc', now()), 'FMMonth YYYY');
$$;

-- Next Friday 00:00 UTC (upcoming wire slot)
create or replace function public.community_next_friday_utc()
returns timestamptz
language sql
stable
as $$
  with now_utc as (
    select timezone('utc', now()) as t
  ),
  week_monday as (
    select date_trunc('week', t)::date as mon from now_utc
  ),
  this_friday as (
    select (mon + interval '4 days')::timestamptz as friday from week_monday
  )
  select case
    when (select t from now_utc) < (select friday from this_friday)
      then (select friday from this_friday)
    when (select t::date from now_utc) = (select friday::date from this_friday)
      then (select friday from this_friday)
    else (select friday + interval '7 days' from this_friday)
  end;
$$;

-- Featured Friday spin (top reactions on the most recent Friday UTC, else spin of the week)
create or replace function public.community_friday_wire()
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
  reaction_score bigint,
  wire_live boolean,
  next_wire_at timestamptz,
  featured_friday date
)
language sql
stable
security definer
set search_path = public
as $$
  with now_utc as (
    select timezone('utc', now()) as t
  ),
  week_monday as (
    select date_trunc('week', t)::date as mon from now_utc
  ),
  this_friday as (
    select (mon + interval '4 days')::date as friday from week_monday
  ),
  featured as (
    select case
      when (select t::date from now_utc) >= (select friday from this_friday)
        then (select friday from this_friday)
      else (select friday - interval '7 days' from this_friday)::date
    end as friday_date
  ),
  friday_spin as (
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
    from public.community_feed(80, 'spin', null) f
    cross join featured fe
    where f.created_at::date = fe.friday_date
    order by reaction_score desc, f.created_at desc
    limit 1
  ),
  fallback as (
    select * from public.community_spin_of_the_week()
  ),
  pick as (
    select * from friday_spin
    union all
    select * from fallback
    where not exists (select 1 from friday_spin)
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
    p.display_name,
    p.handle,
    p.avatar_url,
    p.community_rank,
    p.primary_genre_slug,
    p.reactions_fire,
    p.reactions_headphones,
    p.reactions_bolt,
    p.my_reaction,
    coalesce(p.reaction_score, p.reactions_fire + p.reactions_headphones + p.reactions_bolt),
    (select t::date = fe.friday_date from now_utc t cross join featured fe) as wire_live,
    public.community_next_friday_utc() as next_wire_at,
    (select friday_date from featured) as featured_friday
  from pick p;
$$;

-- Monthly tribe war — total dB per genre + champion
create or replace function public.community_tribe_war_monthly()
returns table (
  genre_slug text,
  genre_name text,
  total_db bigint,
  active_members bigint,
  champion_user_id uuid,
  champion_name text,
  champion_handle text,
  champion_db bigint,
  season_label text
)
language sql
stable
security definer
set search_path = public
as $$
  with month_start as (
    select date_trunc('month', timezone('utc', now())) as start_at
  ),
  genre_totals as (
    select
      g.slug as genre_slug,
      g.name as genre_name,
      coalesce(sum(e.amount), 0)::bigint as total_db,
      count(distinct e.user_id)::bigint as active_members
    from public.community_genres g
    left join public.community_db_events e on e.created_at >= (select start_at from month_start)
      and (
        e.genre_id = g.id
        or (
          e.genre_id is null
          and exists (
            select 1 from public.profiles p
            where p.id = e.user_id and p.primary_genre_id = g.id
          )
        )
      )
    where g.active = true
    group by g.id, g.slug, g.name
  ),
  champions as (
    select distinct on (g.slug)
      g.slug as genre_slug,
      p.id as champion_user_id,
      p.name as champion_name,
      coalesce(
        nullif(trim(p.username), ''),
        nullif(trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
        'member'
      ) as champion_handle,
      sum(e.amount)::bigint as champion_db
    from public.community_genres g
    join public.community_db_events e on e.created_at >= (select start_at from month_start)
      and (
        e.genre_id = g.id
        or (
          e.genre_id is null
          and exists (
            select 1 from public.profiles pr
            where pr.id = e.user_id and pr.primary_genre_id = g.id
          )
        )
      )
    join public.profiles p on p.id = e.user_id
    where g.active = true
    group by g.slug, p.id, p.name, p.username, p.email
    order by g.slug, champion_db desc
  )
  select
    gt.genre_slug,
    gt.genre_name,
    gt.total_db,
    gt.active_members,
    c.champion_user_id,
    c.champion_name,
    c.champion_handle,
    coalesce(c.champion_db, 0) as champion_db,
    public.community_season_label() as season_label
  from genre_totals gt
  left join champions c on c.genre_slug = gt.genre_slug
  order by gt.total_db desc, gt.genre_name;
$$;

-- Crew wars v2 — current week + previous week delta
create or replace function public.community_crew_wars_v2(lim int default 15)
returns table (
  crew_id uuid,
  crew_name text,
  crew_slug text,
  tagline text,
  genre_slug text,
  invite_code text,
  member_count int,
  weekly_db bigint,
  prev_weekly_db bigint,
  db_delta bigint,
  season_label text
)
language sql
stable
security definer
set search_path = public
as $$
  with bounds as (
    select
      timezone('utc', now()) - interval '7 days' as cur_start,
      timezone('utc', now()) as cur_end,
      timezone('utc', now()) - interval '14 days' as prev_start,
      timezone('utc', now()) - interval '7 days' as prev_end
  ),
  crew_current as (
    select
      c.id as crew_id,
      count(distinct m.user_id)::int as member_count,
      coalesce(sum(e.amount) filter (
        where e.created_at >= b.cur_start and e.created_at < b.cur_end
      ), 0)::bigint as weekly_db,
      coalesce(sum(e.amount) filter (
        where e.created_at >= b.prev_start and e.created_at < b.prev_end
      ), 0)::bigint as prev_weekly_db
    from public.community_crews c
    join public.community_crew_members m on m.crew_id = c.id
    left join public.community_db_events e on e.user_id = m.user_id
    cross join bounds b
    group by c.id
  )
  select
    c.id as crew_id,
    c.name as crew_name,
    c.slug as crew_slug,
    c.tagline,
    g.slug as genre_slug,
    c.invite_code,
    cc.member_count,
    cc.weekly_db,
    cc.prev_weekly_db,
    (cc.weekly_db - cc.prev_weekly_db) as db_delta,
    public.community_season_label() as season_label
  from crew_current cc
  join public.community_crews c on c.id = cc.crew_id
  left join public.community_genres g on g.id = c.genre_id
  where cc.weekly_db > 0 or cc.prev_weekly_db > 0
  order by cc.weekly_db desc, (cc.weekly_db - cc.prev_weekly_db) desc, cc.member_count desc
  limit greatest(lim, 1);
$$;

-- Wire digest for newsletter / share panel
create or replace function public.community_wire_digest()
returns table (
  season_label text,
  spin_title text,
  spin_handle text,
  spin_post_id uuid,
  editorial_title text,
  editorial_slug text,
  editorial_type text,
  tribe_winner_genre text,
  tribe_winner_champion text,
  challenge_title text
)
language sql
stable
security definer
set search_path = public
as $$
  with spin_row as (
    select
      coalesce(f.track_title, 'Untitled transmission') as spin_title,
      f.handle as spin_handle,
      f.id as spin_post_id
    from public.community_spin_of_the_week() f
    limit 1
  ),
  editorial_row as (
    select d.title, d.slug, d.type
    from public.editorial_drafts d
    where d.status = 'published'
    order by d.published_at desc nulls last, d.updated_at desc
    limit 1
  ),
  tribe_winner as (
    select genre_name, champion_name
    from public.community_tribe_war_monthly()
    order by total_db desc
    limit 1
  )
  select
    public.community_season_label() as season_label,
    s.spin_title,
    s.spin_handle,
    s.spin_post_id,
    e.title as editorial_title,
    e.slug as editorial_slug,
    e.type as editorial_type,
    tw.genre_name as tribe_winner_genre,
    tw.champion_name as tribe_winner_champion,
    coalesce(
      (
        select c.title
        from public.community_weekly_challenges() c
        where c.slug = 'weekly_spin'
        limit 1
      ),
      'Spin the wire'
    ) as challenge_title
  from spin_row s
  left join editorial_row e on true
  left join tribe_winner tw on true;
$$;

grant execute on function public.community_friday_wire() to anon, authenticated;
grant execute on function public.community_tribe_war_monthly() to anon, authenticated;
grant execute on function public.community_crew_wars_v2(int) to anon, authenticated;
grant execute on function public.community_wire_digest() to anon, authenticated;
