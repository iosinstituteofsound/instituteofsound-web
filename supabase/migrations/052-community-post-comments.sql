-- Full social feed: comments, counts, notifications, shareable post URLs.

-- ── Comments table ─────────────────────────────────────────────────────
create table if not exists public.community_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint community_post_comments_body_len
    check (char_length(trim(body)) between 1 and 500)
);

create index if not exists community_post_comments_post_idx
  on public.community_post_comments (post_id, created_at asc);

alter table public.community_post_comments enable row level security;

drop policy if exists "Public read post comments" on public.community_post_comments;
create policy "Public read post comments"
  on public.community_post_comments for select
  to anon, authenticated
  using (true);

drop policy if exists "Users insert own comments" on public.community_post_comments;
create policy "Users insert own comments"
  on public.community_post_comments for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users delete own comments" on public.community_post_comments;
create policy "Users delete own comments"
  on public.community_post_comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- ── Notification kind ──────────────────────────────────────────────────
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
    'dm_message',
    'post_comment'
  ));

-- Allow self-notify skip for comments (handled in RPC)
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
  if p_actor_id is not null and p_actor_id = p_user_id
     and p_kind in ('follow', 'reaction', 'post_comment') then
    return;
  end if;

  insert into public.community_notifications (user_id, actor_id, kind, title, body, href, meta)
  values (p_user_id, p_actor_id, p_kind, p_title, p_body, p_href, coalesce(p_meta, '{}'::jsonb));
end;
$$;

-- ── List comments for a post ───────────────────────────────────────────
create or replace function public.community_post_comments_list(p_post_id uuid, lim int default 100)
returns table (
  id uuid,
  post_id uuid,
  user_id uuid,
  body text,
  created_at timestamptz,
  display_name text,
  handle text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id,
    c.post_id,
    c.user_id,
    c.body,
    c.created_at,
    coalesce(nullif(trim(pr.name), ''), 'Member') as display_name,
    coalesce(
      nullif(trim(pr.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    ) as handle,
    pr.avatar_url
  from public.community_post_comments c
  join public.profiles pr on pr.id = c.user_id
  join public.community_posts p on p.id = c.post_id and p.status = 'visible'
  where c.post_id = p_post_id
  order by c.created_at asc
  limit greatest(lim, 1);
$$;

-- ── Add comment + notify post author ─────────────────────────────────────
create or replace function public.community_post_comments_add(p_post_id uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_owner uuid;
  v_comment_id uuid;
  v_text text;
  v_actor_name text;
  v_actor_handle text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  v_text := trim(coalesce(p_body, ''));
  if char_length(v_text) < 1 or char_length(v_text) > 500 then
    raise exception 'Comment must be 1–500 characters.';
  end if;

  select user_id into v_owner
  from public.community_posts
  where id = p_post_id and status = 'visible';

  if v_owner is null then
    raise exception 'Post not found';
  end if;

  insert into public.community_post_comments (post_id, user_id, body)
  values (p_post_id, v_user, v_text)
  returning id into v_comment_id;

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
      'post_comment',
      coalesce(v_actor_name, 'Someone') || ' commented on your post',
      left(v_text, 120),
      '/feed/' || p_post_id::text,
      jsonb_build_object('post_id', p_post_id, 'comment_id', v_comment_id)
    );
  end if;

  return v_comment_id;
end;
$$;

-- ── Delete own comment ─────────────────────────────────────────────────
create or replace function public.community_post_comments_delete(p_comment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.community_post_comments
  where id = p_comment_id and user_id = v_user;

  if not found then
    raise exception 'Comment not found';
  end if;
end;
$$;

-- ── Reaction alerts link to post detail ────────────────────────────────
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
      '/feed/' || p_post_id::text
    );
  end if;

  return p_reaction;
end;
$$;

-- ── Feed with comment_count ────────────────────────────────────────────
drop function if exists public.community_feed(int, text, text, boolean);

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
  image_url text,
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
  comment_count bigint
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
    p.image_url,
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
    mine.reaction as my_reaction,
    coalesce(cm.comment_count, 0) as comment_count
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
  left join lateral (
    select count(*)::bigint as comment_count
    from public.community_post_comments c
    where c.post_id = p.id
  ) cm on true
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

-- ── Profile posts with comment_count ───────────────────────────────────
drop function if exists public.community_posts_by_handle(text, int);

create or replace function public.community_posts_by_handle(p_handle text, lim int default 30)
returns table (
  id uuid,
  kind text,
  body text,
  spotify_url text,
  youtube_url text,
  track_title text,
  image_url text,
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
  comment_count bigint
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
    p.image_url,
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
    mine.reaction as my_reaction,
    coalesce(cm.comment_count, 0) as comment_count
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
  left join lateral (
    select count(*)::bigint as comment_count
    from public.community_post_comments c
    where c.post_id = p.id
  ) cm on true
  left join public.community_post_reactions mine
    on mine.post_id = p.id and mine.user_id = auth.uid()
  where p.status = 'visible'
  order by p.created_at desc
  limit greatest(lim, 1);
$$;

-- ── Single post (shareable URL) with image + comment_count ─────────────
drop function if exists public.community_feed_post_by_id(uuid);

create or replace function public.community_feed_post_by_id(p_post_id uuid)
returns table (
  id uuid,
  kind text,
  body text,
  spotify_url text,
  youtube_url text,
  track_title text,
  image_url text,
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
  comment_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    f.id,
    f.kind,
    f.body,
    f.spotify_url,
    f.youtube_url,
    f.track_title,
    f.image_url,
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
    f.comment_count
  from public.community_feed(500, null, null, false) f
  where f.id = p_post_id
  limit 1;
$$;

grant execute on function public.community_post_comments_list(uuid, int) to anon, authenticated;
grant execute on function public.community_post_comments_add(uuid, text) to authenticated;
grant execute on function public.community_post_comments_delete(uuid) to authenticated;
grant execute on function public.community_feed(int, text, text, boolean) to anon, authenticated;
grant execute on function public.community_posts_by_handle(text, int) to anon, authenticated;
grant execute on function public.community_feed_post_by_id(uuid) to anon, authenticated;
