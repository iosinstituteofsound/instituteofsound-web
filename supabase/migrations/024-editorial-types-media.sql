-- Editorial: Singles & EP types, streaming links, artist photo gallery

alter table public.editorial_drafts
  drop constraint if exists editorial_drafts_type_check;

alter table public.editorial_drafts
  add constraint editorial_drafts_type_check
  check (type in ('review', 'single', 'ep', 'feature', 'band_profile'));

alter table public.editorial_drafts
  add column if not exists spotify_url text,
  add column if not exists youtube_url text,
  add column if not exists gallery_image_urls text[] not null default '{}';

comment on column public.editorial_drafts.spotify_url is 'Spotify album/single/artist link for the editorial';
comment on column public.editorial_drafts.youtube_url is 'YouTube video or channel link for the editorial';
comment on column public.editorial_drafts.gallery_image_urls is 'Additional artist photos (Cloudinary URLs)';
