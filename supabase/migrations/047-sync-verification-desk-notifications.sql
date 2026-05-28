-- Backfill desk notifications for pending verification requests (e.g. submitted before trigger existed).

create or replace function public.sync_verification_desk_notifications()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req record;
  v_editor_id uuid;
  v_actor_name text;
  v_role_label text;
  v_created int := 0;
begin
  if auth.uid() is null or not public.is_super_editor() then
    return 0;
  end if;

  for v_req in
    select r.*
    from public.role_verification_requests r
    where r.status = 'pending'
    order by r.created_at desc
  loop
    select p.name into v_actor_name
    from public.profiles p
    where p.id = v_req.user_id;

    v_role_label := public.role_verification_role_label(v_req.role_type);

    for v_editor_id in
      select p.id from public.profiles p where p.role = 'super_editor'
    loop
      if exists (
        select 1
        from public.community_notifications n
        where n.user_id = v_editor_id
          and n.kind = 'role_verification'
          and coalesce(n.meta->>'request_id', '') = v_req.id::text
      ) then
        continue;
      end if;

      perform public.community_enqueue_notification(
        v_editor_id,
        v_req.user_id,
        'role_verification',
        'New role verification request',
        coalesce(v_actor_name, 'Member') || ' · ' || v_role_label,
        '/editor/dashboard?desk=verification',
        jsonb_build_object('request_id', v_req.id, 'role_type', v_req.role_type)
      );
      v_created := v_created + 1;
    end loop;
  end loop;

  return v_created;
end;
$$;

grant execute on function public.sync_verification_desk_notifications() to authenticated;
