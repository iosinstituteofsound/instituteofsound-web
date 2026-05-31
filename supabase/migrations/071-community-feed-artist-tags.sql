-- Expose post artist tags on community feed queries.

create or replace function public.community_post_artist_tags_json(p_post_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id', ap.id,
          'slug', ap.slug,
          'display_name', ap.display_name,
          'avatar_url', ap.avatar_url
        )
        order by t.sort_order
      )
      from public.community_post_artist_tags t
      join public.artist_profiles ap on ap.id = t.artist_profile_id
      where t.post_id = p_post_id
        and coalesce(ap.published, false) = true
    ),
    '[]'::jsonb
  );
$$;

grant execute on function public.community_post_artist_tags_json(uuid) to anon, authenticated;

drop function if exists public.community_feed(int, text, text, boolean, timestamptz, uuid);

create or replace function public.community_feed(
  lim int default 30,
  p_kind text default null,
  p_genre_slug text default null,
  p_following_only boolean default false,
  p_cursor_created_at timestamptz default null,
  p_cursor_id uuid default null
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
  comment_count bigint,
  artist_tags jsonb
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
    coalesce(cm.comment_count, 0) as comment_count,
    public.community_post_artist_tags_json(p.id) as artist_tags
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
    and (
      p_cursor_created_at is null
      or p_cursor_id is null
      or (p.created_at, p.id) < (p_cursor_created_at, p_cursor_id)
    )
  order by p.created_at desc, p.id desc
  limit greatest(lim, 1);
$$;

grant execute on function public.community_feed(int, text, text, boolean, timestamptz, uuid) to anon, authenticated;

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
  comment_count bigint,
  artist_tags jsonb
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
    f.comment_count,
    f.artist_tags
  from public.community_feed(500, null, null, false, null, null) f
  where f.id = p_post_id
  limit 1;
$$;

grant execute on function public.community_feed_post_by_id(uuid) to anon, authenticated;

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
  comment_count bigint,
  artist_tags jsonb
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
    coalesce(cm.comment_count, 0) as comment_count,
    public.community_post_artist_tags_json(p.id) as artist_tags
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

grant execute on function public.community_posts_by_handle(text, int) to anon, authenticated;
