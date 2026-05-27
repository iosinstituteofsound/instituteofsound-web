-- Phase 8: Editorial ↔ Network bridge

alter table public.editorial_drafts
  add column if not exists linked_community_post_id uuid references public.community_posts (id) on delete set null;

create index if not exists editorial_drafts_linked_post_idx
  on public.editorial_drafts (linked_community_post_id)
  where linked_community_post_id is not null;

comment on column public.editorial_drafts.linked_community_post_id is
  'Optional community spin embedded on published editorial';

-- Top spins this week for editorial desk (by reactions)
create or replace function public.community_editor_wire_picks(lim int default 12)
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
  my_reaction text,
  reaction_score bigint
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
    (f.reactions_fire + f.reactions_headphones + f.reactions_bolt) as reaction_score
  from public.community_feed(200, 'spin', null) f
  where f.created_at >= (timezone('utc', now()) - interval '7 days')
  order by reaction_score desc, f.created_at desc
  limit greatest(lim, 1);
$$;

-- Single post for editorial embed (public visible posts only)
create or replace function public.community_feed_post_by_id(p_post_id uuid)
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
    f.id,
    f.kind,
    f.body,
    f.spotify_url,
    f.youtube_url,
    f.track_title,
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
    f.my_reaction
  from public.community_feed(500, null, null) f
  where f.id = p_post_id
  limit 1;
$$;

grant execute on function public.community_editor_wire_picks(int) to authenticated;
grant execute on function public.community_feed_post_by_id(uuid) to anon, authenticated;
