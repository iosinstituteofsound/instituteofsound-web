-- Phase 16: Events lite — gig listings, editor-approved, RSVP counts

create table if not exists public.scene_events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 120),
  description text check (description is null or char_length(description) <= 500),
  event_kind text not null default 'gig'
    check (event_kind in ('gig', 'dj-night', 'listening', 'open-mic', 'beat-battle', 'warehouse', 'other')),
  scene_city text not null,
  scene_genre_slug text,
  venue_name text not null check (char_length(trim(venue_name)) between 2 and 120),
  starts_at timestamptz not null,
  external_url text not null check (char_length(trim(external_url)) between 8 and 500),
  status text not null default 'pending'
    check (status in ('pending', 'published', 'rejected')),
  submitted_by uuid not null references public.profiles (id) on delete cascade,
  reviewed_by uuid references public.profiles (id) on delete set null,
  rejection_note text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Partial index: no now() in predicate (not IMMUTABLE). Upcoming filter is in RPCs.
create index if not exists scene_events_published_idx
  on public.scene_events (starts_at asc)
  where status = 'published';

create index if not exists scene_events_scene_idx
  on public.scene_events (scene_city, scene_genre_slug, starts_at)
  where status = 'published';

create index if not exists scene_events_pending_idx
  on public.scene_events (created_at desc)
  where status = 'pending';

