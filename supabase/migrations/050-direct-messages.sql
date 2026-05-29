-- Direct messages (Instagram-style) between any two network users.
-- Thread is a canonical (user_low, user_high) pair. New conversations from a
-- non-followed user start as a "request" until the recipient accepts.

-- ── Tables ─────────────────────────────────────────────────────────────
create table if not exists public.dm_threads (
  id uuid primary key default gen_random_uuid(),
  user_low uuid not null references public.profiles (id) on delete cascade,
  user_high uuid not null references public.profiles (id) on delete cascade,
  requested_by uuid references public.profiles (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  constraint dm_threads_ordered check (user_low < user_high),
  unique (user_low, user_high)
);

create index if not exists dm_threads_low_idx on public.dm_threads (user_low, last_message_at desc);
create index if not exists dm_threads_high_idx on public.dm_threads (user_high, last_message_at desc);

create table if not exists public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.dm_threads (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists dm_messages_thread_idx on public.dm_messages (thread_id, created_at);
create index if not exists dm_messages_unread_idx on public.dm_messages (thread_id, sender_id) where read_at is null;

alter table public.dm_threads enable row level security;
alter table public.dm_messages enable row level security;

-- Participants can read their threads / messages; all writes go through RPCs.
drop policy if exists "Participants read threads" on public.dm_threads;
create policy "Participants read threads"
  on public.dm_threads for select
  to authenticated
  using (auth.uid() = user_low or auth.uid() = user_high);

drop policy if exists "Participants read messages" on public.dm_messages;
create policy "Participants read messages"
  on public.dm_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.dm_threads t
      where t.id = dm_messages.thread_id
        and (auth.uid() = t.user_low or auth.uid() = t.user_high)
    )
  );

-- ── Notification kind ──────────────────────────────────────────────────
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
    'dm_message'
  ));

-- ── Helpers ────────────────────────────────────────────────────────────
create or replace function public.dm_handle_for(p_user uuid)
returns text
language sql
stable
set search_path = public
as $$
  select coalesce(
    nullif(trim(pr.username), ''),
    nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
    'member'
  )
  from public.profiles pr
  where pr.id = p_user;
$$;

