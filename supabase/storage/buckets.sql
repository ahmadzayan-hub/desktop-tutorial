-- Mutabasir · Storage buckets
-- Apply after the initial schema migration.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-documents',
  'project-documents',
  false,
  104857600, -- 100 MB per R3.2
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.ms-excel'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public)
values ('dashboard-pdfs', 'dashboard-pdfs', false)
on conflict (id) do nothing;

-- Storage RLS: owner-only access via the project FK on the path prefix.
-- Storage paths follow the pattern {project_id}/{filename}.

drop policy if exists "project_documents_owner_only" on storage.objects;
create policy "project_documents_owner_only" on storage.objects
  for all using (
    bucket_id = 'project-documents'
    and exists (
      select 1 from public.projects p
      where p.id = (split_part(name, '/', 1))::uuid
        and p.owner_id = auth.uid()
    )
  ) with check (
    bucket_id = 'project-documents'
    and exists (
      select 1 from public.projects p
      where p.id = (split_part(name, '/', 1))::uuid
        and p.owner_id = auth.uid()
    )
  );

drop policy if exists "dashboard_pdfs_owner_only" on storage.objects;
create policy "dashboard_pdfs_owner_only" on storage.objects
  for all using (
    bucket_id = 'dashboard-pdfs'
    and exists (
      select 1 from public.projects p
      where p.id = (split_part(name, '/', 1))::uuid
        and p.owner_id = auth.uid()
    )
  ) with check (
    bucket_id = 'dashboard-pdfs'
    and exists (
      select 1 from public.projects p
      where p.id = (split_part(name, '/', 1))::uuid
        and p.owner_id = auth.uid()
    )
  );
