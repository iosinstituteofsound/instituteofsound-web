-- Phase G: supporter recognition (thanks / shout-outs) + relationship milestones.
-- No currency — artist acknowledgment + earned milestone labels only.

-- ── Notification kind ───────────────────────────────────────────────────
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
    'role_verification',
    'playlist_curator_application',
    'dm_message',
    'post_comment',
    'artist_page_recovery',
    'connection_request',
    'connection_accepted',
    'fandom_recognition'
  ));

-- ── Artist → supporter recognition ledger ───────────────────────────────
create table if not exists public.artist_fandom_recognitions (
  id uuid primary key default gen_random_uuid(),
  artist_profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  supporter_user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null default 'thanks' check (kind in ('thanks', 'shoutout')),
  message text not null,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  constraint artist_fandom_recognitions_message_len
    check (char_length(trim(message)) between 1 and 280)
);

create index if not exists artist_fandom_recognitions_artist_time_idx
  on public.artist_fandom_recognitions (artist_profile_id, created_at desc);

create index if not exists artist_fandom_recognitions_supporter_time_idx
  on public.artist_fandom_recognitions (supporter_user_id, created_at desc)
  where is_public = true;

alter table public.artist_fandom_recognitions enable row level security;

drop policy if exists "Artists read own recognitions" on public.artist_fandom_recognitions;
create policy "Artists read own recognitions"
  on public.artist_fandom_recognitions for select
  to authenticated
  using (
    exists (
      select 1 from public.artist_profiles ap
      where ap.id = artist_profile_id and ap.user_id = auth.uid()
    )
  );

drop policy if exists "Supporters read recognitions about them" on public.artist_fandom_recognitions;
create policy "Supporters read recognitions about them"
  on public.artist_fandom_recognitions for select
  to authenticated
  using (supporter_user_id = auth.uid());

drop policy if exists "Public read public recognitions" on public.artist_fandom_recognitions;
create policy "Public read public recognitions"
  on public.artist_fandom_recognitions for select
  to anon, authenticated
  using (is_public = true);

