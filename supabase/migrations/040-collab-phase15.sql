-- Phase 15: Collab network — skills, open calls (need/offer), responses, mutual completion

insert into public.community_badges (slug, name, description, sort_order) values
  ('collab_verified', 'Collab Verified', 'Completed a collab with mutual confirmation on the network.', 85)
on conflict (slug) do nothing;

-- ── Profile skills ────────────────────────────────────────────────────
create table if not exists public.profile_collab_skills (
  user_id uuid not null references public.profiles (id) on delete cascade,
  skill_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, skill_slug)
);

create index if not exists profile_collab_skills_slug_idx
  on public.profile_collab_skills (skill_slug);

alter table public.profile_collab_skills enable row level security;

drop policy if exists "Public read profile collab skills" on public.profile_collab_skills;
create policy "Public read profile collab skills"
  on public.profile_collab_skills for select
  to anon, authenticated
  using (true);

drop policy if exists "Users manage own collab skills" on public.profile_collab_skills;
create policy "Users manage own collab skills"
  on public.profile_collab_skills for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Collab posts (open calls) ───────────────────────────────────────────
create table if not exists public.collab_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('need', 'offer')),
  title text not null check (char_length(trim(title)) between 3 and 100),
  body text not null check (char_length(trim(body)) between 10 and 600),
  scene_city text,
  scene_genre_slug text,
  skill_slugs text[] not null default '{}'::text[],
  status text not null default 'open'
    check (status in ('open', 'closed', 'filled')),
  accepted_responder_id uuid references public.profiles (id) on delete set null,
  owner_confirmed_at timestamptz,
  partner_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collab_posts_board_idx
  on public.collab_posts (status, created_at desc)
  where status = 'open';

create index if not exists collab_posts_user_idx
  on public.collab_posts (user_id, created_at desc);

alter table public.collab_posts enable row level security;

drop policy if exists "Public read collab posts" on public.collab_posts;
create policy "Public read collab posts"
  on public.collab_posts for select
  to anon, authenticated
  using (status in ('open', 'filled') or auth.uid() = user_id);

drop policy if exists "Users insert own collab posts" on public.collab_posts;
create policy "Users insert own collab posts"
  on public.collab_posts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users update own collab posts" on public.collab_posts;
create policy "Users update own collab posts"
  on public.collab_posts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Responses ───────────────────────────────────────────────────────────
create table if not exists public.collab_responses (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.collab_posts (id) on delete cascade,
  responder_id uuid not null references public.profiles (id) on delete cascade,
  message text not null check (char_length(trim(message)) between 5 and 400),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (post_id, responder_id)
);

create index if not exists collab_responses_post_idx
  on public.collab_responses (post_id, created_at desc);

alter table public.collab_responses enable row level security;

drop policy if exists "Participants read collab responses" on public.collab_responses;
create policy "Participants read collab responses"
  on public.collab_responses for select
  to authenticated
  using (
    auth.uid() = responder_id
    or exists (
      select 1 from public.collab_posts cp
      where cp.id = post_id and cp.user_id = auth.uid()
    )
  );

drop policy if exists "Users insert collab responses" on public.collab_responses;
create policy "Users insert collab responses"
  on public.collab_responses for insert
  to authenticated
  with check (
    auth.uid() = responder_id
    and not exists (
      select 1 from public.collab_posts cp
      where cp.id = post_id and cp.user_id = auth.uid()
    )
  );

-- Extend notification kinds
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
    'collab_accepted'
  ));

