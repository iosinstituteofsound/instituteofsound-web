-- Authors can edit their own visible posts (no time limit).

create or replace function public.community_update_own_drop(p_post_id uuid, p_body text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_text text;
  v_image text;
  v_link text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select image_url, link_url into v_image, v_link
  from public.community_posts
  where id = p_post_id and user_id = v_user and kind = 'drop' and status = 'visible';

  if not found then
    raise exception 'Post not found';
  end if;

  v_text := trim(coalesce(p_body, ''));

  if char_length(v_text) < 1
     and v_image is null
     and v_link is null then
    raise exception 'Add some text before saving.';
  end if;

  if char_length(v_text) > 280 then
    raise exception 'Max 280 characters.';
  end if;

  update public.community_posts
  set body = nullif(v_text, '')
  where id = p_post_id and user_id = v_user;
end;
$$;

create or replace function public.community_update_own_spin(
  p_post_id uuid,
  p_body text,
  p_track_title text,
  p_spotify_url text,
  p_youtube_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_caption text;
  v_title text;
  v_spotify text;
  v_youtube text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.community_posts
    where id = p_post_id and user_id = v_user and kind = 'spin' and status = 'visible'
  ) then
    raise exception 'Post not found';
  end if;

  v_caption := nullif(trim(coalesce(p_body, '')), '');
  v_title := nullif(trim(coalesce(p_track_title, '')), '');
  v_spotify := nullif(trim(coalesce(p_spotify_url, '')), '');
  v_youtube := nullif(trim(coalesce(p_youtube_url, '')), '');

  if v_spotify is null and v_youtube is null then
    raise exception 'Add a Spotify or YouTube link.';
  end if;

  if v_caption is not null and char_length(v_caption) > 280 then
    raise exception 'Caption max 280 characters.';
  end if;

  if v_title is not null and char_length(v_title) > 120 then
    raise exception 'Track title max 120 characters.';
  end if;

  update public.community_posts
  set
    body = v_caption,
    track_title = v_title,
    spotify_url = v_spotify,
    youtube_url = v_youtube
  where id = p_post_id and user_id = v_user;
end;
$$;

revoke all on function public.community_update_own_drop(uuid, text) from public;
revoke all on function public.community_update_own_spin(uuid, text, text, text, text) from public;
grant execute on function public.community_update_own_drop(uuid, text) to authenticated;
grant execute on function public.community_update_own_spin(uuid, text, text, text, text) to authenticated;
