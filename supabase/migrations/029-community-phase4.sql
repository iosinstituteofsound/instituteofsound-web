-- Phase 4: Crews — small squads competing on combined weekly dB

create table if not exists public.community_crews (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 3 and 32),
  slug text not null unique,
  tagline text,
  invite_code text not null unique,
  founder_id uuid not null references public.profiles (id) on delete cascade,
  genre_id uuid references public.community_genres (id) on delete set null,
  max_members int not null default 12 check (max_members >= 2 and max_members <= 24),
  created_at timestamptz not null default now(),
  constraint community_crews_tagline_len check (tagline is null or char_length(tagline) <= 80)
);

create table if not exists public.community_crew_members (
  crew_id uuid not null references public.community_crews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('founder', 'member')),
  joined_at timestamptz not null default now(),
  primary key (crew_id, user_id),
  constraint community_crew_one_per_user unique (user_id)
);

create index if not exists community_crew_members_crew_idx
  on public.community_crew_members (crew_id);

create index if not exists community_crews_invite_idx
  on public.community_crews (invite_code);

alter table public.community_crews enable row level security;
alter table public.community_crew_members enable row level security;

drop policy if exists "Public read crews" on public.community_crews;
create policy "Public read crews"
  on public.community_crews for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read crew members" on public.community_crew_members;
create policy "Public read crew members"
  on public.community_crew_members for select
  to anon, authenticated
  using (true);

-- ── Helpers ───────────────────────────────────────────────────────────
create or replace function public.community_slugify_crew(p_name text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    lower(regexp_replace(trim(p_name), '[^a-zA-Z0-9]+', '-', 'g')),
    '-+', '-', 'g'
  ));
$$;

create or replace function public.community_new_invite_code()
returns text
language plpgsql
as $$
declare
  code text;
  tries int := 0;
begin
  loop
    code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
    exit when not exists (select 1 from public.community_crews c where c.invite_code = code);
    tries := tries + 1;
    if tries > 20 then
      raise exception 'Could not generate invite code';
    end if;
  end loop;
  return code;
end;
$$;

-- ── My crew + roster ──────────────────────────────────────────────────
create or replace function public.community_my_crew()
returns table (
  crew_id uuid,
  crew_name text,
  crew_slug text,
  invite_code text,
  tagline text,
  genre_slug text,
  founder_id uuid,
  my_role text,
  member_count int,
  weekly_db bigint,
  max_members int
)
language sql
stable
security definer
set search_path = public
as $$
  with my_membership as (
    select m.crew_id, m.role
    from public.community_crew_members m
    where m.user_id = auth.uid()
  ),
  crew_stats as (
    select
      c.id,
      count(m.user_id)::int as member_count,
      coalesce(sum(e.amount), 0)::bigint as weekly_db
    from public.community_crews c
    join my_membership mm on mm.crew_id = c.id
    join public.community_crew_members m on m.crew_id = c.id
    left join public.community_db_events e on e.user_id = m.user_id
      and e.created_at >= (timezone('utc', now()) - interval '7 days')
    group by c.id
  )
  select
    c.id as crew_id,
    c.name as crew_name,
    c.slug as crew_slug,
    c.invite_code,
    c.tagline,
    g.slug as genre_slug,
    c.founder_id,
    mm.role as my_role,
    cs.member_count,
    cs.weekly_db,
    c.max_members
  from public.community_crews c
  join my_membership mm on mm.crew_id = c.id
  join crew_stats cs on cs.id = c.id
  left join public.community_genres g on g.id = c.genre_id;
$$;

