-- Bio timeline milestones + influence tags on profile

alter table public.artist_profiles
  add column if not exists influence_tags text[] not null default '{}';

create table if not exists public.artist_bio_timeline_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  year int not null,
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists artist_bio_timeline_profile_idx on public.artist_bio_timeline_entries (profile_id);
create index if not exists artist_bio_timeline_year_idx on public.artist_bio_timeline_entries (profile_id, year);

alter table public.artist_bio_timeline_entries enable row level security;

drop policy if exists "Public read published profile bio timeline" on public.artist_bio_timeline_entries;
create policy "Public read published profile bio timeline"
  on public.artist_bio_timeline_entries for select
  using (
    exists (
      select 1 from public.artist_profiles p
      where p.id = profile_id and (p.published = true or p.user_id = auth.uid() or public.is_editor())
    )
  );

drop policy if exists "Artists manage own bio timeline" on public.artist_bio_timeline_entries;
create policy "Artists manage own bio timeline"
  on public.artist_bio_timeline_entries for all
  using (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  );
