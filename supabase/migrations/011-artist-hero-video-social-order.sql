-- Hero background video + social link display order

alter table public.artist_profiles
  add column if not exists hero_video_url text,
  add column if not exists social_link_order text[] not null default array[
    'website', 'spotify', 'youtube', 'instagram', 'facebook', 'bandcamp'
  ]::text[];

comment on column public.artist_profiles.hero_video_url is 'Optional YouTube URL for muted looping hero background';
comment on column public.artist_profiles.social_link_order is 'Display order of social keys on public profile';