create or replace function public.community_crew_roster(p_crew_id uuid)
returns table (
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  community_rank text,
  role text,
  weekly_db bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as user_id,
    p.name as display_name,
    coalesce(
      nullif(trim(p.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    ) as handle,
    p.avatar_url,
    public.community_rank_for_db(p.total_db) as community_rank,
    m.role,
    coalesce((
      select sum(e.amount)::bigint
      from public.community_db_events e
      where e.user_id = p.id
        and e.created_at >= (timezone('utc', now()) - interval '7 days')
    ), 0) as weekly_db
  from public.community_crew_members m
  join public.profiles p on p.id = m.user_id
  where m.crew_id = p_crew_id
  order by weekly_db desc, m.joined_at asc;
$$;

-- ── Mutations ─────────────────────────────────────────────────────────
create or replace function public.community_create_crew(
  p_name text,
  p_tagline text default null,
  p_genre_slug text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_crew_id uuid;
  v_slug text;
  v_slug_base text;
  v_suffix int := 0;
  v_genre_id uuid;
  v_code text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.community_crew_members where user_id = v_user) then
    raise exception 'Leave your current crew before creating a new one';
  end if;

  v_slug_base := public.community_slugify_crew(p_name);
  if v_slug_base = '' then
    raise exception 'Invalid crew name';
  end if;

  v_slug := v_slug_base;
  while exists (select 1 from public.community_crews where slug = v_slug) loop
    v_suffix := v_suffix + 1;
    v_slug := v_slug_base || '-' || v_suffix::text;
  end loop;

  if p_genre_slug is not null and trim(p_genre_slug) <> '' then
    select id into v_genre_id from public.community_genres
    where slug = p_genre_slug and active = true;
  end if;

  v_code := public.community_new_invite_code();

  insert into public.community_crews (name, slug, tagline, invite_code, founder_id, genre_id)
  values (
    trim(p_name),
    v_slug,
    nullif(trim(p_tagline), ''),
    v_code,
    v_user,
    v_genre_id
  )
  returning id into v_crew_id;

  insert into public.community_crew_members (crew_id, user_id, role)
  values (v_crew_id, v_user, 'founder');

  return v_crew_id;
end;
$$;

create or replace function public.community_join_crew(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_crew_id uuid;
  v_count int;
  v_max int;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.community_crew_members where user_id = v_user) then
    raise exception 'You are already in a crew';
  end if;

  select c.id, c.max_members into v_crew_id, v_max
  from public.community_crews c
  where upper(trim(c.invite_code)) = upper(trim(p_invite_code));

  if v_crew_id is null then
    raise exception 'Invalid invite code';
  end if;

  select count(*)::int into v_count from public.community_crew_members where crew_id = v_crew_id;

  if v_count >= v_max then
    raise exception 'This crew is full';
  end if;

  insert into public.community_crew_members (crew_id, user_id, role)
  values (v_crew_id, v_user, 'member');

  return v_crew_id;
end;
$$;

create or replace function public.community_leave_crew()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_crew_id uuid;
  v_role text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select m.crew_id, m.role into v_crew_id, v_role
  from public.community_crew_members m
  where m.user_id = v_user;

  if v_crew_id is null then
    raise exception 'You are not in a crew';
  end if;

  if v_role = 'founder' then
    raise exception 'Founders must disband the crew instead of leaving';
  end if;

  delete from public.community_crew_members where user_id = v_user;
end;
$$;

create or replace function public.community_disband_crew()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_crew_id uuid;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select m.crew_id into v_crew_id
  from public.community_crew_members m
  where m.user_id = v_user and m.role = 'founder';

  if v_crew_id is null then
    raise exception 'Only the founder can disband this crew';
  end if;

  delete from public.community_crews where id = v_crew_id;
end;
$$;

-- ── Crew vs crew weekly board ─────────────────────────────────────────
create or replace function public.community_crew_weekly_leaderboard(lim int default 15)
returns table (
  crew_id uuid,
  crew_name text,
  crew_slug text,
  tagline text,
  genre_slug text,
  invite_code text,
  member_count int,
  weekly_db bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with crew_weekly as (
    select
      c.id as crew_id,
      count(distinct m.user_id)::int as member_count,
      coalesce(sum(e.amount), 0)::bigint as weekly_db
    from public.community_crews c
    join public.community_crew_members m on m.crew_id = c.id
    left join public.community_db_events e on e.user_id = m.user_id
      and e.created_at >= (timezone('utc', now()) - interval '7 days')
    group by c.id
  )
  select
    c.id as crew_id,
    c.name as crew_name,
    c.slug as crew_slug,
    c.tagline,
    g.slug as genre_slug,
    c.invite_code,
    cw.member_count,
    cw.weekly_db
  from crew_weekly cw
  join public.community_crews c on c.id = cw.crew_id
  left join public.community_genres g on g.id = c.genre_id
  where cw.weekly_db > 0
  order by cw.weekly_db desc, cw.member_count desc
  limit greatest(lim, 1);
$$;

grant execute on function public.community_my_crew() to authenticated;
grant execute on function public.community_crew_roster(uuid) to anon, authenticated;
grant execute on function public.community_create_crew(text, text, text) to authenticated;
grant execute on function public.community_join_crew(text) to authenticated;
grant execute on function public.community_leave_crew() to authenticated;
grant execute on function public.community_disband_crew() to authenticated;
grant execute on function public.community_crew_weekly_leaderboard(int) to anon, authenticated;
