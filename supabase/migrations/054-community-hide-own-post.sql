-- Reliable soft-delete for own feed posts (bypasses subtle RLS / zero-row update issues)

create or replace function public.community_hide_own_post(p_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_updated int;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  update public.community_posts
  set status = 'hidden'
  where id = p_post_id
    and user_id = v_uid
    and status = 'visible';

  get diagnostics v_updated = row_count;
  return v_updated > 0;
end;
$$;

revoke all on function public.community_hide_own_post(uuid) from public;
grant execute on function public.community_hide_own_post(uuid) to authenticated;
