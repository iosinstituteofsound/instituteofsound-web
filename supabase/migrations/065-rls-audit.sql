-- Phase 2: RLS audit — close privilege-escalation and data-loss holes.
-- Apply in Supabase SQL editor after prior migrations.

-- ── 1) Guard privileged profile columns (role, total_db, email) ─────────
create or replace function public.profiles_bypass_guard()
returns boolean
language sql
stable
as $$
  select coalesce(current_setting('app.bypass_profile_guard', true), '') = 'true';
$$;

create or replace function public.trg_profiles_guard_privileged()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Desk, cron, and trusted RPCs may change any profile row.
  if auth.uid() is distinct from old.id then
    return new;
  end if;

  if public.profiles_bypass_guard() then
    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Cannot change role directly';
  end if;

  if new.total_db is distinct from old.total_db then
    raise exception 'Cannot change total_db directly';
  end if;

  if new.email is distinct from old.email then
    raise exception 'Cannot change email directly';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_privileged on public.profiles;
create trigger profiles_guard_privileged
  before update on public.profiles
  for each row execute function public.trg_profiles_guard_privileged();

-- Keep total_db in sync when dB events are inserted by trusted code paths.
create or replace function public.trg_community_db_events_apply_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('app.bypass_profile_guard', 'true', true);
  update public.profiles
  set total_db = total_db + new.amount
  where id = new.user_id;
  return new;
end;
$$;

-- Member → artist upgrade (security definer) must be allowed to set role.
create or replace function public.upgrade_to_artist(
  p_display_name text,
  p_slug text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_name text;
  v_slug text;
  v_base_slug text;
  v_profile_id uuid;
  n int := 2;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select role into v_role from public.profiles where id = v_user_id;
  if v_role is null then
    raise exception 'Profile not found';
  end if;
  if v_role not in ('member', 'artist') then
    raise exception 'Cannot upgrade from role %', v_role;
  end if;

  v_name := nullif(trim(p_display_name), '');
  if v_name is null then
    select name into v_name from public.profiles where id = v_user_id;
  end if;
  if v_name is null or trim(v_name) = '' then
    v_name := 'Artist';
  end if;

  v_base_slug := coalesce(
    nullif(trim(p_slug), ''),
    lower(regexp_replace(trim(v_name), '[^a-zA-Z0-9]+', '-', 'g'))
  );
  v_base_slug := trim(both '-' from v_base_slug);
  if v_base_slug = '' then
    v_base_slug := 'artist';
  end if;
  v_slug := left(v_base_slug, 64);

  while exists (select 1 from public.artist_profiles ap where ap.slug = v_slug) loop
    v_slug := left(v_base_slug, 58) || '-' || n::text;
    n := n + 1;
  end loop;

  if v_role = 'member' then
    perform set_config('app.bypass_profile_guard', 'true', true);
    update public.profiles
    set role = 'artist'
    where id = v_user_id;
  end if;

  select id into v_profile_id
  from public.artist_profiles
  where user_id = v_user_id;

  if v_profile_id is null then
    insert into public.artist_profiles (user_id, slug, display_name, published)
    values (v_user_id, v_slug, v_name, false)
    returning id into v_profile_id;
  else
    update public.artist_profiles
    set
      display_name = coalesce(nullif(trim(v_name), ''), display_name),
      updated_at = now()
    where id = v_profile_id;
  end if;

  return v_profile_id;
end;
$$;

-- ── 2) dB ledger: block direct client inserts ───────────────────────────
drop policy if exists "Users insert own db events" on public.community_db_events;

create or replace function public.community_award_db(
  p_user_id uuid,
  p_amount int,
  p_source text,
  p_source_id text,
  p_genre_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected int;
  v_id uuid;
  v_role text := coalesce(auth.jwt()->>'role', '');
begin
  if p_amount is null or p_amount <= 0 then
    return false;
  end if;

  if auth.uid() is null then
    if v_role <> 'service_role' then
      raise exception 'Not authenticated';
    end if;

    insert into public.community_db_events (user_id, amount, source, source_id, genre_id)
    values (p_user_id, p_amount, p_source, p_source_id, p_genre_id)
    on conflict (user_id, source, source_id) do nothing
    returning id into v_id;

    return v_id is not null;
  end if;

  if auth.uid() <> p_user_id then
    raise exception 'Forbidden';
  end if;

  v_expected := case p_source
    when 'lesson_complete' then 25
    when 'quiz_pass' then 20
    when 'ear_lab_pass' then 50
    when 'spin_post' then 10
    when 'drop_post' then 5
    else null
  end;

  if v_expected is null or p_amount <> v_expected then
    raise exception 'Invalid dB award';
  end if;

  insert into public.community_db_events (user_id, amount, source, source_id, genre_id)
  values (p_user_id, p_amount, p_source, p_source_id, p_genre_id)
  on conflict (user_id, source, source_id) do nothing
  returning id into v_id;

  return v_id is not null;
end;
$$;

revoke all on function public.community_award_db(uuid, int, text, text, uuid) from public;
grant execute on function public.community_award_db(uuid, int, text, text, uuid) to authenticated;

-- ── 3) Artist page: owners may not DELETE (purge / desk only) ───────────
drop policy if exists "Artists manage own profile" on public.artist_profiles;

drop policy if exists "Artists insert own profile" on public.artist_profiles;
create policy "Artists insert own profile"
  on public.artist_profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Artists update own profile" on public.artist_profiles;
create policy "Artists update own profile"
  on public.artist_profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 4) Editor bylines: public read without email leak ───────────────────
drop policy if exists "Public read editor bylines" on public.profiles;

create or replace function public.get_editor_profiles(p_ids uuid[])
returns table (
  id uuid,
  name text,
  username text,
  avatar_url text,
  bio text,
  role text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.username, p.avatar_url, p.bio, p.role
  from public.profiles p
  where p.id = any (p_ids)
    and p.role in ('editor', 'super_editor');
$$;

revoke all on function public.get_editor_profiles(uuid[]) from public;
grant execute on function public.get_editor_profiles(uuid[]) to anon, authenticated;

comment on function public.community_award_db is
  'Authenticated users may award fixed dB amounts to themselves only; server/service_role inserts directly.';
