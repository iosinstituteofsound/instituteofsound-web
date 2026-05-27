-- Phase 11: Follow graph, following feed, in-app notifications

-- ── Follows ─────────────────────────────────────────────────────────
create table if not exists public.community_follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint community_follows_not_self check (follower_id <> following_id)
);

create index if not exists community_follows_following_idx
  on public.community_follows (following_id, created_at desc);

create index if not exists community_follows_follower_idx
  on public.community_follows (follower_id, created_at desc);

alter table public.community_follows enable row level security;

drop policy if exists "Public read follows" on public.community_follows;
create policy "Public read follows"
  on public.community_follows for select
  to anon, authenticated
  using (true);

drop policy if exists "Users manage own follows" on public.community_follows;
create policy "Users manage own follows"
  on public.community_follows for all
  to authenticated
  using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

-- ── Notifications ─────────────────────────────────────────────────────
create table if not exists public.community_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  kind text not null check (kind in ('follow', 'reaction', 'rank_up', 'editorial_publish')),
  title text not null,
  body text,
  href text,
  meta jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists community_notifications_user_idx
  on public.community_notifications (user_id, created_at desc);

create index if not exists community_notifications_unread_idx
  on public.community_notifications (user_id)
  where read_at is null;

alter table public.community_notifications enable row level security;

drop policy if exists "Users read own notifications" on public.community_notifications;
create policy "Users read own notifications"
  on public.community_notifications for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users mark own notifications read" on public.community_notifications;
create policy "Users mark own notifications read"
  on public.community_notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Internal enqueue (security definer)
