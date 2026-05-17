-- ============================================================================
-- Mutabasir · Phase 3a initial schema
-- ----------------------------------------------------------------------------
-- Tables:  profiles · projects · documents · extracted_facts · briefs ·
--          snapshots
-- Auth:    Supabase Auth (auth.users); profile auto-created on signup
-- Security: row-level security; owner-only access on all tables;
--          public snapshot read via SECURITY DEFINER function
--          (snapshot_by_share_token).
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type project_subject as enum (
    'contract_management',
    'tender_evaluation',
    'operations_maintenance',
    'construction'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum (
    'draft','green','amber','red','watch','published'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type confidence_level as enum ('HIGH','MEDIUM','LOW');
exception when duplicate_object then null; end $$;

do $$ begin
  create type brief_audience as enum (
    'director','ceo','board','internal_team','external_client'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  locale text not null default 'en' check (locale in ('en','ar')),
  default_theme text not null default 'civic',
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject project_subject not null,
  theme text not null default 'civic',
  client_authority_en text,
  client_authority_ar text,
  counterparty_en text,
  counterparty_ar text,
  start_date date,
  end_date date,
  status project_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_owner_created_idx
  on public.projects (owner_id, created_at desc);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  filename text not null,
  mime_type text not null,
  size_bytes bigint not null,
  document_type text not null,
  classification_confidence text not null,
  preview_text text,
  storage_path text,
  created_at timestamptz not null default now()
);
create index if not exists documents_project_idx
  on public.documents (project_id);

create table if not exists public.extracted_facts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  fact_type text not null,
  payload_json jsonb not null,
  citation_page integer,
  citation_quote text,
  confidence confidence_level not null default 'MEDIUM',
  user_verified boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists facts_project_idx
  on public.extracted_facts (project_id);

create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  text_en text not null,
  text_ar text not null,
  audience brief_audience not null,
  created_at timestamptz not null default now()
);
create index if not exists briefs_project_created_idx
  on public.briefs (project_id, created_at desc);

create table if not exists public.snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  brief_id uuid references public.briefs(id) on delete set null,
  share_token text not null unique,
  published boolean not null default true,
  quality_json jsonb not null,
  override_note text,
  created_at timestamptz not null default now()
);
create index if not exists snapshots_project_created_idx
  on public.snapshots (project_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Auto-create profile row on auth.users insert
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Touch updated_at on projects
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.documents enable row level security;
alter table public.extracted_facts enable row level security;
alter table public.briefs enable row level security;
alter table public.snapshots enable row level security;

-- Profile policies
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (auth.uid() = user_id);

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Project policies (owner-only)
drop policy if exists projects_owner_read on public.projects;
create policy projects_owner_read on public.projects
  for select using (auth.uid() = owner_id);

drop policy if exists projects_owner_insert on public.projects;
create policy projects_owner_insert on public.projects
  for insert with check (auth.uid() = owner_id);

drop policy if exists projects_owner_update on public.projects;
create policy projects_owner_update on public.projects
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists projects_owner_delete on public.projects;
create policy projects_owner_delete on public.projects
  for delete using (auth.uid() = owner_id);

-- Child tables: access via parent project ownership
do $$
declare
  child text;
begin
  for child in
    select unnest(array['documents','extracted_facts','briefs','snapshots'])
  loop
    execute format($f$drop policy if exists %1$s_owner on public.%1$s$f$, child);
    execute format($f$
      create policy %1$s_owner on public.%1$s
        for all
        using (
          exists (
            select 1 from public.projects p
            where p.id = %1$s.project_id and p.owner_id = auth.uid()
          )
        )
        with check (
          exists (
            select 1 from public.projects p
            where p.id = %1$s.project_id and p.owner_id = auth.uid()
          )
        )
    $f$, child);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Public read: snapshot by share token
-- ---------------------------------------------------------------------------
-- Returns the snapshot row joined with its project + brief for the
-- /p/<share_token> public view. SECURITY DEFINER bypasses RLS, so we
-- explicitly filter on published = true.

create or replace function public.snapshot_by_share_token(token text)
returns table (
  id uuid,
  project_id uuid,
  brief_id uuid,
  share_token text,
  quality_json jsonb,
  override_note text,
  created_at timestamptz,
  project_name text,
  project_subject project_subject,
  project_theme text,
  project_status project_status,
  project_authority_en text,
  project_authority_ar text,
  project_counterparty_en text,
  project_counterparty_ar text,
  brief_text_en text,
  brief_text_ar text,
  brief_audience brief_audience
)
language sql
security definer
set search_path = public
stable
as $$
  select
    s.id, s.project_id, s.brief_id, s.share_token,
    s.quality_json, s.override_note, s.created_at,
    p.name, p.subject, p.theme, p.status,
    p.client_authority_en, p.client_authority_ar,
    p.counterparty_en, p.counterparty_ar,
    b.text_en, b.text_ar, b.audience
  from public.snapshots s
  join public.projects p on p.id = s.project_id
  left join public.briefs b on b.id = s.brief_id
  where s.share_token = token and s.published = true;
$$;

revoke all on function public.snapshot_by_share_token(text) from public;
grant execute on function public.snapshot_by_share_token(text) to anon, authenticated;
