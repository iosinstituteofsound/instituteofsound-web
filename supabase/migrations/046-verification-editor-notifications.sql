-- Notify super editors when a member submits a role verification request.

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
    'role_verification'
  ));

create or replace function public.role_verification_role_label(p_role text)
returns text
language sql
immutable
as $$
  select case p_role
    when 'artist_manager' then 'Artist manager'
    when 'label' then 'Label'
    when 'event_promoter' then 'Event promoter'
    when 'brand' then 'Brand'
    else initcap(replace(p_role, '_', ' '))
  end;
$$;

create or replace function public.notify_super_editors_role_verification_request()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_name text;
  v_role_label text;
  v_editor_id uuid;
begin
  if NEW.status is distinct from 'pending' then
    return NEW;
  end if;

  select p.name into v_actor_name
  from public.profiles p
  where p.id = NEW.user_id;

  v_role_label := public.role_verification_role_label(NEW.role_type);

  for v_editor_id in
    select p.id from public.profiles p where p.role = 'super_editor'
  loop
    perform public.community_enqueue_notification(
      v_editor_id,
      NEW.user_id,
      'role_verification',
      'New role verification request',
      coalesce(v_actor_name, 'Member') || ' · ' || v_role_label,
      '/editor/dashboard?desk=verification',
      jsonb_build_object('request_id', NEW.id, 'role_type', NEW.role_type)
    );
  end loop;

  return NEW;
end;
$$;

drop trigger if exists role_verification_notify_super_editors on public.role_verification_requests;

create trigger role_verification_notify_super_editors
  after insert on public.role_verification_requests
  for each row
  execute function public.notify_super_editors_role_verification_request();
