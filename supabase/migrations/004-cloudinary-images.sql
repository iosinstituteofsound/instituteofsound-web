-- Cloudinary image URLs for uploads (artwork, editorial covers)

alter table public.track_submissions
  add column if not exists cover_image_url text;

alter table public.editorial_drafts
  add column if not exists cover_image_url text;

comment on column public.track_submissions.cover_image_url is 'Cloudinary secure_url for track artwork';
comment on column public.editorial_drafts.cover_image_url is 'Cloudinary secure_url for editorial hero image';
