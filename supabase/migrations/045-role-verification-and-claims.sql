-- Role-wise proofs + mutual confirmation claims for authentic network trust.

create table if not exists public.role_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_type text not null check (role_type in ('artist_manager', 'label', 'event_promoter', 'brand')),
  proof_links text[] not null default '{}',
  artist_confirmation_link text,
  website_domain text,
  official_email text,
  venue_partner_reference text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.role_verification_requests enable row level security;

create unique index if not exists role_verification_unique_pending_idx
  on public.role_verification_requests (user_id, role_type, status)
  where status = 'pending';

alter table public.role_verification_requests
  drop constraint if exists role_verification_requests_required_proofs_check;

alter table public.role_verification_requests
  add constraint role_verification_requests_required_proofs_check
  check (
    case
      when role_type = 'artist_manager' then
        coalesce(array_length(proof_links, 1), 0) >= 1
        and artist_confirmation_link is not null
      when role_type = 'label' then
        website_domain is not null
        and coalesce(array_length(proof_links, 1), 0) >= 2
      when role_type = 'event_promoter' then
        venue_partner_reference is not null
        and coalesce(array_length(proof_links, 1), 0) >= 2
      when role_type = 'brand' then
        official_email is not null
        and coalesce(array_length(proof_links, 1), 0) >= 1
      else false
    end
  );

drop policy if exists "Users create own verification requests" on public.role_verification_requests;
create policy "Users create own verification requests"
  on public.role_verification_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users read own verification requests" on public.role_verification_requests;
create policy "Users read own verification requests"
  on public.role_verification_requests for select
  using (auth.uid() = user_id or public.is_super_editor());

drop policy if exists "Users update own pending verification requests" on public.role_verification_requests;
create policy "Users update own pending verification requests"
  on public.role_verification_requests for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Super editors update verification requests" on public.role_verification_requests;
create policy "Super editors update verification requests"
  on public.role_verification_requests for update
  using (public.is_super_editor());

create table if not exists public.relationship_claims (
  id uuid primary key default gen_random_uuid(),
  claim_type text not null check (claim_type in ('manager_artist', 'label_artist', 'promoter_partner')),
  claimant_user_id uuid not null references public.profiles (id) on delete cascade,
  target_user_id uuid not null references public.profiles (id) on delete cascade,
  evidence_links text[] not null default '{}',
  note text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  resolved_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (claimant_user_id <> target_user_id),
  check (coalesce(array_length(evidence_links, 1), 0) >= 1)
);

alter table public.relationship_claims enable row level security;

drop policy if exists "Users create relationship claims" on public.relationship_claims;
create policy "Users create relationship claims"
  on public.relationship_claims for insert
  with check (auth.uid() = claimant_user_id);

drop policy if exists "Users read own relationship claims" on public.relationship_claims;
create policy "Users read own relationship claims"
  on public.relationship_claims for select
  using (
    auth.uid() = claimant_user_id
    or auth.uid() = target_user_id
    or public.is_super_editor()
  );

drop policy if exists "Targets resolve relationship claims" on public.relationship_claims;
create policy "Targets resolve relationship claims"
  on public.relationship_claims for update
  using (auth.uid() = target_user_id and status = 'pending')
  with check (auth.uid() = target_user_id and status in ('approved', 'rejected'));

drop policy if exists "Claimants cancel pending relationship claims" on public.relationship_claims;
create policy "Claimants cancel pending relationship claims"
  on public.relationship_claims for update
  using (auth.uid() = claimant_user_id and status = 'pending')
  with check (auth.uid() = claimant_user_id and status = 'cancelled');

drop policy if exists "Super editors update relationship claims" on public.relationship_claims;
create policy "Super editors update relationship claims"
  on public.relationship_claims for update
  using (public.is_super_editor());

comment on table public.role_verification_requests is
  'Role proof submissions for artist managers, labels, promoters, and brands.';

comment on table public.relationship_claims is
  'Mutual-confirmation claims (manager→artist, label→artist/manager, promoter→partner).';
