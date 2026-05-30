-- Deleted artist page archives + IOS Support recovery requests (super editor restore).

create table if not exists public.artist_profile_archives (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  profile_id uuid not null,
  slug text not null,
  display_name text not null,
  deletion_reason text not null check (
    deletion_reason in ('incomplete_draft_expired', 'inactive_live_page', 'manual')
  ),
  deleted_at timestamptz not null default now(),
  snapshot jsonb not null,
  restored_at timestamptz,
  restored_by uuid references public.profiles (id) on delete set null,
  unique (profile_id)
);

create index if not exists artist_profile_archives_user_idx
  on public.artist_profile_archives (user_id, deleted_at desc);

create index if not exists artist_profile_archives_active_idx
  on public.artist_profile_archives (deleted_at desc)
  where restored_at is null;

alter table public.artist_profile_archives enable row level security;

drop policy if exists "Users read own artist archives" on public.artist_profile_archives;
create policy "Users read own artist archives"
  on public.artist_profile_archives for select
  using (auth.uid() = user_id or public.is_super_editor());

drop policy if exists "Users archive own deleted page" on public.artist_profile_archives;
create policy "Users archive own deleted page"
  on public.artist_profile_archives for insert
  with check (auth.uid() = user_id);

drop policy if exists "Super editors update artist archives" on public.artist_profile_archives;
create policy "Super editors update artist archives"
  on public.artist_profile_archives for update
  using (public.is_super_editor());

create table if not exists public.artist_page_recovery_requests (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.artist_profile_archives (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  gov_id_document_url text not null,
  applicant_note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_notes text,
  reviewed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists artist_page_recovery_pending_idx
  on public.artist_page_recovery_requests (archive_id, status)
  where status = 'pending';

create index if not exists artist_page_recovery_user_idx
  on public.artist_page_recovery_requests (user_id, created_at desc);

create index if not exists artist_page_recovery_status_idx
  on public.artist_page_recovery_requests (status, created_at desc);

alter table public.artist_page_recovery_requests enable row level security;

drop policy if exists "Users create own recovery requests" on public.artist_page_recovery_requests;
create policy "Users create own recovery requests"
  on public.artist_page_recovery_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users read own recovery requests" on public.artist_page_recovery_requests;
create policy "Users read own recovery requests"
  on public.artist_page_recovery_requests for select
  using (auth.uid() = user_id or public.is_super_editor());

drop policy if exists "Super editors update recovery requests" on public.artist_page_recovery_requests;
create policy "Super editors update recovery requests"
  on public.artist_page_recovery_requests for update
  using (public.is_super_editor());

comment on table public.artist_profile_archives is
  'Snapshot taken when an artist page is removed; used for IOS Support recovery.';

comment on table public.artist_page_recovery_requests is
  'Artist requests page restore via IOS Support; super editor verifies government ID.';

-- Notification kind for desk bell
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
    'artist_page_recovery'
  ));
