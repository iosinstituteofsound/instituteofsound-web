-- Discovery drivers: amplification via shares + wired reach on tagged posts.

create or replace function public.fandom_artist_discovery_drivers(
  p_window text default '90d',
  lim int default 10
)
returns table (
  supporter_user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  shares int,
  wired_reach int,
  driver_rank int
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_profile_id uuid;
  v_since timestamptz;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select ap.id into v_profile_id
  from public.artist_profiles ap
  where ap.user_id = v_user
  limit 1;

  if v_profile_id is null then
    raise exception 'Artist profile required';
  end if;

  v_since := case when p_window = 'all' then null else now() - interval '90 days' end;

  return query
  with tagged_posts as (
    select p.id as post_id, p.user_id as author_id
    from public.community_posts p
    inner join public.community_post_artist_tags t
      on t.post_id = p.id and t.artist_profile_id = v_profile_id
    where v_since is null or p.created_at >= v_since
  ),
  reach as (
    select tp.author_id as supporter_user_id,
      count(distinct eng.user_id)::int as wired_reach
    from tagged_posts tp
    inner join lateral (
      select r.user_id
      from public.community_post_reactions r
      where r.post_id = tp.post_id
        and r.user_id <> tp.author_id
        and (v_since is null or r.created_at >= v_since)
      union
      select c.user_id
      from public.community_post_comments c
      where c.post_id = tp.post_id
        and c.user_id <> tp.author_id
        and (v_since is null or c.created_at >= v_since)
    ) eng on true
    group by tp.author_id
  ),
  share_counts as (
    select e.supporter_user_id,
      count(*)::int as shares
    from public.artist_fandom_events e
    where e.artist_profile_id = v_profile_id
      and e.action_type = 'share'
      and (v_since is null or e.created_at >= v_since)
    group by e.supporter_user_id
  ),
  combined as (
    select
      coalesce(s.supporter_user_id, r.supporter_user_id) as supporter_user_id,
      coalesce(s.shares, 0) as shares,
      coalesce(r.wired_reach, 0) as wired_reach,
      (coalesce(s.shares, 0) * 2 + coalesce(r.wired_reach, 0)) as driver_score
    from share_counts s
    full outer join reach r on r.supporter_user_id = s.supporter_user_id
    where coalesce(s.shares, 0) + coalesce(r.wired_reach, 0) > 0
  ),
  ranked as (
    select
      c.*,
      row_number() over (order by c.driver_score desc, c.shares desc, c.wired_reach desc) as rn
    from combined c
  )
  select
    rk.supporter_user_id,
    pr.name as display_name,
    coalesce(nullif(trim(pr.username), ''), 'member') as handle,
    pr.avatar_url,
    rk.shares,
    rk.wired_reach,
    rk.rn::int as driver_rank
  from ranked rk
  join public.profiles pr on pr.id = rk.supporter_user_id
  order by rk.rn
  limit greatest(lim, 1);
end;
$$;

grant execute on function public.fandom_artist_discovery_drivers(text, int) to authenticated;

-- Rising artists by recent support activity (public).
create or replace function public.fandom_discover_rising_artists(lim int default 12)
returns table (
  artist_profile_id uuid,
  slug text,
  display_name text,
  avatar_url text,
  momentum_label text,
  recent_supporters int
)
language sql
stable
security definer
set search_path = public
as $$
  with recent as (
    select
      e.artist_profile_id,
      count(*) filter (where e.created_at >= now() - interval '14 days')::int as recent_events,
      count(distinct e.supporter_user_id) filter (
        where e.created_at >= now() - interval '14 days'
      )::int as recent_supporters
    from public.artist_fandom_events e
    where e.created_at >= now() - interval '90 days'
    group by e.artist_profile_id
    having count(*) filter (where e.created_at >= now() - interval '14 days') >= 2
  )
  select
    ap.id as artist_profile_id,
    ap.slug,
    ap.display_name,
    ap.avatar_url,
    case
      when r.recent_supporters >= 8 then 'Surging on the wire'
      when r.recent_supporters >= 4 then 'Rising this week'
      else 'Building momentum'
    end as momentum_label,
    r.recent_supporters
  from recent r
  join public.artist_profiles ap on ap.id = r.artist_profile_id
  where coalesce(ap.published, false) = true
  order by r.recent_events desc, r.recent_supporters desc
  limit greatest(lim, 1);
$$;

grant execute on function public.fandom_discover_rising_artists(int) to anon, authenticated;

-- Artists your support circle also backs (authenticated).
create or replace function public.fandom_discover_from_my_fandom(lim int default 8)
returns table (
  artist_profile_id uuid,
  slug text,
  display_name text,
  avatar_url text,
  reason_label text,
  circle_overlap int
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  return query
  with mine as (
    select distinct t.artist_profile_id
    from public.artist_fandom_totals t
    where t.supporter_user_id = v_user
      and t.support_score > 0
  ),
  peers as (
    select
      e2.artist_profile_id,
      count(distinct e2.supporter_user_id)::int as circle_overlap
    from public.artist_fandom_events e1
    join public.artist_fandom_events e2
      on e2.supporter_user_id = e1.supporter_user_id
     and e2.artist_profile_id not in (select artist_profile_id from mine)
    where e1.artist_profile_id in (select artist_profile_id from mine)
      and e1.created_at >= now() - interval '90 days'
      and e2.created_at >= now() - interval '90 days'
    group by e2.artist_profile_id
    having count(distinct e2.supporter_user_id) >= 2
  )
  select
    ap.id as artist_profile_id,
    ap.slug,
    ap.display_name,
    ap.avatar_url,
    'Also supported by your circle'::text as reason_label,
    p.circle_overlap
  from peers p
  join public.artist_profiles ap on ap.id = p.artist_profile_id
  where coalesce(ap.published, false) = true
  order by p.circle_overlap desc, ap.display_name asc
  limit greatest(lim, 1);
end;
$$;

grant execute on function public.fandom_discover_from_my_fandom(int) to authenticated;
