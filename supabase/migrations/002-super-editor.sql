-- Run this in Supabase SQL Editor AFTER schema.sql
-- Promotes tlssymbols@gmail.com to Super Editor

-- 1) Allow super_editor role
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('artist', 'editor', 'super_editor'));

-- 2) Editors + Super Editors can access editorial tools
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

-- 3) Super Editor can read ALL editorial drafts (normal editors only own)
drop policy if exists "Super editors read all drafts" on public.editorial_drafts;
create policy "Super editors read all drafts"
  on public.editorial_drafts for select
  using (public.is_super_editor());

drop policy if exists "Super editors update all drafts" on public.editorial_drafts;
create policy "Super editors update all drafts"
  on public.editorial_drafts for update
  using (public.is_super_editor());

drop policy if exists "Super editors delete all drafts" on public.editorial_drafts;
create policy "Super editors delete all drafts"
  on public.editorial_drafts for delete
  using (public.is_super_editor());

-- 4) Upgrade your account (change email if needed)
update public.profiles
set role = 'super_editor', name = coalesce(name, 'IOS')
where lower(email) = 'tlssymbols@gmail.com';

-- Sync auth metadata
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"super_editor","name":"IOS"}'::jsonb
where lower(email) = 'tlssymbols@gmail.com';
