-- Artist profile views & track play/click analytics

create table if not exists public.artist_analytics_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  track_id uuid references public.artist_tracks (id) on delete cascade,
  event_type text not null
    check (event_type in ('profile_view', 'track_click')),
  created_at timestamptz not null default now(),
  constraint artist_analytics_events_shape check (
    (event_type = 'profile_view' and track_id is null)
    or (event_type = 'track_click' and track_id is not null)
  )
);

create index if not exists artist_analytics_events_profile_idx
  on public.artist_analytics_events (profile_id, created_at desc);

create index if not exists artist_analytics_events_track_idx
  on public.artist_analytics_events (track_id, created_at desc)
  where track_id is not null;

alter table public.artist_analytics_events enable row level security;

drop policy if exists "Log events on published profiles" on public.artist_analytics_events;
create policy "Log events on published profiles"
  on public.artist_analytics_events for insert
  with check (
    exists (
      select 1 from public.artist_profiles p
      where p.id = profile_id and p.published = true
    )
    and (
      (
        event_type = 'profile_view'
        and track_id is null
      )
      or (
        event_type = 'track_click'
        and track_id is not null
        and exists (
          select 1 from public.artist_tracks t
          where t.id = track_id and t.profile_id = profile_id
        )
      )
    )
  );

drop policy if exists "Artists read own analytics events" on public.artist_analytics_events;
create policy "Artists read own analytics events"
  on public.artist_analytics_events for select
  using (
    exists (
      select 1 from public.artist_profiles p
      where p.id = profile_id and (p.user_id = auth.uid() or public.is_editor())
    )
  );
