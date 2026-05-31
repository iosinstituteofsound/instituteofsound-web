-- Fandom / support graph: relationship ledger between supporters and published artists.
-- Support Score is internal (ranking only); public surfaces use ranks/badges, not raw points.

-- ── Post → artist tags (max 3 per post) ─────────────────────────────────
create table if not exists public.community_post_artist_tags (
  post_id uuid not null references public.community_posts (id) on delete cascade,
  artist_profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  primary key (post_id, artist_profile_id),
  constraint community_post_artist_tags_sort check (sort_order between 0 and 2)
);

create index if not exists community_post_artist_tags_artist_idx
  on public.community_post_artist_tags (artist_profile_id, created_at desc);

alter table public.community_post_artist_tags enable row level security;

drop policy if exists "Public read post artist tags" on public.community_post_artist_tags;
create policy "Public read post artist tags"
  on public.community_post_artist_tags for select
  to anon, authenticated
  using (true);

drop policy if exists "Post owners manage artist tags" on public.community_post_artist_tags;
create policy "Post owners manage artist tags"
  on public.community_post_artist_tags for all
  to authenticated
  using (
    exists (
      select 1 from public.community_posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.community_posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  );

-- ── Support event ledger ────────────────────────────────────────────────
create table if not exists public.artist_fandom_events (
  id uuid primary key default gen_random_uuid(),
  supporter_user_id uuid not null references public.profiles (id) on delete cascade,
  artist_profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  action_type text not null check (
    action_type in (
      'review',
      'editorial',
      'tagged_spin',
      'tagged_drop',
      'comment',
      'reaction',
      'share'
    )
  ),
  source_id uuid,
  weight int not null check (weight > 0),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint artist_fandom_events_source_unique
    unique (supporter_user_id, artist_profile_id, action_type, source_id)
);

create index if not exists artist_fandom_events_artist_time_idx
  on public.artist_fandom_events (artist_profile_id, created_at desc);

create index if not exists artist_fandom_events_supporter_time_idx
  on public.artist_fandom_events (supporter_user_id, created_at desc);

create index if not exists artist_fandom_events_artist_90d_idx
  on public.artist_fandom_events (artist_profile_id, created_at desc)
  include (supporter_user_id, weight, action_type);

alter table public.artist_fandom_events enable row level security;

drop policy if exists "Artists read fandom events for own profile" on public.artist_fandom_events;
create policy "Artists read fandom events for own profile"
  on public.artist_fandom_events for select
  to authenticated
  using (
    exists (
      select 1 from public.artist_profiles ap
      where ap.id = artist_profile_id and ap.user_id = auth.uid()
    )
  );

drop policy if exists "Supporters read own fandom events" on public.artist_fandom_events;
create policy "Supporters read own fandom events"
  on public.artist_fandom_events for select
  to authenticated
  using (supporter_user_id = auth.uid());

-- ── All-time aggregates (fast lists; 90d computed from events) ──────────
create table if not exists public.artist_fandom_totals (
  supporter_user_id uuid not null references public.profiles (id) on delete cascade,
  artist_profile_id uuid not null references public.artist_profiles (id) on delete cascade,
  support_score int not null default 0,
  spins int not null default 0,
  drops int not null default 0,
  comments int not null default 0,
  reactions int not null default 0,
  shares int not null default 0,
  reviews int not null default 0,
  editorials int not null default 0,
  first_support_at timestamptz,
  last_support_at timestamptz,
  primary key (supporter_user_id, artist_profile_id)
);

create index if not exists artist_fandom_totals_artist_score_idx
  on public.artist_fandom_totals (artist_profile_id, support_score desc);

create index if not exists artist_fandom_totals_supporter_idx
  on public.artist_fandom_totals (supporter_user_id, support_score desc);

alter table public.artist_fandom_totals enable row level security;

drop policy if exists "Artists read fandom totals for own profile" on public.artist_fandom_totals;
create policy "Artists read fandom totals for own profile"
  on public.artist_fandom_totals for select
  to authenticated
  using (
    exists (
      select 1 from public.artist_profiles ap
      where ap.id = artist_profile_id and ap.user_id = auth.uid()
    )
  );

drop policy if exists "Supporters read own fandom totals" on public.artist_fandom_totals;
create policy "Supporters read own fandom totals"
  on public.artist_fandom_totals for select
  to authenticated
  using (supporter_user_id = auth.uid());

-- ── Weights (internal ranking; not shown as currency) ───────────────────
create or replace function public.fandom_support_weight(p_action text)
returns int
language sql
immutable
as $$
  select case p_action
    when 'review' then 100
    when 'editorial' then 85
    when 'tagged_spin' then 40
    when 'tagged_drop' then 35
    when 'comment' then 25
    when 'reaction' then 8
    when 'share' then 5
    else 0
  end;
$$;

-- ── Record one support event + roll up totals ───────────────────────────
create or replace function public.fandom_record_support(
  p_supporter_id uuid,
  p_artist_profile_id uuid,
  p_action text,
  p_source_id uuid default null,
  p_meta jsonb default '{}'::jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_artist_user uuid;
  v_published boolean;
  v_weight int;
  v_inserted boolean := false;
begin
  if p_supporter_id is null or p_artist_profile_id is null or p_action is null then
    return false;
  end if;

  v_weight := public.fandom_support_weight(p_action);
  if v_weight <= 0 then
    return false;
  end if;

  select ap.user_id, ap.published
  into v_artist_user, v_published
  from public.artist_profiles ap
  where ap.id = p_artist_profile_id;

  if v_artist_user is null or not coalesce(v_published, false) then
    return false;
  end if;

  if v_artist_user = p_supporter_id then
    return false;
  end if;

  insert into public.artist_fandom_events (
    supporter_user_id,
    artist_profile_id,
    action_type,
    source_id,
    weight,
    meta
  )
  values (
    p_supporter_id,
    p_artist_profile_id,
    p_action,
    p_source_id,
    v_weight,
    coalesce(p_meta, '{}'::jsonb)
  )
  on conflict (supporter_user_id, artist_profile_id, action_type, source_id) do nothing
  returning true into v_inserted;

  if not coalesce(v_inserted, false) then
    return false;
  end if;

  insert into public.artist_fandom_totals (
    supporter_user_id,
    artist_profile_id,
    support_score,
    spins,
    drops,
    comments,
    reactions,
    shares,
    reviews,
    editorials,
    first_support_at,
    last_support_at
  )
  values (
    p_supporter_id,
    p_artist_profile_id,
    v_weight,
    case when p_action = 'tagged_spin' then 1 else 0 end,
    case when p_action = 'tagged_drop' then 1 else 0 end,
    case when p_action = 'comment' then 1 else 0 end,
    case when p_action = 'reaction' then 1 else 0 end,
    case when p_action = 'share' then 1 else 0 end,
    case when p_action = 'review' then 1 else 0 end,
    case when p_action = 'editorial' then 1 else 0 end,
    now(),
    now()
  )
  on conflict (supporter_user_id, artist_profile_id) do update set
    support_score = artist_fandom_totals.support_score + excluded.support_score,
    spins = artist_fandom_totals.spins + excluded.spins,
    drops = artist_fandom_totals.drops + excluded.drops,
    comments = artist_fandom_totals.comments + excluded.comments,
    reactions = artist_fandom_totals.reactions + excluded.reactions,
    shares = artist_fandom_totals.shares + excluded.shares,
    reviews = artist_fandom_totals.reviews + excluded.reviews,
    editorials = artist_fandom_totals.editorials + excluded.editorials,
    first_support_at = coalesce(artist_fandom_totals.first_support_at, excluded.first_support_at),
    last_support_at = greatest(artist_fandom_totals.last_support_at, excluded.last_support_at);

  return true;
end;
$$;

-- Credit engagement on a post (comments, reactions, shares) for tagged artists + post author artist
create or replace function public.fandom_credit_post_engagement(
  p_supporter_id uuid,
  p_post_id uuid,
  p_action text,
  p_source_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_owner_profile uuid;
  r record;
begin
  if p_supporter_id is null or p_post_id is null then
    return;
  end if;

  select user_id into v_owner
  from public.community_posts
  where id = p_post_id and status = 'visible';

  if v_owner is null then
    return;
  end if;

  for r in
    select t.artist_profile_id
    from public.community_post_artist_tags t
    where t.post_id = p_post_id
  loop
    perform public.fandom_record_support(
      p_supporter_id,
      r.artist_profile_id,
      p_action,
      coalesce(p_source_id, p_post_id),
      jsonb_build_object('post_id', p_post_id)
    );
  end loop;

  select ap.id into v_owner_profile
  from public.artist_profiles ap
  where ap.user_id = v_owner and ap.published = true
  limit 1;

  if v_owner_profile is not null and v_owner <> p_supporter_id then
    perform public.fandom_record_support(
      p_supporter_id,
      v_owner_profile,
      p_action,
      coalesce(p_source_id, p_post_id),
      jsonb_build_object('post_id', p_post_id, 'via', 'artist_post')
    );
  end if;
end;
$$;

-- Apply tags after post create (max 3 published artists)
create or replace function public.community_set_post_artist_tags(
  p_post_id uuid,
  p_artist_profile_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_kind text;
  v_tag_action text;
  r record;
  v_ids uuid[];
  v_id uuid;
  i int := 0;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select kind into v_kind
  from public.community_posts
  where id = p_post_id and user_id = v_user and status = 'visible';

  if v_kind is null then
    raise exception 'Post not found';
  end if;

  v_tag_action := case v_kind when 'spin' then 'tagged_spin' when 'drop' then 'tagged_drop' else null end;

  delete from public.community_post_artist_tags where post_id = p_post_id;

  v_ids := coalesce(p_artist_profile_ids, '{}'::uuid[]);
  if coalesce(array_length(v_ids, 1), 0) > 3 then
    raise exception 'Maximum 3 artists per post';
  end if;

  foreach v_id in array v_ids loop
    if not exists (
      select 1 from public.artist_profiles ap
      where ap.id = v_id and ap.published = true
    ) then
      raise exception 'Invalid or unpublished artist';
    end if;

    insert into public.community_post_artist_tags (post_id, artist_profile_id, sort_order)
    values (p_post_id, v_id, i)
    on conflict (post_id, artist_profile_id) do nothing;

    if v_tag_action is not null then
      perform public.fandom_record_support(
        v_user,
        v_id,
        v_tag_action,
        p_post_id,
        jsonb_build_object('post_id', p_post_id)
      );
    end if;

    i := i + 1;
  end loop;
end;
$$;

grant execute on function public.community_set_post_artist_tags(uuid, uuid[]) to authenticated;

-- Log share (light weight; deduped per user/post/artist)
create or replace function public.fandom_log_post_share(p_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  perform public.fandom_credit_post_engagement(v_user, p_post_id, 'share', p_post_id);
  return true;
end;
$$;

grant execute on function public.fandom_log_post_share(uuid) to authenticated;

-- Published editorial → support for linked artist (review vs feature)
create or replace function public.fandom_on_editorial_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
begin
  if new.status <> 'published' or old.status = 'published' then
    return new;
  end if;

  if new.artist_profile_id is null then
    return new;
  end if;

  v_action := case when new.type = 'review' then 'review' else 'editorial' end;

  perform public.fandom_record_support(
    new.editor_id,
    new.artist_profile_id,
    v_action,
    new.id,
    jsonb_build_object('editorial_id', new.id, 'type', new.type)
  );

  return new;
end;
$$;

drop trigger if exists editorial_fandom_on_publish on public.editorial_drafts;
create trigger editorial_fandom_on_publish
  after update of status on public.editorial_drafts
  for each row
  execute function public.fandom_on_editorial_published();

-- Patch reaction RPC
create or replace function public.community_toggle_post_reaction(
  p_post_id uuid,
  p_reaction text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_existing text;
  v_owner uuid;
  v_actor_name text;
  v_actor_handle text;
  v_post_kind text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  if p_reaction not in ('fire', 'headphones', 'bolt') then
    raise exception 'Invalid reaction';
  end if;

  select user_id, kind into v_owner, v_post_kind
  from public.community_posts
  where id = p_post_id and status = 'visible';

  if v_owner is null then
    raise exception 'Post not found';
  end if;

  select reaction into v_existing
  from public.community_post_reactions
  where post_id = p_post_id and user_id = v_user;

  if v_existing = p_reaction then
    delete from public.community_post_reactions
    where post_id = p_post_id and user_id = v_user;
    return null;
  end if;

  insert into public.community_post_reactions (post_id, user_id, reaction)
  values (p_post_id, v_user, p_reaction)
  on conflict (post_id, user_id) do update set reaction = excluded.reaction;

  if v_owner <> v_user then
    perform public.fandom_credit_post_engagement(v_user, p_post_id, 'reaction', p_post_id);

    select pr.name,
      coalesce(
        nullif(trim(pr.username), ''),
        nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
        'member'
      )
    into v_actor_name, v_actor_handle
    from public.profiles pr
    where pr.id = v_user;

    perform public.community_enqueue_notification(
      v_owner,
      v_user,
      'reaction',
      coalesce(v_actor_name, 'Someone') || ' reacted to your ' || v_post_kind,
      p_reaction || ' on your transmission',
      '/feed/' || p_post_id::text
    );
  end if;

  return p_reaction;
end;
$$;

-- Patch comment RPC
create or replace function public.community_post_comments_add(
  p_post_id uuid,
  p_body text,
  p_parent_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_owner uuid;
  v_parent_author uuid;
  v_comment_id uuid;
  v_text text;
  v_actor_name text;
  v_actor_handle text;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  v_text := trim(coalesce(p_body, ''));
  if char_length(v_text) < 1 or char_length(v_text) > 500 then
    raise exception 'Comment must be 1–500 characters.';
  end if;

  select user_id into v_owner
  from public.community_posts
  where id = p_post_id and status = 'visible';

  if v_owner is null then
    raise exception 'Post not found';
  end if;

  if p_parent_id is not null then
    select user_id into v_parent_author
    from public.community_post_comments
    where id = p_parent_id and post_id = p_post_id;

    if v_parent_author is null then
      raise exception 'Parent comment not found';
    end if;
  end if;

  insert into public.community_post_comments (post_id, user_id, body, parent_id)
  values (p_post_id, v_user, v_text, p_parent_id)
  returning id into v_comment_id;

  if v_owner <> v_user then
    perform public.fandom_credit_post_engagement(v_user, p_post_id, 'comment', v_comment_id);
  end if;

  select coalesce(nullif(trim(pr.name), ''), 'Someone'),
    coalesce(
      nullif(trim(pr.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    )
  into v_actor_name, v_actor_handle
  from public.profiles pr
  where pr.id = v_user;

  if p_parent_id is not null and v_parent_author is not null and v_parent_author <> v_user then
    perform public.community_enqueue_notification(
      v_parent_author,
      v_user,
      'post_comment',
      coalesce(v_actor_name, 'Someone') || ' replied to your comment',
      left(v_text, 120),
      '/feed/' || p_post_id::text,
      jsonb_build_object('post_id', p_post_id, 'comment_id', v_comment_id, 'parent_id', p_parent_id)
    );
  elsif p_parent_id is null and v_owner <> v_user then
    perform public.community_enqueue_notification(
      v_owner,
      v_user,
      'post_comment',
      coalesce(v_actor_name, 'Someone') || ' commented on your post',
      left(v_text, 120),
      '/feed/' || p_post_id::text,
      jsonb_build_object('post_id', p_post_id, 'comment_id', v_comment_id)
    );
  end if;

  return v_comment_id;
end;
$$;

-- ── Listener: My Fandom (private score + breakdown) ─────────────────────
create or replace function public.fandom_my_artists(
  p_window text default '90d',
  lim int default 50
)
returns table (
  artist_profile_id uuid,
  slug text,
  display_name text,
  avatar_url text,
  support_score int,
  rank_among_my_artists int,
  percentile_label text,
  spins int,
  drops int,
  comments int,
  reactions int,
  shares int,
  reviews int,
  editorials int,
  first_support_at timestamptz,
  last_support_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_since timestamptz;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  v_since := case when p_window = 'all' then null else now() - interval '90 days' end;

  return query
  with scored as (
    select
      e.artist_profile_id,
      sum(e.weight)::int as support_score,
      count(*) filter (where e.action_type = 'tagged_spin')::int as spins,
      count(*) filter (where e.action_type = 'tagged_drop')::int as drops,
      count(*) filter (where e.action_type = 'comment')::int as comments,
      count(*) filter (where e.action_type = 'reaction')::int as reactions,
      count(*) filter (where e.action_type = 'share')::int as shares,
      count(*) filter (where e.action_type = 'review')::int as reviews,
      count(*) filter (where e.action_type = 'editorial')::int as editorials,
      min(e.created_at) as first_support_at,
      max(e.created_at) as last_support_at
    from public.artist_fandom_events e
    where e.supporter_user_id = v_user
      and (v_since is null or e.created_at >= v_since)
    group by e.artist_profile_id
  ),
  ranked as (
    select
      s.*,
      row_number() over (order by s.support_score desc, s.last_support_at desc) as rn,
      count(*) over () as total_artists
    from scored s
  )
  select
    r.artist_profile_id,
    ap.slug,
    ap.display_name,
    ap.avatar_url,
    r.support_score,
    r.rn::int as rank_among_my_artists,
    case
      when r.total_artists <= 1 then 'Core supporter'
      when r.rn <= greatest(1, ceil(r.total_artists * 0.05)::int) then 'Top 5%'
      when r.rn <= greatest(1, ceil(r.total_artists * 0.10)::int) then 'Top 10%'
      when r.last_support_at >= now() - interval '14 days' then 'Rising supporter'
      else null
    end as percentile_label,
    r.spins,
    r.drops,
    r.comments,
    r.reactions,
    r.shares,
    r.reviews,
    r.editorials,
    r.first_support_at,
    r.last_support_at
  from ranked r
  join public.artist_profiles ap on ap.id = r.artist_profile_id
  order by r.rn
  limit greatest(lim, 1);
end;
$$;

grant execute on function public.fandom_my_artists(text, int) to authenticated;

-- ── Artist: Fandom tab (private breakdown) ──────────────────────────────
create or replace function public.fandom_artist_supporters(
  p_window text default '90d',
  lim int default 50
)
returns table (
  supporter_user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  support_score int,
  supporter_rank int,
  badge_label text,
  spins int,
  drops int,
  comments int,
  reactions int,
  shares int,
  reviews int,
  editorials int,
  first_support_at timestamptz,
  last_support_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_profile_id uuid;
  v_since timestamptz;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select ap.id into v_profile_id
  from public.artist_profiles ap
  where ap.user_id = v_user
  limit 1;

  if v_profile_id is null then
    raise exception 'Artist profile required';
  end if;

  v_since := case when p_window = 'all' then null else now() - interval '90 days' end;

  return query
  with scored as (
    select
      e.supporter_user_id,
      sum(e.weight)::int as support_score,
      count(*) filter (where e.action_type = 'tagged_spin')::int as spins,
      count(*) filter (where e.action_type = 'tagged_drop')::int as drops,
      count(*) filter (where e.action_type = 'comment')::int as comments,
      count(*) filter (where e.action_type = 'reaction')::int as reactions,
      count(*) filter (where e.action_type = 'share')::int as shares,
      count(*) filter (where e.action_type = 'review')::int as reviews,
      count(*) filter (where e.action_type = 'editorial')::int as editorials,
      min(e.created_at) as first_support_at,
      max(e.created_at) as last_support_at
    from public.artist_fandom_events e
    where e.artist_profile_id = v_profile_id
      and (v_since is null or e.created_at >= v_since)
    group by e.supporter_user_id
  ),
  ranked as (
    select
      s.*,
      row_number() over (order by s.support_score desc, s.last_support_at desc) as rn
    from scored s
  )
  select
    r.supporter_user_id,
    pr.name as display_name,
    coalesce(
      nullif(trim(pr.username), ''),
      nullif(trim(both '_' from regexp_replace(lower(split_part(pr.email, '@', 1)), '[^a-z0-9_]', '_', 'g')), ''),
      'member'
    ) as handle,
    pr.avatar_url,
    r.support_score,
    r.rn::int as supporter_rank,
    case
      when r.rn = 1 then '#1 Supporter'
      when r.rn = 2 then '#2 Supporter'
      when r.rn = 3 then '#3 Supporter'
      when r.rn <= greatest(3, ceil((select count(*) from ranked) * 0.05)::int) then 'Top 5%'
      when r.rn <= greatest(5, ceil((select count(*) from ranked) * 0.10)::int) then 'Top 10%'
      when r.last_support_at >= now() - interval '14 days' then 'Rising supporter'
      else null
    end as badge_label,
    r.spins,
    r.drops,
    r.comments,
    r.reactions,
    r.shares,
    r.reviews,
    r.editorials,
    r.first_support_at,
    r.last_support_at
  from ranked r
  join public.profiles pr on pr.id = r.supporter_user_id
  order by r.rn
  limit greatest(lim, 1);
end;
$$;

grant execute on function public.fandom_artist_supporters(text, int) to authenticated;

-- Recent support (artist dashboard)
create or replace function public.fandom_artist_recent_support(lim int default 20)
returns table (
  supporter_user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  action_type text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_profile_id uuid;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select ap.id into v_profile_id
  from public.artist_profiles ap
  where ap.user_id = v_user
  limit 1;

  if v_profile_id is null then
    raise exception 'Artist profile required';
  end if;

  return query
  select
    e.supporter_user_id,
    pr.name as display_name,
    coalesce(nullif(trim(pr.username), ''), 'member') as handle,
    pr.avatar_url,
    e.action_type,
    e.created_at
  from public.artist_fandom_events e
  join public.profiles pr on pr.id = e.supporter_user_id
  where e.artist_profile_id = v_profile_id
  order by e.created_at desc
  limit greatest(lim, 1);
end;
$$;

grant execute on function public.fandom_artist_recent_support(int) to authenticated;

-- Content champions: most tagged spins/drops + reviews
create or replace function public.fandom_artist_content_champions(
  p_window text default '90d',
  lim int default 10
)
returns table (
  supporter_user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  content_score int,
  spins int,
  drops int,
  reviews int,
  editorials int
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_profile_id uuid;
  v_since timestamptz;
begin
  if v_user is null then
    raise exception 'Not authenticated';
  end if;

  select ap.id into v_profile_id
  from public.artist_profiles ap
  where ap.user_id = v_user
  limit 1;

  if v_profile_id is null then
    raise exception 'Artist profile required';
  end if;

  v_since := case when p_window = 'all' then null else now() - interval '90 days' end;

  return query
  select
    e.supporter_user_id,
    pr.name as display_name,
    coalesce(nullif(trim(pr.username), ''), 'member') as handle,
    pr.avatar_url,
    sum(e.weight)::int as content_score,
    count(*) filter (where e.action_type = 'tagged_spin')::int as spins,
    count(*) filter (where e.action_type = 'tagged_drop')::int as drops,
    count(*) filter (where e.action_type = 'review')::int as reviews,
    count(*) filter (where e.action_type = 'editorial')::int as editorials
  from public.artist_fandom_events e
  join public.profiles pr on pr.id = e.supporter_user_id
  where e.artist_profile_id = v_profile_id
    and e.action_type in ('tagged_spin', 'tagged_drop', 'review', 'editorial')
    and (v_since is null or e.created_at >= v_since)
  group by e.supporter_user_id, pr.name, pr.username, pr.avatar_url
  order by content_score desc, max(e.created_at) desc
  limit greatest(lim, 1);
end;
$$;

grant execute on function public.fandom_artist_content_champions(text, int) to authenticated;

-- Public badges only (no exact score)
create or replace function public.fandom_public_supporter_badge(
  p_artist_profile_id uuid,
  p_supporter_user_id uuid default null
)
returns table (
  supporter_user_id uuid,
  badge_label text,
  supporter_rank int
)
language sql
stable
security definer
set search_path = public
as $$
  with target as (
    select coalesce(p_supporter_user_id, auth.uid()) as uid
  ),
  scored as (
    select
      e.supporter_user_id,
      sum(e.weight) as support_score,
      max(e.created_at) as last_at
    from public.artist_fandom_events e
    where e.artist_profile_id = p_artist_profile_id
      and e.created_at >= now() - interval '90 days'
    group by e.supporter_user_id
  ),
  ranked as (
    select
      s.supporter_user_id,
      row_number() over (order by s.support_score desc, s.last_at desc) as rn,
      count(*) over () as total
    from scored s
  )
  select
    r.supporter_user_id,
    case
      when r.rn = 1 then '#1 Supporter'
      when r.rn = 2 then '#2 Supporter'
      when r.rn = 3 then '#3 Supporter'
      when r.rn <= greatest(3, ceil(r.total * 0.05)::int) then 'Top 5%'
      when r.rn <= greatest(5, ceil(r.total * 0.10)::int) then 'Top 10%'
      else null
    end as badge_label,
    r.rn::int as supporter_rank
  from ranked r
  cross join target t
  where r.supporter_user_id = t.uid;
$$;

grant execute on function public.fandom_public_supporter_badge(uuid, uuid) to anon, authenticated;

-- Search published artists for tag picker
create or replace function public.fandom_search_artists(q text, lim int default 12)
returns table (
  id uuid,
  slug text,
  display_name text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ap.id,
    ap.slug,
    ap.display_name,
    ap.avatar_url
  from public.artist_profiles ap
  where ap.published = true
    and (
      coalesce(q, '') = ''
      or ap.display_name ilike '%' || q || '%'
      or ap.slug ilike '%' || q || '%'
    )
  order by ap.display_name
  limit greatest(lim, 1);
$$;

grant execute on function public.fandom_search_artists(text, int) to authenticated;
