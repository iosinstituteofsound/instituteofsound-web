-- Artist manager mentions on artist profiles + network listing.

alter table public.artist_profiles
  add column if not exists artist_manager_name text;

alter table public.artist_profiles
  add column if not exists artist_manager_handle text;

create index if not exists artist_profiles_manager_handle_idx
  on public.artist_profiles (artist_manager_handle);

comment on column public.artist_profiles.artist_manager_name is
  'Optional manager name mentioned by the artist.';

comment on column public.artist_profiles.artist_manager_handle is
  'Optional network handle (without @) of manager to cross-link in profile and network pages.';
