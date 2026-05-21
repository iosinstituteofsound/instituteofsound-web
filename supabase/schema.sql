-- Institute of Sound — run in Supabase SQL Editor
-- https://supabase.com/dashboard → your project → SQL → New query

-- Profiles (linked to Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  role text not null check (role in ('artist', 'editor', 'super_editor')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Auto-create profile on signup (role from user_metadata)
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
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'artist')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Role helpers for RLS
create or replace function public.is_editor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('editor', 'super_editor')
  );
$$;

create or replace function public.is_super_editor()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_editor'
  );
$$;

create or replace function public.is_artist()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'artist'
  );
$$;

-- Profiles policies
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Editors read all profiles" on public.profiles;
create policy "Editors read all profiles"
  on public.profiles for select
  using (public.is_editor());

-- Track submissions
create table if not exists public.track_submissions (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.profiles (id) on delete cascade,
  artist_name text not null,
  artist_email text not null,
  project_name text not null,
  genre text not null,
  track_title text not null,
  description text not null,
  stream_url text not null,
  status text not null default 'pending'
    check (status in ('pending', 'in_review', 'approved', 'rejected')),
  editor_notes text,
  reviewed_by_id uuid references public.profiles (id),
  reviewed_by_name text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists track_submissions_artist_id_idx
  on public.track_submissions (artist_id);
create index if not exists track_submissions_status_idx
  on public.track_submissions (status);

alter table public.track_submissions enable row level security;

drop policy if exists "Artists insert own submissions" on public.track_submissions;
create policy "Artists insert own submissions"
  on public.track_submissions for insert
  with check (auth.uid() = artist_id and public.is_artist());

drop policy if exists "Artists read own submissions" on public.track_submissions;
create policy "Artists read own submissions"
  on public.track_submissions for select
  using (auth.uid() = artist_id);

drop policy if exists "Editors read all submissions" on public.track_submissions;
create policy "Editors read all submissions"
  on public.track_submissions for select
  using (public.is_editor());

drop policy if exists "Editors update submissions" on public.track_submissions;
create policy "Editors update submissions"
  on public.track_submissions for update
  using (public.is_editor());

-- Editorial drafts
create table if not exists public.editorial_drafts (
  id uuid primary key default gen_random_uuid(),
  editor_id uuid not null references public.profiles (id) on delete cascade,
  editor_name text not null,
  type text not null check (type in ('review', 'feature', 'band_profile')),
  title text not null,
  subject text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.editorial_drafts enable row level security;

drop policy if exists "Editors manage own drafts" on public.editorial_drafts;
create policy "Editors manage own drafts"
  on public.editorial_drafts for all
  using (auth.uid() = editor_id and public.is_editor())
  with check (auth.uid() = editor_id and public.is_editor());
