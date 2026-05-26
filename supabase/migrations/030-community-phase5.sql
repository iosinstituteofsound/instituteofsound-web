-- Phase 5: Weekly challenges, feed reactions, new badges

-- ── New badges ────────────────────────────────────────────────────────
insert into public.community_badges (slug, name, description, sort_order) values
  ('first_spin', 'First Spin', 'Posted your first Spin on the network.', 50),
  ('first_drop', 'First Drop', 'Posted your first Drop transmission.', 55),
  ('crew_joined', 'Crew', 'Joined a crew.', 60),
  ('weekly_warrior', 'Weekly Warrior', 'Completed the weekly dB challenge.', 70),
  ('triple_signal', 'Triple Signal', 'Completed all three weekly challenges in one week.', 80)
on conflict (slug) do nothing;

-- ── Post reactions ────────────────────────────────────────────────────
create table if not exists public.community_post_reactions (
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reaction text not null check (reaction in ('fire', 'headphones', 'bolt')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create index if not exists community_post_reactions_post_idx
  on public.community_post_reactions (post_id);

alter table public.community_post_reactions enable row level security;

drop policy if exists "Public read post reactions" on public.community_post_reactions;
create policy "Public read post reactions"
  on public.community_post_reactions for select
  to anon, authenticated
  using (true);

-- ── Weekly challenge completions ──────────────────────────────────────
create table if not exists public.community_challenge_completions (
  user_id uuid not null references public.profiles (id) on delete cascade,
  challenge_slug text not null,
  week_key text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, challenge_slug, week_key)
);

alter table public.community_challenge_completions enable row level security;

drop policy if exists "Users read own challenge completions" on public.community_challenge_completions;
create policy "Users read own challenge completions"
  on public.community_challenge_completions for select
  to authenticated
  using (auth.uid() = user_id);

-- ISO week key in UTC
create or replace function public.community_current_week_key()
returns text
language sql
stable
as $$
  select to_char(timezone('utc', now()), 'IYYY') || '-W' || lpad(to_char(timezone('utc', now()), 'IW'), 2, '0');
$$;

-- Toggle reaction (tap same to remove)
create or replace function public.community_toggle_post_reaction(
  p_post_id uuid,
  p_reaction text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_existing text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if p_reaction not in ('fire', 'headphones', 'bolt') then
    raise exception 'Invalid reaction';
  end if;

  if not exists (
    select 1 from public.community_posts where id = p_post_id and status = 'visible'
  ) then
    raise exception 'Post not found';
  end if;

  select reaction into v_existing
  from public.community_post_reactions
  where post_id = p_post_id and user_id = v_user;

  if v_existing = p_reaction then
    delete from public.community_post_reactions
    where post_id = p_post_id and user_id = v_user;
    return null;
  end if;

  insert into public.community_post_reactions (post_id, user_id, reaction)
  values (p_post_id, v_user, p_reaction)
  on conflict (post_id, user_id) do update set reaction = excluded.reaction;

  return p_reaction;
end;
$$;

-- Feed with reaction counts + viewer reaction
drop function if exists public.community_feed(int);

create or replace function public.community_feed(lim int default 30)
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
  order by p.created_at desc
  limit greatest(lim, 1);
$$;

-- Active weekly challenges with progress
create or replace function public.community_weekly_challenges()
returns table (
  slug text,
  title text,
  description text,
  target int,
  progress int,
  reward_db int,
  completed boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with wk as (
    select public.community_current_week_key() as week_key
  ),
  me as (
    select auth.uid() as user_id
  ),
  weekly_db as (
    select coalesce(sum(e.amount), 0)::int as val
    from public.community_db_events e, me, wk
    where e.user_id = me.user_id
      and e.created_at >= (timezone('utc', now()) - interval '7 days')
  ),
  spin_count as (
    select count(*)::int as val
    from public.community_posts p, me, wk
    where p.user_id = me.user_id
      and p.kind = 'spin'
      and p.status = 'visible'
      and p.created_at >= (timezone('utc', now()) - interval '7 days')
  ),
  drop_count as (
    select count(*)::int as val
    from public.community_posts p, me, wk
    where p.user_id = me.user_id
      and p.kind = 'drop'
      and p.status = 'visible'
      and p.created_at >= (timezone('utc', now()) - interval '7 days')
  ),
  in_crew as (
    select case when exists (
      select 1 from public.community_crew_members m, me
      where m.user_id = me.user_id
    ) then 1 else 0 end as val
  ),
  defs as (
    select * from (values
      ('weekly_db_75', 'Signal surge', 'Earn 75 dB this week.', 75, (select val from weekly_db), 20),
      ('weekly_spin', 'Spin the wire', 'Post a Spin this week.', 1, (select val from spin_count), 15),
      ('weekly_crew', 'Squad online', 'Be in a crew this week.', 1, (select val from in_crew), 10)
    ) as t(slug, title, description, target, progress, reward_db)
  )
  select
    d.slug,
    d.title,
    d.description,
    d.target,
    least(d.progress, d.target) as progress,
    d.reward_db,
    exists (
      select 1 from public.community_challenge_completions c, me, wk
      where c.user_id = me.user_id
        and c.challenge_slug = d.slug
        and c.week_key = wk.week_key
    ) as completed
  from defs d, wk;
$$;

-- Grant rewards + badges when thresholds met
create or replace function public.community_evaluate_weekly_challenges()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_week text;
  v_granted int := 0;
  ch record;
  v_genre uuid;
begin
  if v_user is null then
    return 0;
  end if;

  v_week := public.community_current_week_key();

  select primary_genre_id into v_genre from public.profiles where id = v_user;

  for ch in
    select * from public.community_weekly_challenges()
    where progress >= target and not completed
  loop
    insert into public.community_challenge_completions (user_id, challenge_slug, week_key)
    values (v_user, ch.slug, v_week)
    on conflict do nothing;

    if not found then
      continue;
    end if;

    insert into public.community_db_events (user_id, amount, source, source_id, genre_id)
    values (
      v_user,
      ch.reward_db,
      'challenge_' || ch.slug,
      v_week,
      v_genre
    )
    on conflict do nothing;

    if ch.slug = 'weekly_db_75' then
      perform public.community_grant_badge('weekly_warrior');
    end if;

    v_granted := v_granted + 1;
  end loop;

  if (
    select count(*) = 3
    from public.community_challenge_completions
    where user_id = v_user and week_key = v_week
  ) then
    perform public.community_grant_badge('triple_signal');
  end if;

  return v_granted;
end;
$$;

grant execute on function public.community_toggle_post_reaction(uuid, text) to authenticated;
grant execute on function public.community_feed(int) to anon, authenticated;
grant execute on function public.community_weekly_challenges() to authenticated;
grant execute on function public.community_evaluate_weekly_challenges() to authenticated;
