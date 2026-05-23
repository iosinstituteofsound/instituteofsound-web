-- Homepage / magazine: slugs, featured flag, public read of published editorials

alter table public.editorial_drafts
  add column if not exists slug text,
  add column if not exists featured_on_homepage boolean not null default false,
  add column if not exists published_at timestamptz;

create unique index if not exists editorial_drafts_slug_key
  on public.editorial_drafts (slug)
  where slug is not null;

comment on column public.editorial_drafts.slug is 'URL slug for /feature/:slug';
comment on column public.editorial_drafts.featured_on_homepage is 'Show on homepage features grid and cover when true';
comment on column public.editorial_drafts.published_at is 'When status became published';

-- Anyone can read published editorials (homepage, feature detail)
drop policy if exists "Public read published editorials" on public.editorial_drafts;
create policy "Public read published editorials"
  on public.editorial_drafts for select
  using (status = 'published');

-- Backfill slug + published_at for rows already published
update public.editorial_drafts
set
  slug = coalesce(
    slug,
    trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
  ),
  published_at = coalesce(published_at, updated_at),
  featured_on_homepage = case
    when type = 'feature' then true
    else coalesce(featured_on_homepage, false)
  end
where status = 'published';
