-- External store / merch links (any shop URL; image fetched on save)

create table if not exists public.artist_merch_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  title text not null,
  product_url text not null,
  image_url text,
  price_display text,
  show_price boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists artist_merch_items_profile_idx on public.artist_merch_items (profile_id);

alter table public.artist_merch_items enable row level security;

drop policy if exists "Public read published profile merch" on public.artist_merch_items;
create policy "Public read published profile merch"
  on public.artist_merch_items for select
  using (
    exists (
      select 1 from public.artist_profiles p
      where p.id = profile_id and (p.published = true or p.user_id = auth.uid() or public.is_editor())
    )
  );

drop policy if exists "Artists manage own merch" on public.artist_merch_items;
create policy "Artists manage own merch"
  on public.artist_merch_items for all
  using (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.artist_profiles p where p.id = profile_id and p.user_id = auth.uid())
  );
