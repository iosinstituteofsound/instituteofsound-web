-- ═══════════════════════════════════════════════════════════════════════
-- MAX OUT @ios community profile (demo / founder account)
-- Run in Supabase SQL Editor AFTER migrations 025–030.
--
-- Sets: Operator rank (16k dB), Metal tribe, all badges, weekly challenges done.
-- Safe to re-run (idempotent for this user).
-- ═══════════════════════════════════════════════════════════════════════

do $$
declare
  v_user uuid;
  v_metal uuid;
  v_week text;
  v_crew_id uuid;
begin
  select p.id into v_user
  from public.profiles p
  where lower(p.username) = 'ios'
  limit 1;

  if v_user is null then
    select p.id into v_user
    from public.profiles p
    join auth.users u on u.id = p.id
    where lower(u.email) = 'tlssymbols@gmail.com'
    limit 1;
  end if;

  if v_user is null then
    raise exception 'Profile not found for @ios / tlssymbols@gmail.com';
  end if;

  select id into v_metal from public.community_genres where slug = 'metal' and active = true;
  v_week := public.community_current_week_key();

  -- Tribe
  update public.profiles
  set
    primary_genre_id = v_metal,
    total_db = 0
  where id = v_user;

  -- Reset community ledger for this user (re-run safe)
  delete from public.community_db_events where user_id = v_user;
  delete from public.community_user_badges where user_id = v_user;
  delete from public.community_challenge_completions where user_id = v_user;

  -- Operator rank + strong weekly signal (single event counts for both)
  insert into public.community_db_events (user_id, amount, source, source_id, genre_id)
  values (v_user, 16000, 'demo_seed', 'operator-max', v_metal);

  -- Extra this-week activity so tribe / crew boards look alive
  insert into public.community_db_events (user_id, amount, source, source_id, genre_id)
  values
    (v_user, 25, 'lesson_complete', 'demo-lesson-1', v_metal),
    (v_user, 20, 'quiz_pass', 'demo-quiz-1', v_metal),
    (v_user, 50, 'ear_lab_pass', 'demo-ear-1', v_metal),
    (v_user, 10, 'spin_post', 'demo-spin-1', v_metal),
    (v_user, 5, 'drop_post', 'demo-drop-1', v_metal)
  on conflict do nothing;

  -- All badges
  insert into public.community_user_badges (user_id, badge_id)
  select v_user, b.id
  from public.community_badges b
  where b.active = true
  on conflict do nothing;

  -- Founder crew if not already in one (before weekly_crew challenge)
  if not exists (select 1 from public.community_crew_members where user_id = v_user) then
    insert into public.community_crews (name, slug, tagline, invite_code, founder_id, genre_id)
    values (
      'IOS Signal',
      'ios-signal',
      'Official Institute of Sound crew.',
      public.community_new_invite_code(),
      v_user,
      v_metal
    )
    returning id into v_crew_id;

    insert into public.community_crew_members (crew_id, user_id, role)
    values (v_crew_id, v_user, 'founder');
  end if;

  -- Weekly challenges (current week) — show 100% complete in UI
  insert into public.community_challenge_completions (user_id, challenge_slug, week_key)
  values
    (v_user, 'weekly_db_75', v_week),
    (v_user, 'weekly_spin', v_week),
    (v_user, 'weekly_crew', v_week)
  on conflict do nothing;

  raise notice 'Seeded @ios — total_db: %, week: %',
    (select total_db from public.profiles where id = v_user),
    v_week;
end;
$$;

-- Quick verify
select
  p.username,
  p.total_db,
  public.community_rank_for_db(p.total_db) as rank,
  g.slug as tribe,
  (select count(*) from public.community_user_badges ub where ub.user_id = p.id) as badges,
  (select count(*) from public.community_challenge_completions c
   where c.user_id = p.id and c.week_key = public.community_current_week_key()) as challenges_done
from public.profiles p
left join public.community_genres g on g.id = p.primary_genre_id
where lower(p.username) = 'ios';
