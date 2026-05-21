-- Artist band profiles (Spotify-style pages), tracks, albums, videos, editorial links

create table if not exists public.artist_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  tagline text,
  bio text,
  avatar_url text,
  banner_url text,
  logo_url text,
  genres text[] not null default '{}',
  country text,
  website_url text,
  spotify_url text,
  youtube_url text,
  instagram_url text,
  facebook_url text,
  bandcamp_url text,
  monthly_listeners_display text default '—',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artist_profiles_slug_idx on public.artist_profiles (slug);
create index if not exists artist_profiles_user_id_idx on public.artist_profiles (user_id);

create table if not exists public.artist_albums (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  title text not null,
  cover_url text,
  release_year int,
  release_type text not null default 'album'
    check (release_type in ('album', 'single', 'ep')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists artist_albums_profile_idx on public.artist_albums (profile_id);

create table if not exists public.artist_tracks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  album_id uuid references public.artist_albums (id) on delete set null,
  title text not null,
  stream_url text not null,
  cover_url text,
  play_count int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists artist_tracks_profile_idx on public.artist_tracks (profile_id);

alter table public.artist_profiles
  add column if not exists artist_pick_track_id uuid references public.artist_tracks (id) on delete set null;

create table if not exists public.artist_videos (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  title text not null,
  video_url text not null,
  thumbnail_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists artist_videos_profile_idx on public.artist_videos (profile_id);

alter table public.editorial_drafts
  add column if not exists artist_profile_id uuid references public.artist_profiles (id) on delete set null;

alter table public.editorial_drafts
  add column if not exists cover_image_url text;

-- RLS
alter table public.artist_profiles enable row level security;
alter table public.artist_albums enable row level security;
alter table public.artist_tracks enable row level security;
alter table public.artist_videos enable row level security;

drop policy if exists "Public read published artist profiles" on public.artist_profiles;
create policy "Public read published artist profiles"
  on public.artist_profiles for select
  using (published = true or auth.uid() = user_id or public.is_editor());

drop policy if exists "Artists manage own profile" on public.artist_profiles;
create policy "Artists manage own profile"
  on public.artist_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Public read published profile albums" on public.artist_albums;
create policy "Public read published profile albums"
  on public.artist_albums for select
  using (
    exists (
      select 1 from public.artist_profiles p
      where p.id = profile_id and (p.published = true or p.user_id = auth.uid() or public.is_editor())
    )
  );

drop policy if exists "Artists manage own albums" on public.artist_albums;
create policy "Artists manage own albums"
  on public.artist_albums for all
  using (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

drop policy if exists "Public read published profile tracks" on public.artist_tracks;
create policy "Public read published profile tracks"
  on public.artist_tracks for select
  using (
    exists (
      select 1 from public.artist_profiles p
      where p.id = profile_id and (p.published = true or p.user_id = auth.uid() or public.is_editor())
    )
  );

drop policy if exists "Artists manage own tracks" on public.artist_tracks;
create policy "Artists manage own tracks"
  on public.artist_tracks for all
  using (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  );

drop policy if exists "Public read published profile videos" on public.artist_videos;
create policy "Public read published profile videos"
  on public.artist_videos for select
  using (
    exists (
      select 1 from public.artist_profiles p
      where p.id = profile_id and (p.published = true or p.user_id = auth.uid() or public.is_editor())
    )
  );

drop policy if exists "Artists manage own videos" on public.artist_videos;
create policy "Artists manage own videos"
  on public.artist_videos for all
  using (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  );
