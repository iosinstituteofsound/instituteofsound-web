-- Phase 1: Taste tribe onboarding + achievement badges

-- ── Badge catalog ─────────────────────────────────────────────────────
create table if not exists public.community_badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  sort_order int not null default 0,
  active boolean not null default true
);

insert into public.community_badges (slug, name, description, sort_order) values
  ('first_signal', 'First Signal', 'Completed your first Academy lesson.', 10),
  ('quiz_locked', 'Quiz Locked In', 'Passed your first Academy quiz.', 20),
  ('golden_ear', 'Golden Ear', 'Passed Ear Lab with a strong score (7+).', 30),
  ('scout_promoted', 'Scout', 'Reached Scout rank — 500+ dB.', 40)
on conflict (slug) do nothing;

-- ── Earned badges ─────────────────────────────────────────────────────
create table if not exists public.community_user_badges (
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id uuid not null references public.community_badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index if not exists community_user_badges_user_idx
  on public.community_user_badges (user_id, earned_at desc);

alter table public.community_badges enable row level security;
alter table public.community_user_badges enable row level security;

drop policy if exists "Public read community badges" on public.community_badges;
create policy "Public read community badges"
  on public.community_badges for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Public read earned badges" on public.community_user_badges;
create policy "Public read earned badges"
  on public.community_user_badges for select
  to anon, authenticated
  using (true);

-- ── Grant badge (idempotent) ──────────────────────────────────────────
create or replace function public.community_grant_badge(p_badge_slug text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_badge_id uuid;
  v_inserted uuid;
begin
  if v_user_id is null then
    return false;
  end if;

  select id into v_badge_id
  from public.community_badges
  where slug = p_badge_slug and active = true;

  if v_badge_id is null then
    return false;
  end if;

  insert into public.community_user_badges (user_id, badge_id)
  values (v_user_id, v_badge_id)
  on conflict do nothing
  returning badge_id into v_inserted;

  return v_inserted is not null;
end;
$$;

-- Scout rank badge when total_db crosses 500
create or replace function public.trg_profiles_community_rank_badge()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_badge_id uuid;
begin
  if new.total_db >= 500 and coalesce(old.total_db, 0) < 500 then
    select id into v_badge_id
    from public.community_badges
    where slug = 'scout_promoted' and active = true;

    if v_badge_id is not null then
      insert into public.community_user_badges (user_id, badge_id)
      values (new.id, v_badge_id)
      on conflict do nothing;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_community_rank_badge on public.profiles;
create trigger profiles_community_rank_badge
  after update of total_db on public.profiles
  for each row execute function public.trg_profiles_community_rank_badge();

-- List badges for a member (public)
create or replace function public.community_user_badges_list(p_user_id uuid)
returns table (
  slug text,
  name text,
  description text,
  earned_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    b.slug,
    b.name,
    b.description,
    ub.earned_at
  from public.community_user_badges ub
  join public.community_badges b on b.id = ub.badge_id
  where ub.user_id = p_user_id and b.active = true
  order by ub.earned_at desc;
$$;

grant execute on function public.community_grant_badge(text) to authenticated;
grant execute on function public.community_user_badges_list(uuid) to anon, authenticated;
