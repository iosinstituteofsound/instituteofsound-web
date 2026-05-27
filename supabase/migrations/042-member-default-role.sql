-- Default signup = network member; upgrade path to artist page via RPC

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('member', 'artist', 'editor', 'super_editor'));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    'member'
  );
  return new;
end;
$$;

-- Members and artists may apply to become editors
drop policy if exists "Artists insert editor application" on public.editor_applications;
create policy "Members and artists insert editor application"
  on public.editor_applications for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('member', 'artist')
    )
  );

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

grant execute on function public.upgrade_to_artist(text, text) to authenticated;

comment on function public.upgrade_to_artist is
  'Member → artist role + draft artist_profiles row for My Studio';
