-- Phase 2: Network feed — Spin (music links) + Drop (short transmissions)

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('spin', 'drop')),
  body text,
  spotify_url text,
  youtube_url text,
  track_title text,
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now(),
  constraint community_posts_spin_requires_link check (
    kind <> 'spin'
    or (
      coalesce(length(trim(spotify_url)), 0) > 0
      or coalesce(length(trim(youtube_url)), 0) > 0
    )
  ),
  constraint community_posts_drop_requires_body check (
    kind <> 'drop'
    or coalesce(length(trim(body)), 0) between 1 and 280
  ),
  constraint community_posts_drop_no_links check (
    kind <> 'drop'
    or (spotify_url is null and youtube_url is null)
  ),
  constraint community_posts_body_len check (
    body is null or char_length(body) <= 280
  )
);

create index if not exists community_posts_feed_idx
  on public.community_posts (created_at desc)
  where status = 'visible';

create index if not exists community_posts_user_idx
  on public.community_posts (user_id, created_at desc);

alter table public.community_posts enable row level security;

drop policy if exists "Public read visible community posts" on public.community_posts;
create policy "Public read visible community posts"
  on public.community_posts for select
  to anon, authenticated
  using (status = 'visible');

drop policy if exists "Users insert own community posts" on public.community_posts;
create policy "Users insert own community posts"
  on public.community_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users hide own community posts" on public.community_posts;
create policy "Users hide own community posts"
  on public.community_posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and status in ('visible', 'hidden'));

-- Feed with author context (no direct profile scrape)
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
  primary_genre_slug text
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
    g.slug as primary_genre_slug
  from public.community_posts p
  join public.profiles pr on pr.id = p.user_id
  left join public.community_genres g on g.id = pr.primary_genre_id
  where p.status = 'visible'
  order by p.created_at desc
  limit greatest(lim, 1);
$$;

grant execute on function public.community_feed(int) to anon, authenticated;
