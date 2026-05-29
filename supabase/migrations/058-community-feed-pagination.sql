-- Cursor pagination for community_feed (load more).

drop function if exists public.community_feed(int, text, text, boolean);
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
    and (
      p_cursor_created_at is null
      or p_cursor_id is null
      or (p.created_at, p.id) < (p_cursor_created_at, p_cursor_id)
    )
  order by p.created_at desc, p.id desc
  limit greatest(lim, 1);
$$;

grant execute on function public.community_feed(int, text, text, boolean, timestamptz, uuid) to anon, authenticated;
