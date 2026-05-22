-- Band lineup & production credits

create table if not exists public.artist_lineup_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  name text not null,
  role text not null,
  entry_type text not null default 'member'
    check (entry_type in ('member', 'guest', 'production')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists artist_lineup_entries_profile_idx on public.artist_lineup_entries (profile_id);

alter table public.artist_lineup_entries enable row level security;

drop policy if exists "Public read published profile lineup" on public.artist_lineup_entries;
create policy "Public read published profile lineup"
  on public.artist_lineup_entries for select
  using (
    exists (
      select 1 from public.artist_profiles p
      where p.id = profile_id and (p.published = true or p.user_id = auth.uid() or public.is_editor())
    )
  );

drop policy if exists "Artists manage own lineup" on public.artist_lineup_entries;
create policy "Artists manage own lineup"
  on public.artist_lineup_entries for all
  using (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  );
