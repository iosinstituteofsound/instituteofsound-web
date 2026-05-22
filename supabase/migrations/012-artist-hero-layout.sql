-- Hero layout variant on public artist page

alter table public.artist_profiles
  add column if not exists hero_layout text not null default 'full'
    check (hero_layout in ('full', 'split', 'logo', 'compact'));

comment on column public.artist_profiles.hero_layout is 'Hero structure: full | split | logo | compact';
