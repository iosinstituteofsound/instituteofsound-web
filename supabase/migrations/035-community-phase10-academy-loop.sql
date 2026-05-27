-- Phase 10: Academy ↔ community retention loop

-- Public academy summary for network profiles (no PII beyond progress)
create or replace function public.academy_public_summary(p_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select jsonb_build_object(
        'completed_lessons', ap.completed_lessons,
        'quiz_scores', ap.quiz_scores,
        'ear_lab', ap.ear_lab,
        'certificate_name', ap.certificate_name
      )
      from public.academy_progress ap
      where ap.user_id = p_user_id
    ),
    '{"completed_lessons":[],"quiz_scores":{},"ear_lab":{},"certificate_name":null}'::jsonb
  );
$$;

grant execute on function public.academy_public_summary(uuid) to anon, authenticated;

-- Weekly challenges + academy missions
create or replace function public.community_weekly_challenges()
returns table (
  slug text,
  title text,
  description text,
  target int,
  progress int,
  reward_db int,
  completed boolean
)
language sql
stable
security definer
set search_path = public
as $$
  with wk as (
    select public.community_current_week_key() as week_key
  ),
  me as (
    select auth.uid() as user_id
  ),
  weekly_db as (
    select coalesce(sum(e.amount), 0)::int as val
    from public.community_db_events e, me
    where e.user_id = me.user_id
      and e.created_at >= (timezone('utc', now()) - interval '7 days')
  ),
  spin_count as (
    select count(*)::int as val
    from public.community_posts p, me
    where p.user_id = me.user_id
      and p.kind = 'spin'
      and p.status = 'visible'
      and p.created_at >= (timezone('utc', now()) - interval '7 days')
  ),
  drop_count as (
    select count(*)::int as val
    from public.community_posts p, me
    where p.user_id = me.user_id
      and p.kind = 'drop'
      and p.status = 'visible'
      and p.created_at >= (timezone('utc', now()) - interval '7 days')
  ),
  lesson_count as (
    select count(*)::int as val
    from public.community_db_events e, me
    where e.user_id = me.user_id
      and e.source = 'lesson_complete'
      and e.created_at >= (timezone('utc', now()) - interval '7 days')
  ),
  study_wire as (
    select case
      when (select val from lesson_count) >= 1 and (select val from drop_count) >= 1 then 1
      else 0
    end as val
  ),
  in_crew as (
    select case when exists (
      select 1 from public.community_crew_members m, me
      where m.user_id = me.user_id
    ) then 1 else 0 end as val
  ),
  defs as (
    select * from (values
      ('weekly_db_75', 'Signal surge', 'Earn 75 dB this week.', 75, (select val from weekly_db), 20),
      ('weekly_lesson', 'Academy lesson', 'Complete any Academy lesson this week.', 1, (select val from lesson_count), 15),
      ('weekly_spin', 'Spin the wire', 'Post a Spin this week.', 1, (select val from spin_count), 15),
      ('weekly_study_wire', 'Study & transmit', 'Finish a lesson and post a Drop this week.', 1, (select val from study_wire), 25),
      ('weekly_crew', 'Squad online', 'Be in a crew this week.', 1, (select val from in_crew), 10)
    ) as t(slug, title, description, target, progress, reward_db)
  )
  select
    d.slug,
    d.title,
    d.description,
    d.target,
    least(d.progress, d.target) as progress,
    d.reward_db,
    exists (
      select 1 from public.community_challenge_completions c, me, wk
      where c.user_id = me.user_id
        and c.challenge_slug = d.slug
        and c.week_key = wk.week_key
    ) as completed
  from defs d, wk;
$$;

-- Triple Signal when at least 3 weekly missions done (of 5)
create or replace function public.community_evaluate_weekly_challenges()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_week text;
  v_granted int := 0;
  ch record;
  v_genre uuid;
  v_done int;
begin
  if v_user is null then
    return 0;
  end if;

  v_week := public.community_current_week_key();

  select primary_genre_id into v_genre from public.profiles where id = v_user;

  for ch in
    select * from public.community_weekly_challenges()
    where progress >= target and not completed
  loop
    insert into public.community_challenge_completions (user_id, challenge_slug, week_key)
    values (v_user, ch.slug, v_week)
    on conflict do nothing;

    if not found then
      continue;
    end if;

    insert into public.community_db_events (user_id, amount, source, source_id, genre_id)
    values (
      v_user,
      ch.reward_db,
      'challenge_' || ch.slug,
      v_week,
      v_genre
    )
    on conflict do nothing;

    if ch.slug = 'weekly_db_75' then
      perform public.community_grant_badge('weekly_warrior');
    end if;

    v_granted := v_granted + 1;
  end loop;

  select count(*)::int into v_done
  from public.community_challenge_completions
  where user_id = v_user and week_key = v_week;

  if v_done >= 3 then
    perform public.community_grant_badge('triple_signal');
  end if;

  return v_granted;
end;
$$;
