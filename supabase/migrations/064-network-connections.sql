-- Network mutual connections (Connect) + profile stats

-- ── Connections (mutual, unordered pair) ───────────────────────────────
create table if not exists public.network_connections (
  user_a uuid not null references public.profiles (id) on delete cascade,
  user_b uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_a, user_b),
  constraint network_connections_ordered check (user_a < user_b),
  constraint network_connections_not_self check (user_a <> user_b)
);

create index if not exists network_connections_user_a_idx
  on public.network_connections (user_a, created_at desc);
create index if not exists network_connections_user_b_idx
  on public.network_connections (user_b, created_at desc);

alter table public.network_connections enable row level security;

drop policy if exists "Public read network connections" on public.network_connections;
create policy "Public read network connections"
  on public.network_connections for select
  to anon, authenticated
  using (true);

-- ── Connection requests ───────────────────────────────────────────────
create table if not exists public.network_connection_requests (
  id uuid primary key default gen_random_uuid(),
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint network_connection_requests_not_self check (from_user_id <> to_user_id)
);

create unique index if not exists network_connection_requests_pending_pair_idx
  on public.network_connection_requests (from_user_id, to_user_id)
  where status = 'pending';

create index if not exists network_connection_requests_to_idx
  on public.network_connection_requests (to_user_id, created_at desc)
  where status = 'pending';

alter table public.network_connection_requests enable row level security;

drop policy if exists "Users read own connection requests" on public.network_connection_requests;
create policy "Users read own connection requests"
  on public.network_connection_requests for select
  to authenticated
  using (auth.uid() in (from_user_id, to_user_id));

drop policy if exists "Users insert own outgoing requests" on public.network_connection_requests;
create policy "Users insert own outgoing requests"
  on public.network_connection_requests for insert
  to authenticated
  with check (auth.uid() = from_user_id and status = 'pending');

drop policy if exists "Recipients update requests" on public.network_connection_requests;
create policy "Recipients update requests"
  on public.network_connection_requests for update
  to authenticated
  using (auth.uid() = to_user_id or auth.uid() = from_user_id)
  with check (auth.uid() in (from_user_id, to_user_id));

-- ── Notification kinds ────────────────────────────────────────────────
alter table public.community_notifications
  drop constraint if exists community_notifications_kind_check;

alter table public.community_notifications
  add constraint community_notifications_kind_check
  check (kind in (
    'follow',
    'reaction',
    'rank_up',
    'editorial_publish',
    'collab_response',
    'collab_accepted',
    'role_verification',
    'playlist_curator_application',
    'dm_message',
    'post_comment',
    'artist_page_recovery',
    'connection_request',
    'connection_accepted'
  ));

-- ── Helpers ───────────────────────────────────────────────────────────
create or replace function public.network_pair_users(p_a uuid, p_b uuid)
returns table (user_a uuid, user_b uuid)
language sql
immutable
as $$
  select
    least(p_a, p_b) as user_a,
    greatest(p_a, p_b) as user_b;
$$;

create or replace function public.network_are_connected(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.network_pair_users(p_a, p_b) pair
    join public.network_connections c
      on c.user_a = pair.user_a and c.user_b = pair.user_b
  );
$$;

