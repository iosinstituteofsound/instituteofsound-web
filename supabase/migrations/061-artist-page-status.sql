-- Artist page live vs pending: profiles must be kept updated for public tracks/videos.

alter table public.artist_profiles
  add column if not exists page_status text not null default 'pending';

alter table public.artist_profiles
  add column if not exists page_refreshed_at timestamptz not null default now();

alter table public.artist_profiles
  drop constraint if exists artist_profiles_page_status_check;

alter table public.artist_profiles
  add constraint artist_profiles_page_status_check
  check (page_status in ('live', 'pending'));

update public.artist_profiles
set
  page_refreshed_at = coalesce(updated_at, created_at, now()),
  page_status = case when published then 'live' else 'pending' end
where page_refreshed_at is null or page_status is null;

comment on column public.artist_profiles.page_status is
  'live = page recently updated and complete; pending = draft, incomplete, or stale.';

comment on column public.artist_profiles.page_refreshed_at is
  'Last time the artist saved their studio profile; stale pages go pending.';
