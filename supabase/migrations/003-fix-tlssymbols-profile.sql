-- Run if login hangs or "Profile not found" for tlssymbols@gmail.com
-- Creates/updates profile row for existing auth user

insert into public.profiles (id, email, name, role)
select
  id,
  email,
  coalesce(raw_user_meta_data ->> 'name', 'Super Editor'),
  'super_editor'
from auth.users
where lower(email) = 'tlssymbols@gmail.com'
on conflict (id) do update set
  role = 'super_editor',
  email = excluded.email,
  name = coalesce(public.profiles.name, excluded.name);

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
  || '{"role":"super_editor","name":"Super Editor"}'::jsonb
where lower(email) = 'tlssymbols@gmail.com';
