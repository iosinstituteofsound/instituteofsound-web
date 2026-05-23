-- Editor / staff public identity on profiles (avatar, @username, bio)

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists username text,
  add column if not exists bio text;

create unique index if not exists profiles_username_unique
  on public.profiles (lower(username))
  where username is not null and length(trim(username)) > 0;

comment on column public.profiles.avatar_url is 'Profile photo (Cloudinary URL)';
comment on column public.profiles.username is 'Public @handle for editors (unique, lowercase)';
comment on column public.profiles.bio is 'Short editor bio for bylines';

-- Backfill username from email local-part where missing
update public.profiles
set username = trim(both '_' from regexp_replace(lower(split_part(email, '@', 1)), '[^a-z0-9_]', '_', 'g'))
where username is null
  and role in ('editor', 'super_editor')
  and length(trim(both '_' from regexp_replace(lower(split_part(email, '@', 1)), '[^a-z0-9_]', '_', 'g'))) >= 3;