-- ── Get or create a thread with another user ───────────────────────────
create or replace function public.dm_get_or_create_thread(p_other uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_low uuid;
  v_high uuid;
  v_thread uuid;
  v_status text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;
  if p_other is null or p_other = v_user then
    raise exception 'Invalid recipient';
  end if;
  if not exists (select 1 from public.profiles where id = p_other) then
    raise exception 'User not found';
  end if;

  v_low := least(v_user, p_other);
  v_high := greatest(v_user, p_other);

  select id into v_thread
  from public.dm_threads
  where user_low = v_low and user_high = v_high;

  if v_thread is not null then
    return v_thread;
  end if;

  -- If the recipient already follows the sender, skip the request gate.
  if exists (
    select 1 from public.community_follows
    where follower_id = p_other and following_id = v_user
  ) then
    v_status := 'accepted';
  else
    v_status := 'pending';
  end if;

  insert into public.dm_threads (user_low, user_high, requested_by, status)
  values (v_low, v_high, v_user, v_status)
  returning id into v_thread;

  return v_thread;
end;
$$;

-- ── Send a message ─────────────────────────────────────────────────────
create or replace function public.dm_send_message(p_thread_id uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_thread public.dm_threads%rowtype;
  v_recipient uuid;
  v_message uuid;
  v_requester_msg_count int;
  v_actor_name text;
  v_actor_handle text;
  v_had_unread boolean;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;
  if p_body is null or char_length(trim(p_body)) = 0 then
    raise exception 'Empty message';
  end if;

  select * into v_thread from public.dm_threads where id = p_thread_id;
  if v_thread.id is null then
    raise exception 'Thread not found';
  end if;
  if v_user <> v_thread.user_low and v_user <> v_thread.user_high then
    raise exception 'Not a participant';
  end if;

  v_recipient := case when v_user = v_thread.user_low then v_thread.user_high else v_thread.user_low end;

  if v_thread.status = 'declined' then
    raise exception 'Conversation unavailable';
  end if;

  -- Request gating: while pending, the requester may send only one message.
  if v_thread.status = 'pending' then
    if v_user = v_thread.requested_by then
      select count(*) into v_requester_msg_count
      from public.dm_messages
      where thread_id = p_thread_id and sender_id = v_user;
      if v_requester_msg_count >= 1 then
        raise exception 'Wait for them to accept your message request';
      end if;
    else
      -- Recipient replying accepts the request.
      update public.dm_threads set status = 'accepted' where id = p_thread_id;
      v_thread.status := 'accepted';
    end if;
  end if;

  -- Only notify on the first unread message in this thread (avoid bell spam).
  select exists (
    select 1 from public.dm_messages
    where thread_id = p_thread_id and sender_id = v_user and read_at is null
  ) into v_had_unread;

  insert into public.dm_messages (thread_id, sender_id, body)
  values (p_thread_id, v_user, trim(p_body))
  returning id into v_message;

  update public.dm_threads
  set last_message_at = timezone('utc', now())
  where id = p_thread_id;

  if not v_had_unread and v_thread.status = 'accepted' then
    select name, public.dm_handle_for(id) into v_actor_name, v_actor_handle
    from public.profiles where id = v_user;

    perform public.community_enqueue_notification(
      v_recipient,
      v_user,
      'dm_message',
      coalesce(v_actor_name, 'Someone') || ' sent you a message',
      left(trim(p_body), 80),
      '/messages?t=' || p_thread_id::text,
      jsonb_build_object('thread_id', p_thread_id)
    );
  end if;

  return v_message;
end;
$$;

-- ── Accept / decline a message request ─────────────────────────────────
create or replace function public.dm_set_thread_status(p_thread_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_thread public.dm_threads%rowtype;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;
  if p_status not in ('accepted', 'declined') then
    raise exception 'Invalid status';
  end if;

  select * into v_thread from public.dm_threads where id = p_thread_id;
  if v_thread.id is null then
    raise exception 'Thread not found';
  end if;
  if v_user <> v_thread.user_low and v_user <> v_thread.user_high then
    raise exception 'Not a participant';
  end if;
  -- Only the recipient (not the requester) can accept/decline.
  if v_user = v_thread.requested_by then
    raise exception 'Only the recipient can respond to this request';
  end if;

  update public.dm_threads set status = p_status where id = p_thread_id;
end;
$$;

-- ── Inbox: list threads with last message + unread count ───────────────
create or replace function public.dm_list_threads()
returns table (
  thread_id uuid,
  status text,
  is_requester boolean,
  other_user_id uuid,
  other_name text,
  other_handle text,
  other_avatar_url text,
  last_message_body text,
  last_message_at timestamptz,
  last_sender_id uuid,
  unread_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    t.id as thread_id,
    t.status,
    (t.requested_by = auth.uid()) as is_requester,
    other.id as other_user_id,
    other.name as other_name,
    public.dm_handle_for(other.id) as other_handle,
    other.avatar_url as other_avatar_url,
    lm.body as last_message_body,
    t.last_message_at,
    lm.sender_id as last_sender_id,
    coalesce((
      select count(*)::bigint from public.dm_messages m
      where m.thread_id = t.id and m.sender_id <> auth.uid() and m.read_at is null
    ), 0) as unread_count
  from public.dm_threads t
  join public.profiles other
    on other.id = case when t.user_low = auth.uid() then t.user_high else t.user_low end
  left join lateral (
    select body, sender_id
    from public.dm_messages m
    where m.thread_id = t.id
    order by m.created_at desc
    limit 1
  ) lm on true
  where auth.uid() in (t.user_low, t.user_high)
    and t.last_message_at is not null
  order by t.last_message_at desc;
$$;

-- ── Conversation: list messages + mark incoming read ───────────────────
create or replace function public.dm_list_messages(p_thread_id uuid, lim int default 100)
returns table (
  id uuid,
  sender_id uuid,
  body text,
  created_at timestamptz,
  read_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;
  if not exists (
    select 1 from public.dm_threads t
    where t.id = p_thread_id and v_user in (t.user_low, t.user_high)
  ) then
    raise exception 'Not a participant';
  end if;

  update public.dm_messages
  set read_at = timezone('utc', now())
  where dm_messages.thread_id = p_thread_id
    and dm_messages.sender_id <> v_user
    and dm_messages.read_at is null;

  return query
    select m.id, m.sender_id, m.body, m.created_at, m.read_at
    from public.dm_messages m
    where m.thread_id = p_thread_id
    order by m.created_at asc
    limit greatest(lim, 1);
end;
$$;

-- ── Total unread (for nav badge) ───────────────────────────────────────
create or replace function public.dm_unread_total()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.dm_messages m
  join public.dm_threads t on t.id = m.thread_id
  where m.sender_id <> auth.uid()
    and m.read_at is null
    and auth.uid() in (t.user_low, t.user_high)
    and t.status = 'accepted';
$$;

-- ── Thread header (for opening a conversation directly) ────────────────
create or replace function public.dm_thread_header(p_thread_id uuid)
returns table (
  thread_id uuid,
  status text,
  is_requester boolean,
  other_user_id uuid,
  other_name text,
  other_handle text,
  other_avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    t.id as thread_id,
    t.status,
    (t.requested_by = auth.uid()) as is_requester,
    other.id as other_user_id,
    other.name as other_name,
    public.dm_handle_for(other.id) as other_handle,
    other.avatar_url as other_avatar_url
  from public.dm_threads t
  join public.profiles other
    on other.id = case when t.user_low = auth.uid() then t.user_high else t.user_low end
  where t.id = p_thread_id
    and auth.uid() in (t.user_low, t.user_high);
$$;

grant execute on function public.dm_get_or_create_thread(uuid) to authenticated;
grant execute on function public.dm_send_message(uuid, text) to authenticated;
grant execute on function public.dm_set_thread_status(uuid, text) to authenticated;
grant execute on function public.dm_list_threads() to authenticated;
grant execute on function public.dm_list_messages(uuid, int) to authenticated;
grant execute on function public.dm_unread_total() to authenticated;
grant execute on function public.dm_thread_header(uuid) to authenticated;
grant execute on function public.dm_handle_for(uuid) to authenticated;
