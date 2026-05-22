-- Electronic press kit (EPK) PDF for media / promoters

alter table public.artist_profiles
  add column if not exists press_kit_url text,
  add column if not exists press_kit_label text;
