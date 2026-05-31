-- Public supporter badges on member profiles (label only, no scores).

create or replace function public.fandom_public_supporter_badges_for_user(
  p_supporter_user_id uuid,
  lim int default 8
)
returns table (
  artist_profile_id uuid,
  artist_slug text,
  artist_display_name text,
  badge_label text,
  supporter_rank int
)
language sql
stable
security definer
set search_path = public
as $$
  with per_artist_scores as (
    select
      e.artist_profile_id,
      e.supporter_user_id,
      sum(e.weight) as support_score,
      max(e.created_at) as last_at
    from public.artist_fandom_events e
    where e.created_at >= now() - interval '90 days'
    group by e.artist_profile_id, e.supporter_user_id
  ),
  ranked as (
    select
      s.artist_profile_id,
      s.supporter_user_id,
      row_number() over (
        partition by s.artist_profile_id
        order by s.support_score desc, s.last_at desc
      ) as rn,
      count(*) over (partition by s.artist_profile_id) as total
    from per_artist_scores s
  ),
  badges as (
    select
      r.artist_profile_id,
      r.rn,
      case
        when r.rn = 1 then '#1 Supporter'
        when r.rn = 2 then '#2 Supporter'
        when r.rn = 3 then '#3 Supporter'
        when r.rn <= greatest(3, ceil(r.total * 0.05)::int) then 'Top 5%'
        when r.rn <= greatest(5, ceil(r.total * 0.10)::int) then 'Top 10%'
        else null
      end as badge_label
    from ranked r
    where r.supporter_user_id = p_supporter_user_id
  )
  select
    b.artist_profile_id,
    ap.slug as artist_slug,
    ap.display_name as artist_display_name,
    b.badge_label,
    b.rn::int as supporter_rank
  from badges b
  join public.artist_profiles ap on ap.id = b.artist_profile_id
  where b.badge_label is not null
    and coalesce(ap.published, false) = true
  order by b.rn asc, ap.display_name asc
  limit greatest(lim, 1);
$$;

grant execute on function public.fandom_public_supporter_badges_for_user(uuid, int) to anon, authenticated;
