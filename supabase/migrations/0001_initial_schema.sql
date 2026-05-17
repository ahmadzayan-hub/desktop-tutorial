-- Mutabasir · Initial schema
-- Rule R4: RLS enabled on every table. Every query path has a policy.

-- ============================================================================
-- Extensions
-- ============================================================================
create extension if not exists "pgcrypto" with schema public;
create extension if not exists "uuid-ossp" with schema public;

-- ============================================================================
-- Enums
-- ============================================================================
do $$ begin
  create type subject_type as enum ('contract_management', 'tender_evaluation');
exception when duplicate_object then null; end $$;

do $$ begin
  create type rag_status as enum ('green', 'amber', 'red', 'draft');
exception when duplicate_object then null; end $$;

do $$ begin
  create type theme_id as enum (
    'civic', 'petrol', 'sand', 'rail',
    'utility', 'guardian', 'slate', 'custom'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type document_type as enum (
    'contract',
    'monthly_progress_report',
    'bafo',
    'meeting_minutes',
    'invoice',
    'technical_note',
    'tender_submission',
    'evaluation_criteria',
    'unknown'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type confidence_level as enum ('HIGH', 'MEDIUM', 'LOW');
exception when duplicate_object then null; end $$;

do $$ begin
  create type audience_type as enum (
    'director', 'ceo', 'board', 'internal_team', 'external_client'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type locale_code as enum ('en', 'ar');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- Table: profiles  (1:1 with auth.users)
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  preferred_locale locale_code not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_self_insert" on public.profiles;
create policy "profiles_self_insert" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ============================================================================
-- Table: projects
-- ============================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 200),
  subject subject_type not null,
  theme theme_id not null default 'civic',
  client_authority_en text,
  client_authority_ar text,
  counterparty_en text,
  counterparty_ar text,
  start_date date,
  end_date date,
  status rag_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_dates_chk check (
    start_date is null or end_date is null or end_date >= start_date
  )
);

create index if not exists projects_owner_idx on public.projects(owner_id);
create index if not exists projects_created_idx on public.projects(created_at desc);

alter table public.projects enable row level security;

drop policy if exists "projects_owner_select" on public.projects;
create policy "projects_owner_select" on public.projects
  for select using (auth.uid() = owner_id);

drop policy if exists "projects_owner_insert" on public.projects;
create policy "projects_owner_insert" on public.projects
  for insert with check (auth.uid() = owner_id);

drop policy if exists "projects_owner_update" on public.projects;
create policy "projects_owner_update" on public.projects
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "projects_owner_delete" on public.projects;
create policy "projects_owner_delete" on public.projects
  for delete using (auth.uid() = owner_id);

-- ============================================================================
-- Table: documents
-- ============================================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  filename text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 104857600),
  document_type document_type not null default 'unknown',
  classification_confidence confidence_level,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists documents_project_idx on public.documents(project_id);
create index if not exists documents_type_idx on public.documents(document_type);

alter table public.documents enable row level security;

drop policy if exists "documents_via_project" on public.documents;
create policy "documents_via_project" on public.documents
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = documents.project_id and p.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = documents.project_id and p.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- Table: extracted_facts
-- ============================================================================
create table if not exists public.extracted_facts (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  fact_type text not null,
  payload_json jsonb not null,
  citation_page integer check (citation_page is null or citation_page >= 1),
  citation_quote text check (citation_quote is null or char_length(citation_quote) <= 300),
  confidence confidence_level not null,
  user_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists facts_project_idx on public.extracted_facts(project_id);
create index if not exists facts_document_idx on public.extracted_facts(document_id);
create index if not exists facts_type_idx on public.extracted_facts(fact_type);
create index if not exists facts_payload_gin on public.extracted_facts using gin (payload_json);

alter table public.extracted_facts enable row level security;

drop policy if exists "facts_via_project" on public.extracted_facts;
create policy "facts_via_project" on public.extracted_facts
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = extracted_facts.project_id and p.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = extracted_facts.project_id and p.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- Table: briefs
-- ============================================================================
create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  text_en text not null check (char_length(text_en) between 10 and 4000),
  audience audience_type not null default 'director',
  created_at timestamptz not null default now()
);

create index if not exists briefs_project_idx on public.briefs(project_id);

alter table public.briefs enable row level security;

drop policy if exists "briefs_via_project" on public.briefs;
create policy "briefs_via_project" on public.briefs
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = briefs.project_id and p.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = briefs.project_id and p.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- Table: snapshots  (composed dashboards, versioned)
-- ============================================================================
create table if not exists public.snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  brief_id uuid references public.briefs(id) on delete set null,
  composition_json jsonb not null,
  quality_gate_json jsonb,
  rendered_html text,
  pdf_storage_path text,
  share_token text unique,
  published boolean not null default false,
  override_note text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists snapshots_project_idx on public.snapshots(project_id);
create index if not exists snapshots_share_idx on public.snapshots(share_token) where share_token is not null;

alter table public.snapshots enable row level security;

drop policy if exists "snapshots_via_project" on public.snapshots;
create policy "snapshots_via_project" on public.snapshots
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = snapshots.project_id and p.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      where p.id = snapshots.project_id and p.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- Trigger: updated_at maintenance
-- ============================================================================
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.tg_set_updated_at();

drop trigger if exists set_updated_at_projects on public.projects;
create trigger set_updated_at_projects
  before update on public.projects
  for each row execute function public.tg_set_updated_at();

-- ============================================================================
-- Trigger: auto-provision profile on new user
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
