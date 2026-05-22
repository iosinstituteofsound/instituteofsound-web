-- Artist-controlled page branding (accent color + theme preset)

alter table public.artist_profiles
  add column if not exists accent_color text not null default '#d40000',
  add column if not exists theme_preset text not null default 'metal'
    check (theme_preset in ('metal', 'cinematic', 'minimal', 'raw'));

comment on column public.artist_profiles.accent_color is 'Hex accent (#RRGGBB) for public artist micro-site';
comment on column public.artist_profiles.theme_preset is 'Layout/vibe preset: metal | cinematic | minimal | raw';