create or replace function public.community_enqueue_notification(
  p_user_id uuid,
  p_actor_id uuid,
  p_kind text,
  p_title text,
  p_body text default null,
  p_href text default null,
  p_meta jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user_id is null or p_kind is null or p_title is null then
    return;
  end if;
  if p_actor_id is not null and p_actor_id = p_user_id and p_kind in ('follow', 'reaction') then
    return;
  end if;

  insert into public.community_notifications (user_id, actor_id, kind, title, body, href, meta)
  values (p_user_id, p_actor_id, p_kind, p_title, p_body, p_href, coalesce(p_meta, '{}'::jsonb));
end;
$$;

create or replace function public.community_toggle_follow(p_target_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_following boolean;
  v_actor_name text;
  v_actor_handle text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;
  if p_target_user_id is null or p_target_user_id = v_user then
    raise exception 'Invalid target';
  end if;
  if not exists (select 1 from public.profiles where id = p_target_user_id) then
    raise exception 'User not found';
  end if;

  if exists (
    select 1 from public.community_follows
    where follower_id = v_user and following_id = p_target_user_id
  ) then
    delete from public.community_follows
    where follower_id = v_user and following_id = p_target_user_id;
    return false;
  end if;

  insert into public.community_follows (follower_id, following_id)
  values (v_user, p_target_user_id);

  select pr.name,
    coalesce(
      nullif(trim(pr.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    )
  into v_actor_name, v_actor_handle
  from public.profiles pr
  where pr.id = v_user;

  perform public.community_enqueue_notification(
    p_target_user_id,
    v_user,
    'follow',
    coalesce(v_actor_name, 'Someone') || ' followed you',
    '@' || v_actor_handle || ' is on your wire',
    '/network/' || v_actor_handle
  );

  return true;
end;
$$;

-- Profile with follow stats + viewer state
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
  viewer_is_following boolean
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
    exists (
      select 1
      from public.community_follows vf
      where vf.follower_id = auth.uid() and vf.following_id = t.id
    ) as viewer_is_following
  from target t
  left join public.community_genres g on g.id = t.primary_genre_id;
$$;

-- Feed: optional following-only (users you follow + your crew mates + your own posts)
drop function if exists public.community_feed(int, text, text);

create or replace function public.community_feed(
  lim int default 30,
  p_kind text default null,
  p_genre_slug text default null,
  p_following_only boolean default false
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
    and (
      not coalesce(p_following_only, false)
      or (
        auth.uid() is not null
        and (
          p.user_id = auth.uid()
          or exists (
            select 1
            from public.community_follows f
            where f.follower_id = auth.uid() and f.following_id = p.user_id
          )
          or exists (
            select 1
            from public.community_crew_members cm_me
            join public.community_crew_members cm_them on cm_them.crew_id = cm_me.crew_id
            where cm_me.user_id = auth.uid() and cm_them.user_id = p.user_id
          )
        )
      )
    )
  order by p.created_at desc
  limit greatest(lim, 1);
$$;

-- Reaction toggle + notify post author
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
  v_owner uuid;
  v_actor_name text;
  v_actor_handle text;
  v_post_kind text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if p_reaction not in ('fire', 'headphones', 'bolt') then
    raise exception 'Invalid reaction';
  end if;

  select user_id, kind into v_owner, v_post_kind
  from public.community_posts
  where id = p_post_id and status = 'visible';

  if v_owner is null then
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

  if v_owner <> v_user then
    select pr.name,
      coalesce(
        nullif(trim(pr.username), ''),
        nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
        'member'
      )
    into v_actor_name, v_actor_handle
    from public.profiles pr
    where pr.id = v_user;

    perform public.community_enqueue_notification(
      v_owner,
      v_user,
      'reaction',
      coalesce(v_actor_name, 'Someone') || ' reacted to your ' || v_post_kind,
      p_reaction || ' on your transmission',
      '/community#feed'
    );
  end if;

  return p_reaction;
end;
$$;

-- Rank-up notification on dB award
create or replace function public.community_notify_rank_on_db()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_old_rank text;
  v_new_rank text;
begin
  select total_db into v_total from public.profiles where id = new.user_id;
  if v_total is null then
    return new;
  end if;

  v_new_rank := public.community_rank_for_db(v_total);
  v_old_rank := public.community_rank_for_db(greatest(v_total - new.amount, 0));

  if v_old_rank is distinct from v_new_rank then
    perform public.community_enqueue_notification(
      new.user_id,
      null,
      'rank_up',
      'Rank up — you are now ' || initcap(replace(v_new_rank, '_', ' ')),
      'You crossed into ' || v_new_rank || ' on the network',
      '/community'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists community_db_events_rank_notify on public.community_db_events;
create trigger community_db_events_rank_notify
  after insert on public.community_db_events
  for each row
  execute function public.community_notify_rank_on_db();

-- Notification inbox RPCs
create or replace function public.community_notifications_list(lim int default 40)
returns table (
  id uuid,
  kind text,
  title text,
  body text,
  href text,
  actor_id uuid,
  actor_name text,
  actor_handle text,
  actor_avatar_url text,
  read_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    n.id,
    n.kind,
    n.title,
    n.body,
    n.href,
    n.actor_id,
    a.name as actor_name,
    coalesce(
      nullif(trim(a.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(a.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    ) as actor_handle,
    a.avatar_url as actor_avatar_url,
    n.read_at,
    n.created_at
  from public.community_notifications n
  left join public.profiles a on a.id = n.actor_id
  where n.user_id = auth.uid()
  order by n.created_at desc
  limit greatest(lim, 1);
$$;

create or replace function public.community_notifications_unread_count()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.community_notifications n
  where n.user_id = auth.uid() and n.read_at is null;
$$;

create or replace function public.community_notifications_mark_read(p_ids uuid[] default null)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_ids is null or cardinality(p_ids) = 0 then
    update public.community_notifications
    set read_at = timezone('utc', now())
    where user_id = auth.uid() and read_at is null;
  else
    update public.community_notifications
    set read_at = timezone('utc', now())
    where user_id = auth.uid() and id = any(p_ids) and read_at is null;
  end if;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

grant execute on function public.community_toggle_follow(uuid) to authenticated;
grant execute on function public.community_profile_public(text) to anon, authenticated;
grant execute on function public.community_feed(int, text, text, boolean) to anon, authenticated;
grant execute on function public.community_notifications_list(int) to authenticated;
grant execute on function public.community_notifications_unread_count() to authenticated;
grant execute on function public.community_notifications_mark_read(uuid[]) to authenticated;
