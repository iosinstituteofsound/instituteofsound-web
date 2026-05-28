-- On approve/reject: set member dashboard_persona + notify the applicant.

create or replace function public.notify_member_verification_decision(
  p_user_id uuid,
  p_request_id uuid,
  p_role_type text,
  p_decision text,
  p_review_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role_label text;
  v_title text;
  v_body text;
begin
  if p_user_id is null or p_request_id is null then
    return;
  end if;

  v_role_label := public.role_verification_role_label(p_role_type);

  if p_decision = 'approved' then
    v_title := 'Role verification approved';
    v_body := 'Your ' || v_role_label || ' workspace is now active on your member desk.';
  elsif p_decision = 'rejected' then
    v_title := 'Role verification not approved';
    v_body := coalesce(
      nullif(trim(p_review_notes), ''),
      'Your ' || v_role_label || ' proofs need more detail. You can resubmit from your dashboard.'
    );
  else
    return;
  end if;

  if exists (
    select 1
    from public.community_notifications n
    where n.user_id = p_user_id
      and n.kind = 'role_verification'
      and coalesce(n.meta->>'request_id', '') = p_request_id::text
      and coalesce(n.meta->>'decision', '') = p_decision
  ) then
    return;
  end if;

  perform public.community_enqueue_notification(
    p_user_id,
    null,
    'role_verification',
    v_title,
    v_body,
    '/member/dashboard',
    jsonb_build_object(
      'request_id', p_request_id,
      'role_type', p_role_type,
      'decision', p_decision
    )
  );
end;
$$;

create or replace function public.apply_role_verification_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.status = 'pending' and NEW.status = 'approved' then
    update public.profiles
    set dashboard_persona = NEW.role_type::text
    where id = NEW.user_id;

    perform public.notify_member_verification_decision(
      NEW.user_id,
      NEW.id,
      NEW.role_type,
      'approved',
      NEW.review_notes
    );
  elsif OLD.status = 'pending' and NEW.status = 'rejected' then
    perform public.notify_member_verification_decision(
      NEW.user_id,
      NEW.id,
      NEW.role_type,
      'rejected',
      NEW.review_notes
    );
  end if;

  return NEW;
end;
$$;

drop trigger if exists role_verification_apply_decision on public.role_verification_requests;

create trigger role_verification_apply_decision
  after update on public.role_verification_requests
  for each row
  when (OLD.status is distinct from NEW.status)
  execute function public.apply_role_verification_decision();

-- Backfill: already-approved requests (e.g. Motion Byte brand) before this migration.
update public.profiles p
set dashboard_persona = r.role_type
from public.role_verification_requests r
where r.user_id = p.id
  and r.status = 'approved'
  and (p.dashboard_persona is null or p.dashboard_persona is distinct from r.role_type);

do $$
declare
  v_req record;
begin
  for v_req in
    select id, user_id, role_type, review_notes
    from public.role_verification_requests
    where status = 'approved'
  loop
    perform public.notify_member_verification_decision(
      v_req.user_id,
      v_req.id,
      v_req.role_type,
      'approved',
      v_req.review_notes
    );
  end loop;
end;
$$;

grant execute on function public.notify_member_verification_decision(uuid, uuid, text, text, text) to authenticated;

-- Member bell: backfill decision alerts for the signed-in user (e.g. approved before trigger existed).
create or replace function public.sync_my_verification_notifications()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req record;
begin
  if auth.uid() is null then
    return;
  end if;

  for v_req in
    select id, role_type, status, review_notes
    from public.role_verification_requests
    where user_id = auth.uid()
      and status in ('approved', 'rejected')
  loop
    perform public.notify_member_verification_decision(
      auth.uid(),
      v_req.id,
      v_req.role_type,
      v_req.status,
      v_req.review_notes
    );
  end loop;
end;
$$;

grant execute on function public.sync_my_verification_notifications() to authenticated;
