-- Editor applications: artists apply; super editors approve → role becomes editor

create table if not exists public.editor_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  portfolio_links text not null,
  motivation text not null,
  terms_version text not null default '2026-05',
  terms_accepted_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewer_id uuid references public.profiles (id) on delete set null,
  reviewer_notes text,
  reviewed_at timestamptz,
  congrats_pending boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists editor_applications_user_id_key
  on public.editor_applications (user_id);

create index if not exists editor_applications_status_idx
  on public.editor_applications (status);

alter table public.editor_applications enable row level security;

-- Applicants read/write own row (insert once, update only when rejected for resubmit)
drop policy if exists "Users read own editor application" on public.editor_applications;
create policy "Users read own editor application"
  on public.editor_applications for select
  using (auth.uid() = user_id);

drop policy if exists "Artists insert editor application" on public.editor_applications;
create policy "Artists insert editor application"
  on public.editor_applications for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'artist'
    )
  );

drop policy if exists "Users update own rejected application" on public.editor_applications;
create policy "Users update own rejected application"
  on public.editor_applications for update
  using (auth.uid() = user_id and status = 'rejected')
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Users acknowledge congrats" on public.editor_applications;
create policy "Users acknowledge congrats"
  on public.editor_applications for update
  using (
    auth.uid() = user_id
    and status = 'approved'
    and congrats_pending = true
  )
  with check (
    auth.uid() = user_id
    and congrats_pending = false
  );

-- Super editors manage all applications
drop policy if exists "Super editors read applications" on public.editor_applications;
create policy "Super editors read applications"
  on public.editor_applications for select
  using (public.is_super_editor());

drop policy if exists "Super editors update applications" on public.editor_applications;
create policy "Super editors update applications"
  on public.editor_applications for update
  using (public.is_super_editor());

-- Super editors can promote users to editor (role change on approve)
drop policy if exists "Super editors update profiles role" on public.profiles;
create policy "Super editors update profiles role"
  on public.profiles for update
  using (public.is_super_editor());

comment on table public.editor_applications is 'Apply-to-be-editor workflow; approved → profiles.role = editor';
