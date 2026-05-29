-- Threaded comment replies (one level+ nested via parent_id)

alter table public.community_post_comments
  add column if not exists parent_id uuid references public.community_post_comments (id) on delete cascade;

create index if not exists community_post_comments_parent_idx
  on public.community_post_comments (parent_id, created_at asc)
  where parent_id is not null;

-- ── List comments (flat, includes parent_id) ───────────────────────────
drop function if exists public.community_post_comments_list(uuid, int);

create or replace function public.community_post_comments_list(p_post_id uuid, lim int default 100)
returns table (
  id uuid,
  post_id uuid,
  user_id uuid,
  parent_id uuid,
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
    c.parent_id,
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

-- ── Add comment or reply + notify ──────────────────────────────────────
drop function if exists public.community_post_comments_add(uuid, text);
drop function if exists public.community_post_comments_add(uuid, text, uuid);

create or replace function public.community_post_comments_add(
  p_post_id uuid,
  p_body text,
  p_parent_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_owner uuid;
  v_parent_author uuid;
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

  if p_parent_id is not null then
    select user_id into v_parent_author
    from public.community_post_comments
    where id = p_parent_id and post_id = p_post_id;

    if v_parent_author is null then
      raise exception 'Parent comment not found';
    end if;
  end if;

  insert into public.community_post_comments (post_id, user_id, body, parent_id)
  values (p_post_id, v_user, v_text, p_parent_id)
  returning id into v_comment_id;

  select coalesce(nullif(trim(pr.name), ''), 'Someone'),
    coalesce(
      nullif(trim(pr.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    )
  into v_actor_name, v_actor_handle
  from public.profiles pr
  where pr.id = v_user;

  if p_parent_id is not null and v_parent_author is not null and v_parent_author <> v_user then
    perform public.community_enqueue_notification(
      v_parent_author,
      v_user,
      'post_comment',
      coalesce(v_actor_name, 'Someone') || ' replied to your comment',
      left(v_text, 120),
      '/feed/' || p_post_id::text,
      jsonb_build_object('post_id', p_post_id, 'comment_id', v_comment_id, 'parent_id', p_parent_id)
    );
  elsif p_parent_id is null and v_owner <> v_user then
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

grant execute on function public.community_post_comments_list(uuid, int) to anon, authenticated;
grant execute on function public.community_post_comments_add(uuid, text, uuid) to authenticated;
