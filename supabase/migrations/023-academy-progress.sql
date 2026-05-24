-- Academy progress synced per user (lessons, quizzes, ear lab, certificate name)

create table if not exists public.academy_progress (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  completed_lessons text[] not null default '{}',
  quiz_scores jsonb not null default '{}'::jsonb,
  ear_lab jsonb not null default '{}'::jsonb,
  certificate_name text,
  updated_at timestamptz not null default now()
);

create index if not exists academy_progress_updated_idx on public.academy_progress (updated_at desc);

alter table public.academy_progress enable row level security;

drop policy if exists academy_progress_select_own on public.academy_progress;
create policy academy_progress_select_own on public.academy_progress
  for select using (auth.uid() = user_id);

drop policy if exists academy_progress_insert_own on public.academy_progress;
create policy academy_progress_insert_own on public.academy_progress
  for insert with check (auth.uid() = user_id);

drop policy if exists academy_progress_update_own on public.academy_progress;
create policy academy_progress_update_own on public.academy_progress
  for update using (auth.uid() = user_id);
