-- Playlist curator applications: members submit playlist links + note; super editors approve.

alter table public.profiles
  add column if not exists playlist_curator_verified boolean not null default false;

create table if not exists public.playlist_curator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  playlist_links text[] not null default '{}',
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_notes text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (coalesce(array_length(playlist_links, 1), 0) >= 1)
);

alter table public.playlist_curator_applications enable row level security;

create unique index if not exists playlist_curator_unique_pending_idx
  on public.playlist_curator_applications (user_id, status)
  where status = 'pending';

create index if not exists playlist_curator_applications_user_idx
  on public.playlist_curator_applications (user_id, created_at desc);

create index if not exists playlist_curator_applications_status_idx
  on public.playlist_curator_applications (status, created_at desc);

drop policy if exists "Users create own playlist curator applications" on public.playlist_curator_applications;
create policy "Users create own playlist curator applications"
  on public.playlist_curator_applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users read own playlist curator applications" on public.playlist_curator_applications;
create policy "Users read own playlist curator applications"
  on public.playlist_curator_applications for select
  using (auth.uid() = user_id or public.is_super_editor());

drop policy if exists "Super editors update playlist curator applications" on public.playlist_curator_applications;
create policy "Super editors update playlist curator applications"
  on public.playlist_curator_applications for update
  using (public.is_super_editor());

comment on table public.playlist_curator_applications is
  'Members apply to curate IOS playlists; super editors review links and note.';

comment on column public.profiles.playlist_curator_verified is
  'True after a playlist curator application is approved.';

create or replace function public.apply_playlist_curator_approval()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    update public.profiles
    set playlist_curator_verified = true
    where id = new.user_id;
  end if;
  if new.status = 'rejected' and old.status = 'approved' then
    update public.profiles
    set playlist_curator_verified = false
    where id = new.user_id
      and not exists (
        select 1
        from public.playlist_curator_applications a
        where a.user_id = new.user_id
          and a.id <> new.id
          and a.status = 'approved'
      );
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists playlist_curator_applications_apply_approval on public.playlist_curator_applications;
create trigger playlist_curator_applications_apply_approval
  before update on public.playlist_curator_applications
  for each row
  execute function public.apply_playlist_curator_approval();