-- ── Set profile skills (replace set) ────────────────────────────────────
create or replace function public.collab_set_profile_skills(p_skill_slugs text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  s text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  delete from public.profile_collab_skills where user_id = v_uid;

  if p_skill_slugs is null then
    return;
  end if;

  foreach s in array p_skill_slugs loop
    s := lower(trim(s));
    if length(s) > 0 and length(s) <= 40 then
      insert into public.profile_collab_skills (user_id, skill_slug)
      values (v_uid, s)
      on conflict do nothing;
    end if;
  end loop;
end;
$$;

grant execute on function public.collab_set_profile_skills(text[]) to authenticated;

-- ── Board listing ───────────────────────────────────────────────────────
create or replace function public.collab_board(
  p_kind text default null,
  p_city text default null,
  p_genre_slug text default null,
  p_skill text default null,
  lim int default 40
)
returns table (
  id uuid,
  kind text,
  title text,
  body text,
  scene_city text,
  scene_genre_slug text,
  skill_slugs text[],
  status text,
  response_count bigint,
  created_at timestamptz,
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  community_rank text,
  owner_confirmed_at timestamptz,
  partner_confirmed_at timestamptz,
  accepted_responder_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select
    cp.id,
    cp.kind,
    cp.title,
    cp.body,
    cp.scene_city,
    cp.scene_genre_slug,
    cp.skill_slugs,
    cp.status,
    (
      select count(*)::bigint
      from public.collab_responses cr
      where cr.post_id = cp.id and cr.status = 'pending'
    ) as response_count,
    cp.created_at,
    cp.user_id,
    pr.name as display_name,
    coalesce(
      nullif(trim(pr.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    ) as handle,
    pr.avatar_url,
    public.community_rank_for_db(pr.total_db) as community_rank,
    cp.owner_confirmed_at,
    cp.partner_confirmed_at,
    cp.accepted_responder_id
  from public.collab_posts cp
  join public.profiles pr on pr.id = cp.user_id
  where cp.status = 'open'
    and (p_kind is null or cp.kind = p_kind)
    and (p_city is null or lower(trim(cp.scene_city)) = lower(trim(p_city)))
    and (p_genre_slug is null or cp.scene_genre_slug = p_genre_slug)
    and (
      p_skill is null
      or p_skill = any (cp.skill_slugs)
    )
  order by cp.created_at desc
  limit greatest(lim, 1);
$$;

grant execute on function public.collab_board(text, text, text, text, int) to anon, authenticated;

-- Single post (open on board, or filled for participants)
create or replace function public.collab_post_get(p_post_id uuid)
returns table (
  id uuid,
  kind text,
  title text,
  body text,
  scene_city text,
  scene_genre_slug text,
  skill_slugs text[],
  status text,
  response_count bigint,
  created_at timestamptz,
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  community_rank text,
  owner_confirmed_at timestamptz,
  partner_confirmed_at timestamptz,
  accepted_responder_id uuid
)
language sql
stable
security definer
set search_path = public
as $$
  select
    cp.id,
    cp.kind,
    cp.title,
    cp.body,
    cp.scene_city,
    cp.scene_genre_slug,
    cp.skill_slugs,
    cp.status,
    (
      select count(*)::bigint
      from public.collab_responses cr
      where cr.post_id = cp.id
    ) as response_count,
    cp.created_at,
    cp.user_id,
    pr.name as display_name,
    coalesce(
      nullif(trim(pr.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    ) as handle,
    pr.avatar_url,
    public.community_rank_for_db(pr.total_db) as community_rank,
    cp.owner_confirmed_at,
    cp.partner_confirmed_at,
    cp.accepted_responder_id
  from public.collab_posts cp
  join public.profiles pr on pr.id = cp.user_id
  where cp.id = p_post_id
    and (
      cp.status = 'open'
      or auth.uid() = cp.user_id
      or auth.uid() = cp.accepted_responder_id
    );
$$;

grant execute on function public.collab_post_get(uuid) to anon, authenticated;

-- ── Create post ─────────────────────────────────────────────────────────
create or replace function public.collab_create_post(
  p_kind text,
  p_title text,
  p_body text,
  p_scene_city text default null,
  p_scene_genre_slug text default null,
  p_skill_slugs text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  if p_kind not in ('need', 'offer') then
    raise exception 'Invalid kind';
  end if;

  insert into public.collab_posts (
    user_id,
    kind,
    title,
    body,
    scene_city,
    scene_genre_slug,
    skill_slugs
  )
  values (
    v_uid,
    p_kind,
    trim(p_title),
    trim(p_body),
    nullif(trim(p_scene_city), ''),
    nullif(trim(p_scene_genre_slug), ''),
    coalesce(p_skill_slugs, '{}'::text[])
  )
  returning id into v_id;

  return v_id;
end;
$$;

grant execute on function public.collab_create_post(text, text, text, text, text, text[]) to authenticated;

-- ── Respond ─────────────────────────────────────────────────────────────
create or replace function public.collab_respond(p_post_id uuid, p_message text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_id uuid;
  v_handle text;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select user_id into v_owner
  from public.collab_posts
  where id = p_post_id and status = 'open';

  if v_owner is null then
    raise exception 'Post not open';
  end if;

  if v_owner = v_uid then
    raise exception 'Cannot respond to own post';
  end if;

  insert into public.collab_responses (post_id, responder_id, message)
  values (p_post_id, v_uid, trim(p_message))
  returning id into v_id;

  select coalesce(nullif(trim(username), ''), 'member') into v_handle
  from public.profiles where id = v_uid;

  perform public.community_enqueue_notification(
    v_owner,
    v_uid,
    'collab_response',
    'New collab response',
    left(trim(p_message), 120),
    '/collab?post=' || p_post_id::text,
    jsonb_build_object('post_id', p_post_id, 'response_id', v_id)
  );

  return v_id;
end;
$$;

grant execute on function public.collab_respond(uuid, text) to authenticated;

-- ── List responses (owner or responder) ─────────────────────────────────
create or replace function public.collab_post_responses(p_post_id uuid)
returns table (
  id uuid,
  message text,
  status text,
  created_at timestamptz,
  responder_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  community_rank text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    cr.id,
    cr.message,
    cr.status,
    cr.created_at,
    cr.responder_id,
    pr.name as display_name,
    coalesce(
      nullif(trim(pr.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    ) as handle,
    pr.avatar_url,
    public.community_rank_for_db(pr.total_db) as community_rank
  from public.collab_responses cr
  join public.profiles pr on pr.id = cr.responder_id
  where cr.post_id = p_post_id
    and (
      auth.uid() = cr.responder_id
      or exists (
        select 1 from public.collab_posts cp
        where cp.id = p_post_id and cp.user_id = auth.uid()
      )
    )
  order by cr.created_at asc;
$$;

grant execute on function public.collab_post_responses(uuid) to authenticated;

-- ── Accept response ─────────────────────────────────────────────────────
create or replace function public.collab_accept_response(p_response_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_post_id uuid;
  v_responder uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select cr.post_id, cr.responder_id
  into v_post_id, v_responder
  from public.collab_responses cr
  join public.collab_posts cp on cp.id = cr.post_id
  where cr.id = p_response_id
    and cp.user_id = v_uid
    and cp.status = 'open';

  if v_post_id is null then
    return false;
  end if;

  update public.collab_posts
  set
    status = 'filled',
    accepted_responder_id = v_responder,
    updated_at = timezone('utc', now())
  where id = v_post_id;

  update public.collab_responses
  set status = 'declined'
  where post_id = v_post_id and id <> p_response_id;

  update public.collab_responses
  set status = 'accepted'
  where id = p_response_id;

  perform public.community_enqueue_notification(
    v_responder,
    v_uid,
    'collab_accepted',
    'Collab accepted',
    'Your response was accepted — confirm when the work is done.',
    '/collab?post=' || v_post_id::text,
    jsonb_build_object('post_id', v_post_id)
  );

  return true;
end;
$$;

grant execute on function public.collab_accept_response(uuid) to authenticated;

-- ── Mutual completion ───────────────────────────────────────────────────
create or replace function public.collab_confirm_complete(p_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_post public.collab_posts%rowtype;
  v_partner uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_post
  from public.collab_posts
  where id = p_post_id and status = 'filled';

  if v_post.id is null then
    return false;
  end if;

  v_partner := v_post.accepted_responder_id;

  if v_uid = v_post.user_id then
    update public.collab_posts
    set owner_confirmed_at = coalesce(owner_confirmed_at, timezone('utc', now())),
        updated_at = timezone('utc', now())
    where id = p_post_id;
  elsif v_uid = v_partner then
    update public.collab_posts
    set partner_confirmed_at = coalesce(partner_confirmed_at, timezone('utc', now())),
        updated_at = timezone('utc', now())
    where id = p_post_id;
  else
    raise exception 'Not a participant';
  end if;

  select * into v_post from public.collab_posts where id = p_post_id;

  if v_post.owner_confirmed_at is not null and v_post.partner_confirmed_at is not null then
    perform public.community_grant_badge_for_user(v_post.user_id, 'collab_verified');
    perform public.community_grant_badge_for_user(v_partner, 'collab_verified');
  end if;

  return true;
end;
$$;

-- Helper to grant badge to arbitrary user (collab partner)
create or replace function public.community_grant_badge_for_user(p_user_id uuid, p_badge_slug text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_badge_id uuid;
begin
  select id into v_badge_id
  from public.community_badges
  where slug = p_badge_slug and active = true;

  if v_badge_id is null then
    return false;
  end if;

  insert into public.community_user_badges (user_id, badge_id)
  values (p_user_id, v_badge_id)
  on conflict do nothing;

  return true;
end;
$$;

grant execute on function public.collab_confirm_complete(uuid) to authenticated;
grant execute on function public.community_grant_badge_for_user(uuid, text) to authenticated;

-- Profile skills by handle
create or replace function public.collab_profile_skills(p_handle text)
returns table (skill_slug text)
language sql
stable
security definer
set search_path = public
as $$
  with target as (
    select p.id as user_id
    from public.profiles p
    where lower(coalesce(nullif(trim(p.username), ''), '')) = public.community_normalize_handle(p_handle)
       or public.community_normalize_handle(p_handle) = lower(
         trim(both '_' from regexp_replace(lower(split_part(p.email, '@', 1)), '[^a-z0-9_]', '_', 'g'))
       )
    limit 1
  )
  select pcs.skill_slug
  from public.profile_collab_skills pcs
  join target t on t.user_id = pcs.user_id
  order by pcs.skill_slug;
$$;

grant execute on function public.collab_profile_skills(text) to anon, authenticated;

-- Completed collab count for profile trust signal
create or replace function public.collab_completed_count(p_user_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.collab_posts cp
  where cp.status = 'filled'
    and cp.owner_confirmed_at is not null
    and cp.partner_confirmed_at is not null
    and (cp.user_id = p_user_id or cp.accepted_responder_id = p_user_id);
$$;

grant execute on function public.collab_completed_count(uuid) to anon, authenticated;