create table if not exists public.scene_event_rsvps (
  event_id uuid not null references public.scene_events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index if not exists scene_event_rsvps_event_idx
  on public.scene_event_rsvps (event_id);

alter table public.scene_events enable row level security;
alter table public.scene_event_rsvps enable row level security;

drop policy if exists "Public read published scene events" on public.scene_events;
create policy "Public read published scene events"
  on public.scene_events for select
  to anon, authenticated
  using (status = 'published' or auth.uid() = submitted_by or public.is_editor());

drop policy if exists "Users submit scene events" on public.scene_events;
create policy "Users submit scene events"
  on public.scene_events for insert
  to authenticated
  with check (auth.uid() = submitted_by and status = 'pending');

drop policy if exists "Editors update scene events" on public.scene_events;
create policy "Editors update scene events"
  on public.scene_events for update
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

drop policy if exists "Public read RSVP counts via rpc" on public.scene_event_rsvps;
create policy "Public read RSVP counts via rpc"
  on public.scene_event_rsvps for select
  to anon, authenticated
  using (true);

drop policy if exists "Users manage own RSVPs" on public.scene_event_rsvps;
create policy "Users manage own RSVPs"
  on public.scene_event_rsvps for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Upcoming published events (India scene filters)
create or replace function public.events_upcoming(
  p_city text default null,
  p_genre_slug text default null,
  p_days_ahead int default 45,
  lim int default 40
)
returns table (
  id uuid,
  title text,
  description text,
  event_kind text,
  scene_city text,
  scene_genre_slug text,
  venue_name text,
  starts_at timestamptz,
  external_url text,
  rsvp_count bigint,
  viewer_rsvped boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id,
    e.title,
    e.description,
    e.event_kind,
    e.scene_city,
    e.scene_genre_slug,
    e.venue_name,
    e.starts_at,
    e.external_url,
    (
      select count(*)::bigint from public.scene_event_rsvps r where r.event_id = e.id
    ) as rsvp_count,
    exists (
      select 1 from public.scene_event_rsvps r
      where r.event_id = e.id and r.user_id = auth.uid()
    ) as viewer_rsvped
  from public.scene_events e
  where e.status = 'published'
    and e.starts_at >= timezone('utc', now())
    and e.starts_at < timezone('utc', now()) + make_interval(days => greatest(p_days_ahead, 1))
    and (p_city is null or public.scene_city_slug(e.scene_city) = public.scene_city_slug(p_city))
    and (p_genre_slug is null or lower(trim(coalesce(e.scene_genre_slug, ''))) = lower(trim(p_genre_slug)))
  order by e.starts_at asc
  limit greatest(lim, 1);
$$;

grant execute on function public.events_upcoming(text, text, int, int) to anon, authenticated;

-- Scene hub gigs this month
create or replace function public.events_by_scene(
  p_city_slug text,
  p_genre_slug text,
  lim int default 12
)
returns table (
  id uuid,
  title text,
  description text,
  event_kind text,
  scene_city text,
  scene_genre_slug text,
  venue_name text,
  starts_at timestamptz,
  external_url text,
  rsvp_count bigint,
  viewer_rsvped boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id,
    e.title,
    e.description,
    e.event_kind,
    e.scene_city,
    e.scene_genre_slug,
    e.venue_name,
    e.starts_at,
    e.external_url,
    (
      select count(*)::bigint from public.scene_event_rsvps r where r.event_id = e.id
    ) as rsvp_count,
    exists (
      select 1 from public.scene_event_rsvps r
      where r.event_id = e.id and r.user_id = auth.uid()
    ) as viewer_rsvped
  from public.scene_events e
  where e.status = 'published'
    and e.starts_at >= timezone('utc', now())
    and e.starts_at < date_trunc('month', timezone('utc', now())) + interval '1 month'
    and public.scene_city_slug(e.scene_city) = public.scene_city_slug(p_city_slug)
    and (
      p_genre_slug is null
      or lower(trim(coalesce(e.scene_genre_slug, ''))) = lower(trim(p_genre_slug))
    )
  order by e.starts_at asc
  limit greatest(lim, 1);
$$;

grant execute on function public.events_by_scene(text, text, int) to anon, authenticated;

-- Artist / member submit listing
create or replace function public.events_submit(
  p_title text,
  p_description text,
  p_event_kind text,
  p_scene_city text,
  p_scene_genre_slug text,
  p_venue_name text,
  p_starts_at timestamptz,
  p_external_url text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_event_kind not in ('gig', 'dj-night', 'listening', 'open-mic', 'beat-battle', 'warehouse', 'other') then
    raise exception 'Invalid event kind';
  end if;

  insert into public.scene_events (
    title,
    description,
    event_kind,
    scene_city,
    scene_genre_slug,
    venue_name,
    starts_at,
    external_url,
    submitted_by
  )
  values (
    trim(p_title),
    nullif(trim(p_description), ''),
    p_event_kind,
    trim(p_scene_city),
    nullif(trim(p_scene_genre_slug), ''),
    trim(p_venue_name),
    p_starts_at,
    trim(p_external_url),
    v_uid
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.events_submit(text, text, text, text, text, text, timestamptz, text) to authenticated;

-- Editor queue
create or replace function public.events_pending(lim int default 30)
returns table (
  id uuid,
  title text,
  event_kind text,
  scene_city text,
  scene_genre_slug text,
  venue_name text,
  starts_at timestamptz,
  external_url text,
  submitted_at timestamptz,
  submitter_name text,
  submitter_handle text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id,
    e.title,
    e.event_kind,
    e.scene_city,
    e.scene_genre_slug,
    e.venue_name,
    e.starts_at,
    e.external_url,
    e.created_at as submitted_at,
    pr.name as submitter_name,
    coalesce(nullif(trim(pr.username), ''), 'member') as submitter_handle
  from public.scene_events e
  join public.profiles pr on pr.id = e.submitted_by
  where e.status = 'pending'
    and public.is_editor()
  order by e.starts_at asc, e.created_at asc
  limit greatest(lim, 1);
$$;

grant execute on function public.events_pending(int) to authenticated;

create or replace function public.events_moderate(
  p_event_id uuid,
  p_action text,
  p_rejection_note text default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.is_editor() then
    raise exception 'Editor access required';
  end if;

  if p_action = 'publish' then
    update public.scene_events
    set
      status = 'published',
      published_at = timezone('utc', now()),
      reviewed_by = v_uid,
      rejection_note = null,
      updated_at = timezone('utc', now())
    where id = p_event_id and status = 'pending';
  elsif p_action = 'reject' then
    update public.scene_events
    set
      status = 'rejected',
      reviewed_by = v_uid,
      rejection_note = nullif(trim(p_rejection_note), ''),
      updated_at = timezone('utc', now())
    where id = p_event_id and status = 'pending';
  else
    raise exception 'Invalid action';
  end if;

  return found;
end;
$$;

grant execute on function public.events_moderate(uuid, text, text) to authenticated;

-- Toggle RSVP
create or replace function public.events_rsvp_toggle(p_event_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_exists boolean;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.scene_events e
    where e.id = p_event_id and e.status = 'published' and e.starts_at >= timezone('utc', now())
  ) then
    raise exception 'Event not available';
  end if;

  select exists (
    select 1 from public.scene_event_rsvps
    where event_id = p_event_id and user_id = v_uid
  ) into v_exists;

  if v_exists then
    delete from public.scene_event_rsvps
    where event_id = p_event_id and user_id = v_uid;
    return false;
  end if;

  insert into public.scene_event_rsvps (event_id, user_id)
  values (p_event_id, v_uid);
  return true;
end;
$$;

grant execute on function public.events_rsvp_toggle(uuid) to authenticated;
