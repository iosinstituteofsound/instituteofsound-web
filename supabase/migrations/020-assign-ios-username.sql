-- Assign @ios to the Institute of Sound super editor (tlssymbols@gmail.com)
-- Clears the handle from any other profile first (unique index).

update public.profiles
set username = null
where lower(username) = 'ios';

update public.profiles p
set
  username = 'ios',
  role = 'super_editor',
  name = coalesce(nullif(trim(p.name), ''), 'Institute of Sound')
from auth.users u
where p.id = u.id
  and lower(u.email) = 'tlssymbols@gmail.com';