-- ── Send recognition (artist only) ──────────────────────────────────────
create or replace function public.fandom_send_recognition(
  p_supporter_user_id uuid,
  p_message text,
  p_kind text default 'thanks',
  p_is_public boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_profile_id uuid;
  v_artist_name text;
  v_artist_slug text;
  v_supporter_handle text;
  v_msg text;
  v_kind text;
  v_id uuid;
  v_recent_count int;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if p_supporter_user_id is null or p_supporter_user_id = v_user then
    raise exception 'Invalid supporter';
  end if;

  v_msg := trim(p_message);
  if char_length(v_msg) < 1 or char_length(v_msg) > 280 then
    raise exception 'Message must be 1–280 characters';
  end if;

  v_kind := coalesce(nullif(trim(p_kind), ''), 'thanks');
  if v_kind not in ('thanks', 'shoutout') then
    raise exception 'Invalid recognition kind';
  end if;

  select ap.id, ap.display_name, ap.slug
  into v_profile_id, v_artist_name, v_artist_slug
  from public.artist_profiles ap
  where ap.user_id = v_user and coalesce(ap.published, false) = true
  limit 1;

  if v_profile_id is null then
    raise exception 'Published artist profile required';
  end if;

  if not exists (
    select 1
    from public.artist_fandom_totals t
    where t.artist_profile_id = v_profile_id
      and t.supporter_user_id = p_supporter_user_id
      and t.support_score > 0
  ) then
    raise exception 'This member has no support relationship with your artist page yet';
  end if;

  select count(*)::int into v_recent_count
  from public.artist_fandom_recognitions r
  where r.artist_profile_id = v_profile_id
    and r.supporter_user_id = p_supporter_user_id
    and r.created_at >= now() - interval '7 days';

  if v_recent_count >= 3 then
    raise exception 'Recognition limit reached for this supporter (3 per 7 days)';
  end if;

  insert into public.artist_fandom_recognitions (
    artist_profile_id,
    supporter_user_id,
    kind,
    message,
    is_public
  )
  values (
    v_profile_id,
    p_supporter_user_id,
    v_kind,
    v_msg,
    coalesce(p_is_public, true)
  )
  returning id into v_id;

  select coalesce(nullif(trim(pr.username), ''), 'member')
  into v_supporter_handle
  from public.profiles pr
  where pr.id = p_supporter_user_id;

  perform public.community_enqueue_notification(
    p_supporter_user_id,
    v_user,
    'fandom_recognition',
    v_artist_name || ' recognized your support',
    v_msg,
    '/artist/' || v_artist_slug,
    jsonb_build_object(
      'artistProfileId', v_profile_id,
      'recognitionId', v_id,
      'kind', v_kind
    )
  );

  return v_id;
end;
$$;

grant execute on function public.fandom_send_recognition(uuid, text, text, boolean) to authenticated;

-- Sent recognitions (artist dashboard)
create or replace function public.fandom_artist_sent_recognitions(lim int default 20)
returns table (
  id uuid,
  supporter_user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  kind text,
  message text,
  is_public boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_profile_id uuid;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select ap.id into v_profile_id
  from public.artist_profiles ap
  where ap.user_id = v_user
  limit 1;

  if v_profile_id is null then
    raise exception 'Artist profile required';
  end if;

  return query
  select
    r.id,
    r.supporter_user_id,
    pr.name as display_name,
    coalesce(nullif(trim(pr.username), ''), 'member') as handle,
    pr.avatar_url,
    r.kind,
    r.message,
    r.is_public,
    r.created_at
  from public.artist_fandom_recognitions r
  join public.profiles pr on pr.id = r.supporter_user_id
  where r.artist_profile_id = v_profile_id
  order by r.created_at desc
  limit greatest(lim, 1);
end;
$$;

grant execute on function public.fandom_artist_sent_recognitions(int) to authenticated;

-- Public recognitions on a member profile
create or replace function public.fandom_public_recognitions_for_user(
  p_user_id uuid,
  lim int default 12
)
returns table (
  id uuid,
  artist_profile_id uuid,
  artist_slug text,
  artist_display_name text,
  artist_avatar_url text,
  kind text,
  message text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.artist_profile_id,
    ap.slug as artist_slug,
    ap.display_name as artist_display_name,
    ap.avatar_url as artist_avatar_url,
    r.kind,
    r.message,
    r.created_at
  from public.artist_fandom_recognitions r
  join public.artist_profiles ap on ap.id = r.artist_profile_id
  where r.supporter_user_id = p_user_id
    and r.is_public = true
    and coalesce(ap.published, false) = true
  order by r.created_at desc
  limit greatest(lim, 1);
$$;

grant execute on function public.fandom_public_recognitions_for_user(uuid, int) to anon, authenticated;

-- Relationship milestones (computed, not currency)
create or replace function public.fandom_supporter_milestones(
  p_artist_profile_id uuid,
  p_supporter_user_id uuid default null
)
returns table (
  milestone_slug text,
  label text,
  earned_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_supporter uuid := coalesce(p_supporter_user_id, auth.uid());
  v_artist_owner uuid;
  v_totals record;
begin
  if v_user is null or v_supporter is null then
    raise exception 'Not authenticated';
  end if;

  select ap.user_id into v_artist_owner
  from public.artist_profiles ap
  where ap.id = p_artist_profile_id;

  if v_artist_owner is null then
    raise exception 'Artist not found';
  end if;

  if v_user <> v_artist_owner and v_user <> v_supporter then
    raise exception 'Not allowed';
  end if;

  select
    t.first_support_at,
    t.last_support_at,
    t.spins,
    t.drops,
    t.shares,
    t.reviews,
    t.editorials
  into v_totals
  from public.artist_fandom_totals t
  where t.artist_profile_id = p_artist_profile_id
    and t.supporter_user_id = v_supporter;

  if v_totals.first_support_at is null then
    return;
  end if;

  return query
  with first_events as (
    select e.action_type, min(e.created_at) as earned_at
    from public.artist_fandom_events e
    where e.artist_profile_id = p_artist_profile_id
      and e.supporter_user_id = v_supporter
    group by e.action_type
  ),
  rows as (
    select
      'first_support'::text as milestone_slug,
      'Started supporting'::text as label,
      v_totals.first_support_at as earned_at
    union all
    select 'tagged_spin', 'First tagged spin', fe.earned_at
    from first_events fe where fe.action_type = 'tagged_spin'
    union all
    select 'tagged_drop', 'First tagged drop', fe.earned_at
    from first_events fe where fe.action_type = 'tagged_drop'
    union all
    select 'shared', 'Shared on the wire', fe.earned_at
    from first_events fe where fe.action_type = 'share'
    union all
    select 'review', 'Wrote a review', fe.earned_at
    from first_events fe where fe.action_type = 'review'
    union all
    select 'editorial', 'Editorial feature', fe.earned_at
    from first_events fe where fe.action_type = 'editorial'
    union all
    select
      'loyal_90d',
      '90-day supporter',
      v_totals.first_support_at
    where v_totals.first_support_at <= now() - interval '90 days'
      and v_totals.last_support_at >= now() - interval '90 days'
  )
  select r.milestone_slug, r.label, r.earned_at
  from rows r
  where r.earned_at is not null
  order by r.earned_at asc;
end;
$$;

grant execute on function public.fandom_supporter_milestones(uuid, uuid) to authenticated;
