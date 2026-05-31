-- Network presence: last_seen heartbeat + online connections list

alter table public.profiles
  add column if not exists last_seen_at timestamptz;

create index if not exists profiles_last_seen_at_idx
  on public.profiles (last_seen_at desc nulls last)
  where last_seen_at is not null;

-- Viewer updates own presence (called periodically from the app shell).
create or replace function public.network_ping_presence()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  update public.profiles
  set last_seen_at = now()
  where id = auth.uid();
end;
$$;

-- Connected operators who are online within the window (default 3 minutes).
create or replace function public.network_online_connections(p_window_minutes int default 3)
returns table (
  user_id uuid,
  display_name text,
  handle text,
  avatar_url text,
  last_seen_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  with viewer as (
    select auth.uid() as uid
  ),
  window_mins as (
    select greatest(1, least(coalesce(p_window_minutes, 3), 15))::int as mins
  ),
  connected as (
    select
      case
        when c.user_a = v.uid then c.user_b
        else c.user_a
      end as other_id
    from public.network_connections c
    cross join viewer v
    where v.uid is not null
      and (c.user_a = v.uid or c.user_b = v.uid)
  )
  select
    p.id as user_id,
    p.name as display_name,
    coalesce(nullif(trim(p.username), ''), 'member') as handle,
    p.avatar_url,
    p.last_seen_at
  from connected cn
  join public.profiles p on p.id = cn.other_id
  cross join viewer v
  cross join window_mins w
  where cn.other_id <> v.uid
    and p.last_seen_at is not null
    and p.last_seen_at > now() - make_interval(mins => w.mins)
  order by p.last_seen_at desc;
$$;

grant execute on function public.network_ping_presence() to authenticated;
grant execute on function public.network_online_connections(int) to authenticated;
