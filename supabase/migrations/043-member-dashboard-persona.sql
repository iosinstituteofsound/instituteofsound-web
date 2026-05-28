-- Optional member dashboard persona for role-specific workspace views.

alter table public.profiles
  add column if not exists dashboard_persona text;

alter table public.profiles
  drop constraint if exists profiles_dashboard_persona_check;

alter table public.profiles
  add constraint profiles_dashboard_persona_check
  check (
    dashboard_persona is null
    or dashboard_persona in ('event_promoter', 'artist_manager', 'label', 'brand')
  );

comment on column public.profiles.dashboard_persona is
  'Optional workspace profile chosen by members: event_promoter, artist_manager, label, brand';
