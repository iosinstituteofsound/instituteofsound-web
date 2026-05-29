-- External link previews on drop / text posts.

alter table public.community_posts
  add column if not exists link_url text,
  add column if not exists link_title text,
  add column if not exists link_description text,
  add column if not exists link_image_url text;

alter table public.community_posts
  drop constraint if exists community_posts_drop_requires_content;

alter table public.community_posts
  add constraint community_posts_drop_requires_content
  check (
    kind <> 'drop'
    or char_length(trim(coalesce(body, ''))) between 1 and 280
    or image_url is not null
    or link_url is not null
  );

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
  link_url text,
  link_title text,
  link_description text,
  link_image_url text,
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
    p.link_url,
    p.link_title,
    p.link_description,
    p.link_image_url,
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
  link_url text,
  link_title text,
  link_description text,
  link_image_url text,
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
    p.link_url,
    p.link_title,
    p.link_description,
    p.link_image_url,
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
  link_url text,
  link_title text,
  link_description text,
  link_image_url text,
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
    f.link_url,
    f.link_title,
    f.link_description,
    f.link_image_url,
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

grant execute on function public.community_feed(int, text, text, boolean) to anon, authenticated;
grant execute on function public.community_posts_by_handle(text, int) to anon, authenticated;
grant execute on function public.community_feed_post_by_id(uuid) to anon, authenticated;