create or replace function public.network_connection_status(p_target uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
begin
  if v_me is null or p_target is null or v_me = p_target then
    return 'none';
  end if;

  if public.network_are_connected(v_me, p_target) then
    return 'connected';
  end if;

  if exists (
    select 1 from public.network_connection_requests r
    where r.from_user_id = v_me and r.to_user_id = p_target and r.status = 'pending'
  ) then
    return 'pending_out';
  end if;

  if exists (
    select 1 from public.network_connection_requests r
    where r.from_user_id = p_target and r.to_user_id = v_me and r.status = 'pending'
  ) then
    return 'pending_in';
  end if;

  return 'none';
end;
$$;

-- ── Send request ──────────────────────────────────────────────────────
create or replace function public.network_send_connection_request(p_target uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_request_id uuid;
  v_actor_name text;
  v_actor_handle text;
begin
  if v_me is null then
    raise exception 'Sign in required';
  end if;
  if p_target is null or p_target = v_me then
    raise exception 'Invalid target';
  end if;
  if not exists (select 1 from public.profiles where id = p_target) then
    raise exception 'User not found';
  end if;
  if public.network_are_connected(v_me, p_target) then
    raise exception 'Already connected';
  end if;

  if exists (
    select 1 from public.network_connection_requests r
    where r.from_user_id = p_target and r.to_user_id = v_me and r.status = 'pending'
  ) then
  -- They already requested you — auto-accept
    perform public.network_respond_connection_request(
      (select id from public.network_connection_requests
       where from_user_id = p_target and to_user_id = v_me and status = 'pending'
       limit 1),
      true
    );
    return null;
  end if;

  update public.network_connection_requests
  set status = 'declined', updated_at = now()
  where from_user_id = v_me and to_user_id = p_target and status = 'pending';

  insert into public.network_connection_requests (from_user_id, to_user_id, status)
  values (v_me, p_target, 'pending')
  returning id into v_request_id;

  select p.name, coalesce(nullif(trim(p.username), ''), 'member')
  into v_actor_name, v_actor_handle
  from public.profiles p where p.id = v_me;

  perform public.community_enqueue_notification(
    p_target,
    v_me,
    'connection_request',
    v_actor_name || ' wants to connect',
    'Open your network home to accept.',
    '/network',
    jsonb_build_object('request_id', v_request_id)
  );

  return v_request_id;
end;
$$;

-- ── Respond to request ──────────────────────────────────────────────────
create or replace function public.network_respond_connection_request(
  p_request_id uuid,
  p_accept boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_row public.network_connection_requests%rowtype;
  v_pair record;
  v_actor_name text;
begin
  if v_me is null then
    raise exception 'Sign in required';
  end if;

  select * into v_row
  from public.network_connection_requests
  where id = p_request_id;

  if not found then
    raise exception 'Request not found';
  end if;
  if v_row.status <> 'pending' then
    raise exception 'Request is no longer pending';
  end if;
  if v_row.to_user_id <> v_me and not (v_row.from_user_id = v_me and not p_accept) then
    raise exception 'Not allowed';
  end if;

  if p_accept then
    select * into v_pair from public.network_pair_users(v_row.from_user_id, v_row.to_user_id);
    insert into public.network_connections (user_a, user_b)
    values (v_pair.user_a, v_pair.user_b)
    on conflict do nothing;

    update public.network_connection_requests
    set status = 'accepted', updated_at = now()
    where id = p_request_id;

    select name into v_actor_name from public.profiles where id = v_me;

    perform public.community_enqueue_notification(
      v_row.from_user_id,
      v_me,
      'connection_accepted',
      v_actor_name || ' accepted your connection',
      'You are now connected on the network.',
      public.network_profile_href(v_row.to_user_id),
      jsonb_build_object('request_id', p_request_id)
    );
  else
    update public.network_connection_requests
    set status = 'declined', updated_at = now()
    where id = p_request_id;
  end if;
end;
$$;

create or replace function public.network_profile_href(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select '/network/' || coalesce(
    nullif(trim(p.username), ''),
    nullif(trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
    'member'
  )
  from public.profiles p
  where p.id = p_user_id;
$$;

-- ── Remove connection ─────────────────────────────────────────────────
create or replace function public.network_remove_connection(p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_pair record;
begin
  if v_me is null then raise exception 'Sign in required'; end if;
  select * into v_pair from public.network_pair_users(v_me, p_target);
  delete from public.network_connections
  where user_a = v_pair.user_a and user_b = v_pair.user_b;
end;
$$;

-- ── List pending incoming ───────────────────────────────────────────────
create or replace function public.network_pending_requests()
returns table (
  request_id uuid,
  from_user_id uuid,
  from_name text,
  from_handle text,
  from_avatar_url text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id as request_id,
    r.from_user_id,
    p.name as from_name,
    coalesce(nullif(trim(p.username), ''), 'member') as from_handle,
    p.avatar_url as from_avatar_url,
    r.created_at
  from public.network_connection_requests r
  join public.profiles p on p.id = r.from_user_id
  where r.to_user_id = auth.uid() and r.status = 'pending'
  order by r.created_at desc;
$$;

-- ── Search people ─────────────────────────────────────────────────────
create or replace function public.network_search_people(p_query text, lim int default 24)
returns table (
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  role text,
  total_db int,
  connection_status text
)
language sql
stable
security definer
set search_path = public
as $$
  with q as (
    select lower(trim(coalesce(p_query, ''))) as term
  )
  select
    p.id as user_id,
    p.name as display_name,
    coalesce(nullif(trim(p.username), ''), 'member') as handle,
    p.avatar_url,
    p.role,
    p.total_db,
    public.network_connection_status(p.id) as connection_status
  from public.profiles p, q
  where q.term <> ''
    and p.id <> auth.uid()
    and (
      lower(p.name) like '%' || q.term || '%'
      or lower(coalesce(p.username, '')) like '%' || q.term || '%'
    )
  order by p.total_db desc nulls last, p.name
  limit greatest(1, least(lim, 50));
$$;

-- ── Suggested connections (same primary genre when possible) ──────────
create or replace function public.network_suggested_people(lim int default 6)
returns table (
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  role text,
  total_db int,
  connection_status text
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select id, primary_genre_id from public.profiles where id = auth.uid()
  )
  select
    p.id as user_id,
    p.name as display_name,
    coalesce(nullif(trim(p.username), ''), 'member') as handle,
    p.avatar_url,
    p.role,
    p.total_db,
    public.network_connection_status(p.id) as connection_status
  from public.profiles p
  cross join me
  where p.id <> me.id
    and public.network_connection_status(p.id) = 'none'
    and not public.network_are_connected(me.id, p.id)
  order by
    case when me.primary_genre_id is not null and p.primary_genre_id = me.primary_genre_id then 0 else 1 end,
    p.total_db desc nulls last
  limit greatest(1, least(lim, 20));
$$;

-- ── Mutual connections ────────────────────────────────────────────────
create or replace function public.network_mutual_connections(p_target uuid, lim int default 12)
returns table (
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  with me as (select auth.uid() as id),
  my_connections as (
    select case when c.user_a = me.id then c.user_b else c.user_a end as uid
    from public.network_connections c
    cross join me
    where me.id in (c.user_a, c.user_b)
  ),
  their_connections as (
    select case when c.user_a = p_target then c.user_b else c.user_a end as uid
    from public.network_connections c
    where p_target in (c.user_a, c.user_b)
  )
  select
    p.id as user_id,
    p.name as display_name,
    coalesce(nullif(trim(p.username), ''), 'member') as handle,
    p.avatar_url
  from my_connections mc
  join their_connections tc on tc.uid = mc.uid
  join public.profiles p on p.id = mc.uid
  where mc.uid <> (select id from me)
    and mc.uid <> p_target
  limit greatest(1, least(lim, 24));
$$;

-- ── Extend public profile ───────────────────────────────────────────────
drop function if exists public.community_profile_public(text);

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
  post_count bigint,
  follower_count bigint,
  following_count bigint,
  connection_count bigint,
  viewer_is_following boolean,
  viewer_connection_status text,
  profile_role text,
  dashboard_persona text
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
    ) as post_count,
    (
      select count(*)::bigint
      from public.community_follows cf
      where cf.following_id = t.id
    ) as follower_count,
    (
      select count(*)::bigint
      from public.community_follows cf
      where cf.follower_id = t.id
    ) as following_count,
    (
      select count(*)::bigint
      from public.network_connections c
      where t.id in (c.user_a, c.user_b)
    ) as connection_count,
    exists (
      select 1
      from public.community_follows vf
      where vf.follower_id = auth.uid() and vf.following_id = t.id
    ) as viewer_is_following,
    public.network_connection_status(t.id) as viewer_connection_status,
    t.role as profile_role,
    t.dashboard_persona::text as dashboard_persona
  from target t
  left join public.community_genres g on g.id = t.primary_genre_id;
$$;

grant execute on function public.network_send_connection_request(uuid) to authenticated;
grant execute on function public.network_respond_connection_request(uuid, boolean) to authenticated;
grant execute on function public.network_remove_connection(uuid) to authenticated;
grant execute on function public.network_pending_requests() to authenticated;
grant execute on function public.network_search_people(text, int) to authenticated;
grant execute on function public.network_suggested_people(int) to authenticated;
grant execute on function public.network_mutual_connections(uuid, int) to authenticated;
grant execute on function public.community_profile_public(text) to anon, authenticated;
