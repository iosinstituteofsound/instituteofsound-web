-- Phase 0: Community gamification — dB ledger, genres, ranks, weekly leaderboard

-- ── Genres (taste tribes) ─────────────────────────────────────────────
create table if not exists public.community_genres (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  active boolean not null default true
);

insert into public.community_genres (slug, name, sort_order) values
  ('industrial', 'Industrial', 10),
  ('techno', 'Techno', 20),
  ('dnb', 'DnB', 30),
  ('ambient', 'Ambient', 40),
  ('experimental', 'Experimental', 50),
  ('rock', 'Rock', 60),
  ('metal', 'Metal', 70),
  ('punk', 'Punk', 80),
  ('hip-hop', 'Hip-hop', 90),
  ('house', 'House', 100),
  ('bedroom-pop', 'Bedroom pop', 110),
  ('indie', 'Indie / alt', 120),
  ('electronic', 'Electronic', 130),
  ('india-indie', 'India indie', 140)
on conflict (slug) do nothing;

-- ── Profile community stats ─────────────────────────────────────────
alter table public.profiles
  add column if not exists total_db int not null default 0,
  add column if not exists primary_genre_id uuid references public.community_genres (id) on delete set null;

comment on column public.profiles.total_db is 'All-time dB (decibel points) for community rank';
comment on column public.profiles.primary_genre_id is 'Primary taste tribe for genre leaderboards (Phase 3)';

-- ── dB event ledger ───────────────────────────────────────────────────
create table if not exists public.community_db_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount int not null check (amount > 0),
  source text not null,
  source_id text not null,
  genre_id uuid references public.community_genres (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, source, source_id)
);

create index if not exists community_db_events_user_created_idx
  on public.community_db_events (user_id, created_at desc);

create index if not exists community_db_events_created_idx
  on public.community_db_events (created_at desc);

alter table public.community_db_events enable row level security;

drop policy if exists "Users insert own db events" on public.community_db_events;
create policy "Users insert own db events"
  on public.community_db_events for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users read own db events" on public.community_db_events;
create policy "Users read own db events"
  on public.community_db_events for select
  to authenticated
  using (auth.uid() = user_id);

-- Keep profiles.total_db in sync
create or replace function public.trg_community_db_events_apply_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set total_db = total_db + new.amount
  where id = new.user_id;
  return new;
end;
$$;

drop trigger if exists community_db_events_apply_total on public.community_db_events;
create trigger community_db_events_apply_total
  after insert on public.community_db_events
  for each row execute function public.trg_community_db_events_apply_total();

-- ── Rank helper (must exist before leaderboard RPCs) ──────────────────
create or replace function public.community_rank_for_db(db int)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when db >= 15000 then 'Operator'
    when db >= 8000 then 'Signal Host'
    when db >= 4000 then 'Archivist'
    when db >= 1500 then 'Curator'
    when db >= 500 then 'Scout'
    else 'Listener'
  end;
$$;

-- ── Public leaderboard RPC (no direct profile scrape) ─────────────────
create or replace function public.community_weekly_leaderboard(lim int default 20)
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
  with weekly as (
    select
      e.user_id,
      sum(e.amount)::bigint as weekly_db
    from public.community_db_events e
    where e.created_at >= (timezone('utc', now()) - interval '7 days')
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
  where w.weekly_db > 0
  order by w.weekly_db desc, p.total_db desc
  limit greatest(lim, 1);
$$;

create or replace function public.community_member_stats(p_user_id uuid)
returns table (
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  total_db int,
  weekly_db bigint,
  community_rank text,
  next_rank text,
  db_to_next_rank int,
  rank_progress_pct int,
  primary_genre_slug text
)
language sql
stable
security definer
set search_path = public
as $$
  with weekly as (
    select coalesce(sum(e.amount), 0)::bigint as weekly_db
    from public.community_db_events e
    where e.user_id = p_user_id
      and e.created_at >= (timezone('utc', now()) - interval '7 days')
  ),
  prof as (
    select
      p.id,
      p.name,
      coalesce(
        nullif(trim(p.username), ''),
        nullif(trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
        'member'
      ) as handle,
      p.avatar_url,
      p.total_db,
      g.slug as primary_genre_slug
    from public.profiles p
    left join public.community_genres g on g.id = p.primary_genre_id
    where p.id = p_user_id
  )
  select
    prof.id as user_id,
    prof.name as display_name,
    prof.handle,
    prof.avatar_url,
    prof.total_db,
    weekly.weekly_db,
    public.community_rank_for_db(prof.total_db) as community_rank,
    case public.community_rank_for_db(prof.total_db)
      when 'Listener' then 'Scout'
      when 'Scout' then 'Curator'
      when 'Curator' then 'Archivist'
      when 'Archivist' then 'Signal Host'
      when 'Signal Host' then 'Operator'
      else null
    end as next_rank,
    case public.community_rank_for_db(prof.total_db)
      when 'Listener' then greatest(0, 500 - prof.total_db)
      when 'Scout' then greatest(0, 1500 - prof.total_db)
      when 'Curator' then greatest(0, 4000 - prof.total_db)
      when 'Archivist' then greatest(0, 8000 - prof.total_db)
      when 'Signal Host' then greatest(0, 15000 - prof.total_db)
      else 0
    end as db_to_next_rank,
    case public.community_rank_for_db(prof.total_db)
      when 'Listener' then least(100, greatest(0, (prof.total_db * 100) / 500))
      when 'Scout' then least(100, greatest(0, ((prof.total_db - 500) * 100) / 1000))
      when 'Curator' then least(100, greatest(0, ((prof.total_db - 1500) * 100) / 2500))
      when 'Archivist' then least(100, greatest(0, ((prof.total_db - 4000) * 100) / 4000))
      when 'Signal Host' then least(100, greatest(0, ((prof.total_db - 8000) * 100) / 7000))
      else 100
    end as rank_progress_pct,
    prof.primary_genre_slug
  from prof
  cross join weekly;
$$;

grant execute on function public.community_weekly_leaderboard(int) to anon, authenticated;
grant execute on function public.community_member_stats(uuid) to anon, authenticated;
grant execute on function public.community_rank_for_db(int) to anon, authenticated;

-- Public read genres
alter table public.community_genres enable row level security;

drop policy if exists "Public read community genres" on public.community_genres;
create policy "Public read community genres"
  on public.community_genres for select
  to anon, authenticated
  using (active = true);
