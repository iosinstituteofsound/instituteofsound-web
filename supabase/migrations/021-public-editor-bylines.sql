-- Let the public site show current editor name / @username on articles

drop policy if exists "Public read editor bylines" on public.profiles;
create policy "Public read editor bylines"
  on public.profiles for select
  using (role in ('editor', 'super_editor'));
